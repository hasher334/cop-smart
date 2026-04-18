

### Root cause confirmed

The cron is hitting the route every 5 seconds and getting `200` back, but **`read_ct` on every queue message is still `0`**. That means the handler is never actually reading the queue.

Two confirmed problems:

1. **HTTP method mismatch.** Server logs show `GET https://volcop.com/lovable/email/queue/process → 200`, but the route file only registers a `POST` handler. The 200 is likely a default fall-through, not the queue processor running. The cron's `net.http_post` is being logged as GET in worker logs — regardless, the real handler is not executing.

2. **Even if POST were hitting, the cron auth would also need to match.** Need to also accept GET (or change cron to a method the route handles).

### Fix

Update `src/routes/lovable/email/queue/process.ts` to register the same handler under **both `GET` and `POST`** (sharing one implementation). This guarantees that whichever method the cron / pg_net actually sends, the queue gets drained.

No other changes:
- Auth check stays (Bearer service role key).
- Cron job stays as-is (already pointing at production URL with correct vault secret).
- DB schema, queues, secrets — all already correct.

### Verification after deploy

1. Wait ~10 seconds for one cron tick.
2. Re-query `pgmq.q_transactional_emails` — `read_ct` should be > 0 (or rows gone).
3. Re-query `email_send_log` — recent rows should flip from `pending` to `sent`.
4. Confirm receipt in inbox.

### Files to change
- `src/routes/lovable/email/queue/process.ts` — add `GET` handler that delegates to the same logic as `POST`.

