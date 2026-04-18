/**
 * Helper for sending transactional emails via the internal server route.
 * Calls /lovable/email/transactional/send with the user's Supabase JWT.
 */
import { supabase } from "@/integrations/supabase/client";

export interface SendTransactionalEmailParams {
  templateName: string;
  recipientEmail: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    const res = await fetch("/lovable/email/transactional/send", {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("sendTransactionalEmail failed", res.status, text);
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.warn("sendTransactionalEmail error", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Notification recipients for marketing-site form submissions. */
export const FORM_NOTIFICATION_RECIPIENTS = [
  "jordank@volcop.com",
  "arodseo@gmail.com",
];

/** Send the same notification to all recipients in parallel. */
export async function notifyFormRecipients(args: {
  formType: string;
  submissionId: string;
  fields: Array<{ label: string; value: string }>;
}) {
  const submittedAt = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  }) + " ET";

  await Promise.allSettled(
    FORM_NOTIFICATION_RECIPIENTS.map((to) =>
      sendTransactionalEmail({
        templateName: "form-submission-notification",
        recipientEmail: to,
        idempotencyKey: `${args.submissionId}-${to}`,
        templateData: {
          formType: args.formType,
          submittedAt,
          fields: args.fields,
        },
      }),
    ),
  );
}
