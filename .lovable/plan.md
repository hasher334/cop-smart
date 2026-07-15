## Goal
Let signed-out volunteers reset their password securely via an emailed link.

## New pages
- **`src/routes/forgot-password.tsx`** — public page with an email input. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`. Always shows a generic "If that email exists, we sent a reset link" success message (no account enumeration). Rate-limited by the submit button state.
- **`src/routes/reset-password.tsx`** — public page that:
  - Verifies the URL hash contains a Supabase `type=recovery` session (redirects to `/forgot-password` with an error otherwise).
  - Renders a "new password" + "confirm password" form.
  - Validates: min 8 chars, matches confirmation, not identical to email.
  - Calls `supabase.auth.updateUser({ password })`, then signs the user out and redirects to `/login` with a success toast (forces a fresh login with the new credentials).

## Login page update
- `src/routes/login.tsx` — add a "Forgot password?" `<Link to="/forgot-password">` under the password field.

## Security considerations
- Generic response on the request page (no "email not found" leak).
- Reset page rejects sessions that aren't `recovery` type so an attacker with a stolen non-recovery link can't change the password.
- Enforce 8+ char password (matches signup) and confirmation match client-side; Supabase enforces server-side.
- Sign out after reset so any pre-existing sessions on other devices don't remain silently valid on this device.
- Both routes are public (not under `_authenticated`), as required for password recovery.

## Out of scope
- Custom-branded Supabase recovery email template (default template is used). If you want the email itself styled with VolSmart branding, that's a follow-up using the auth email templates tool.
