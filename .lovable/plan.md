## Fix shift dialog: scrolling + assignment FK error

**Two issues in `src/components/schedule/shift-form-dialog.tsx`:**

### 1. FK violation on `volunteer_1`
The assignee dropdown loads `profiles.id` and writes it into `volunteer_1` / `reserved_by` / `assigned_to`. Those columns are FKs to `auth.users(id)` (i.e. `profiles.user_id`), not `profiles.id`. That's why the insert fails with `patrol_shifts_volunteer_1_fkey`.

Fix: select `user_id` from profiles and use it as the option value (keep `id` only if needed for the key). All assignment payload fields (`assigned_to`, `volunteer_1`, `reserved_by`) will get the `user_id`.

### 2. Dialog doesn't scroll
On shorter viewports the Create/Cancel buttons get pushed off-screen. Constrain the `DialogContent` to viewport height and make the middle section scrollable:
- Add `max-h-[90vh] flex flex-col` to `DialogContent`
- Wrap the form fields (`<div className="grid gap-4 py-2">`) with `flex-1 overflow-y-auto` and keep header/footer fixed.

No other files affected.