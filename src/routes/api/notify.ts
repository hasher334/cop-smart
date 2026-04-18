import { createFileRoute } from "@tanstack/react-router";

/**
 * Simple form-notification endpoint.
 * Sends form submissions directly to arodseo@gmail.com via Resend.
 * No queue, no cron, no DB — just a single API call.
 */

const RECIPIENT = "arodseo@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend/emails";

interface NotifyBody {
  formType: string;
  fields: Array<{ label: string; value: string }>;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function handle(request: Request): Promise<Response> {
  let body: NotifyBody;
  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.formType || !Array.isArray(body?.fields)) {
    return Response.json({ ok: false, error: "Missing formType or fields" }, { status: 400 });
  }

  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    console.error("notify: missing LOVABLE_API_KEY or RESEND_API_KEY");
    return Response.json({ ok: false, error: "Email not configured" }, { status: 500 });
  }

  const submittedAt =
    new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " ET";

  const rows = body.fields
    .map(
      (f) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#13243A;vertical-align:top;width:160px;">${escapeHtml(
          f.label,
        )}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0D141E;white-space:pre-wrap;">${escapeHtml(
          f.value || "—",
        )}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#fff;padding:24px;color:#0D141E;">
  <h2 style="margin:0 0 8px;color:#13243A;">New ${escapeHtml(body.formType)}</h2>
  <p style="margin:0 0 16px;color:#4B5563;font-size:13px;">Submitted ${escapeHtml(submittedAt)}</p>
  <table style="border-collapse:collapse;width:100%;max-width:640px;border:1px solid #eee;">${rows}</table>
  </body></html>`;

  const text = `New ${body.formType}\nSubmitted ${submittedAt}\n\n${body.fields
    .map((f) => `${f.label}: ${f.value || "—"}`)
    .join("\n")}`;

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VolCop Forms <onboarding@resend.dev>",
      to: [RECIPIENT],
      reply_to: body.fields.find((f) => /email/i.test(f.label))?.value || undefined,
      subject: `[VolCop] ${body.formType}`,
      html,
      text,
    }),
  });

  const respText = await res.text();
  if (!res.ok) {
    console.error("notify: Resend error", res.status, respText);
    return Response.json({ ok: false, error: `Resend ${res.status}` }, { status: 502 });
  }

  return Response.json({ ok: true });
}

export const Route = createFileRoute("/api/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
    },
  },
});
