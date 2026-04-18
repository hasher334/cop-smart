
What I verified:
- The app email sender is now enqueuing successfully. Production logs show `POST /lovable/email/transactional/send → 200` and `Transactional email enqueued` for both recipients.
- The sender domain `notify.volcop.com` is verified.
- The recipients are not suppressed.
- `email_send_log` contains only `pending` rows, not `sent` rows.
- The current blocker is not the send secret anymore.

Root cause:
- The queue dispatcher cron job is still pointing to the old preview URL, not the live site.
- Current cron target:
  `https://id-preview--9dd4191b-5a55-4efa-a125-32ec5a6b3e86.lovable.app/lovable/email/queue/process?...`
- Because of that, emails get queued but never drained in production, so nothing is actually delivered.

Why this proves the secret is not the current issue:
- The send route is successfully reading the service-role-backed tables and inserting:
  - `email_unsubscribe_tokens`
  - `email_send_log`
  - queue entries via `enqueue_email`
- If the service role secret were still wrong, those writes would be failing before the emails reached `pending`.

Implementation plan:
1. Stop chasing the send-route secret and treat the queue job as the real failure point.
2. Refresh the email infrastructure so the queue processor cron job is recreated against the published/live app URL and the queue auth secret is refreshed at the same time.
3. Re-check the cron job definition to confirm it now targets the live domain instead of the preview domain.
4. Submit one fresh demo form after the cron fix.
5. Verify success in two places:
   - production logs show requests hitting `/lovable/email/queue/process`
   - `email_send_log` gains `sent` entries instead of remaining `pending`
6. If delivery still fails after the cron target is corrected, then inspect the queue processor logs specifically for provider-side errors, but only after confirming the cron is calling the correct live endpoint.

Technical details:
- Current evidence chain:
  - send route works
  - domain verified
  - no suppression
  - queue exists
  - cron exists
  - cron target is wrong
- This means the system is stuck between “queued” and “processed.”
- The most likely concrete fix is to re-run the backend email infrastructure setup so it updates:
  - the cron job URL
  - the queue auth secret used by that cron job
- After that, the expected state change is:
  `pending -> sent`

Expected outcome after implementation:
- New demo/contact form submissions will enqueue and then actually send.
- Existing pending rows may also begin draining once the cron job points to the correct live endpoint.
