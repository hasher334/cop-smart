## Problem

When creating a shift with an assignee, the insert fails:
`patrol_shifts_assigned_to_fkey` violation.

Cause: `patrol_shifts.assigned_to` FK still references `profiles.id`, while every sibling column (`volunteer_1`, `volunteer_2`, `reserved_by`, `assigned_by`) references `auth.users(id)`. The last fix switched the dropdown to send `profiles.user_id` (an auth user id) into all of these — correct for the siblings, but it breaks `assigned_to`.

## Fix

Single migration that realigns `assigned_to` with the other user-id columns:

1. Null out any existing `assigned_to` values that don't match a `profiles.user_id` (defensive; likely none).
2. Drop `patrol_shifts_assigned_to_fkey`.
3. Re-add it as `FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL`.

No code changes needed — `shift-form-dialog.tsx` already sends `profiles.user_id`.
