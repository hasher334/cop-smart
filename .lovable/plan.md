
The user wants form submissions from VolCop marketing site + CopSmart app routed to two emails: jordank@volcom.com and arodseo@gmail.com.

## Forms inventory
Let me identify what forms exist:
1. **Demo request** (`/demo`) — inserts to `demo_requests` table
2. **Contact** (`/contact`) — need to check if form exists
3. **Signup** (`/signup`) — auth, not really a "contact" form

Likely also: any newsletter/CTA on marketing pages.

## Approach

Use Lovable's built-in email system to send notification emails to both recipients whenever a form is submitted. This requires:

1. **Email domain setup** — no email domain configured yet, need to set one up first (sender domain like `notify.volcop.com`)
2. **Email infrastructure** — pgmq queue, dispatcher, tables
3. **Transactional email scaffold** — the send route + templates
4. **Notification template** — a "New form submission" email with all the details (form type, name, agency, message, etc.)
5. **Wire up triggers** — call the send function from:
   - `/demo` form submit (after the insert succeeds)
   - `/contact` form submit (need to inspect)
   - Any other forms found

Recipients are hardcoded in the trigger calls (or in a constant): `jordank@volcom.com`, `arodseo@gmail.com`.

Note: since these are internal notifications going to YOUR team (not the form submitter), each send is one trigger → one recipient, called twice (once per recipient) per submission. That stays within transactional rules.

## What I need from you

Before building, two quick decisions:

1. **Sender domain** — what subdomain should emails come from? Recommended: `notify.volcop.com` (you own volcop.com). The "from" address would be something like `forms@notify.volcop.com`.

2. **Confirm the email** — you wrote `jordank@volcom.com` (volcom, not volcop). Did you mean `jordank@volcop.com`? Please confirm the exact spelling.

3. **Also send a confirmation to the form submitter?** (e.g., "Thanks for requesting a demo, we'll be in touch") — or just internal notifications to your team?

## Plan steps (after you confirm above)

1. Inspect `/contact` and any other marketing forms to get full inventory
2. Set up email domain (`notify.volcop.com`) — opens setup dialog for DNS
3. Set up email infrastructure (queue, tables, cron)
4. Scaffold transactional email system
5. Create `form-submission-notification` React Email template (shows form type + all fields)
6. Optionally create `submitter-confirmation` template
7. Add `NOTIFICATION_RECIPIENTS = ['jordank@volcop.com', 'arodseo@gmail.com']` constant
8. Wire trigger into `/demo` submit handler — loop the 2 recipients
9. Wire trigger into `/contact` submit handler
10. Test end-to-end

Please answer the 3 questions above and I'll proceed.
