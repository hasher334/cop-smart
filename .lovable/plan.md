
Looking at the email send route, the only thing `supabaseAdmin` is used for is:
1. Checking the `suppressed_emails` table (suppression list for unsubscribes/bounces)
2. Recording the unsubscribe token in `email_unsubscribe_tokens`
3. Logging the send attempt to `email_send_log`
4. Enqueuing via `enqueue_email` RPC (pgmq)

These are all **required** parts of Lovable's transactional email infrastructure — suppression checks, unsubscribe tokens, send logging, and the queue dispatcher. Removing them would break compliance (CAN-SPAM unsubscribe), bounce handling, and the retry/queue system.

**However** — for the immediate bug (emails failing because `SUPABASE_SERVICE_ROLE_KEY` is missing in the Worker runtime), there's a simpler question: do we need the `supabaseAdmin` (service role) client, or can we use the regular `supabase` client?

Answer: We need service role because:
- `suppressed_emails`, `email_unsubscribe_tokens`, `email_send_log` are RLS-protected tables that anonymous/user JWTs cannot write to
- `enqueue_email` is a SECURITY DEFINER RPC, but inserts to log tables still need elevated privileges

### Real root cause

The `SUPABASE_SERVICE_ROLE_KEY` IS configured (it shows in the secrets list). The issue is that in TanStack Start's Cloudflare Worker build, `process.env.SUPABASE_SERVICE_ROLE_KEY` may not be populated the same way as in Node SSR. The fix from last turn (local `getSupabaseAdmin()` helper) should work — but we need to verify by reading the current state of the file and the actual server logs.

### Plan

1. Read the current `src/routes/lovable/email/transactional/send.ts` to confirm last edit landed correctly.
2. Check actual server logs from the most recent submission to see the real error (not assumed).
3. If `SUPABASE_SERVICE_ROLE_KEY` truly isn't reaching the Worker, the fix is to ensure it's read from the correct env source — Cloudflare Workers expose secrets via `globalThis` bindings or the request `env`, not always `process.env`. May need to use TanStack Start's getEvent/context to access bindings.
4. Answer the user's direct question in chat: **Yes, Supabase is required** for the email infrastructure (suppression, unsubscribe, logging, queue). We can't remove it without breaking compliance.

### Direct answer to the user's question

**Yes** — Supabase is required for the email pipeline. It's not just storing data; it powers:
- Unsubscribe link generation/validation (legal compliance)
- Suppression list (preventing emails to bounced/complained addresses)
- Send log + queue (retries, rate limiting)

The current bug isn't because we're using Supabase — it's because the **service role key isn't reaching the production Worker runtime correctly**. That's what needs fixing.

### Proposed next step

Switch to default mode and:
1. View current `send.ts` to confirm state
2. Pull server logs from the last submission to see the actual error message
3. Fix env var access for the Worker runtime (likely needs `getRequestEvent().context.cloudflare.env` or similar pattern)
