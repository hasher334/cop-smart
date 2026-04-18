/**
 * Simple form-notification helper.
 * POSTs form submissions to /api/notify, which emails arodseo@gmail.com via Resend.
 * No auth, no queue, no DB — direct send.
 */

export interface NotifyFormArgs {
  formType: string;
  fields: Array<{ label: string; value: string }>;
}

export async function notifyFormRecipients(args: NotifyFormArgs): Promise<{ ok: boolean }> {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      console.warn("notifyFormRecipients failed", res.status);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn("notifyFormRecipients error", err);
    return { ok: false };
  }
}
