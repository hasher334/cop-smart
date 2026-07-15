## Goal

Add district/group scoping so officers can assign shifts to members in their own district, and members pick a district at signup that only admins can change later.

## Database changes (single migration)

1. **New `districts` table**: `id`, `code` (unique), `name`, `description`, timestamps. Grants for `authenticated` (SELECT) and `service_role` (ALL). Anon GRANT omitted. RLS: everyone authenticated can read; only admins can insert/update/delete.
2. **`profiles.district_id uuid`** — nullable FK to `districts(id)`. Existing rows stay null; new signups must supply it.
3. **`patrol_shifts.assigned_to uuid`** — nullable FK to `profiles(id)`; represents the officer-assigned volunteer distinct from the self-reserve flow. Also add `assigned_by uuid` + `assigned_at timestamptz`.
4. **`handle_new_user()` trigger** — read `district_id` from `raw_user_meta_data` and store it on the new profile.
5. **Security-definer helper** `public.user_district(_user_id uuid) returns uuid` (stable, `security definer`, fixed search_path) — returns the caller's `profiles.district_id`. Used by RLS to avoid recursive lookups.
6. **RLS updates on `patrol_shifts`**:
   - Officers (`has_role(auth.uid(),'officer')` OR `corporal_plus`) may INSERT/UPDATE shifts where `unit_id` belongs to a district matching `user_district(auth.uid())` — since units don't currently carry a district, we'll add `units.district_id uuid` (nullable FK) in the same migration and scope by that.
   - Officer-assigned INSERTs must set `assigned_to` to a profile whose `district_id` matches the officer's district (or leave open with `assigned_to = null`).
   - Volunteers unchanged: reserve their own open shifts.
   - Admins unchanged (full access).
7. **RLS updates on `profiles`**: `district_id` is only writable by admins (add a trigger or column-level check that rejects non-admin updates to `district_id`).

## Frontend changes

1. **Signup (`src/routes/signup.tsx`)** — add required "District" `<Select>` populated from `districts`. Pass `district_id` in `signUp` metadata. Block submit until chosen.
2. **Roster edit (`volunteer-form-dialog.tsx`)** — add District select, but disable it unless `isAdmin`.
3. **Schedule / shift form (`src/components/schedule/shift-form-dialog.tsx`)**:
   - For officers: filter unit dropdown to units in their district; add "Assign to volunteer" select filtered to profiles in their district (or leave blank = open shift).
   - Admins: unrestricted.
   - Volunteers: no create access (already the case).
4. **Schedule views** — show assignee name when `assigned_to` is set (badge "Assigned"), separate from self-reserve.
5. **Admin districts management** — new route `src/routes/_authed/admin/districts.tsx` (admin-only) to CRUD districts and, on the units admin surface, set each unit's `district_id`. Add nav entry under Admin.
6. **Admin user editor** — allow admins to change a member's `district_id` (via existing users route or roster edit dialog).

## Technical notes

- `useAuth` gains `district_id` from the profile (already loaded) — expose it so the shift form can pre-filter.
- Officer-scope filtering happens both in RLS (authoritative) and in UI selects (usability).
- Existing `patrol_shifts_reserve_guard` trigger stays; extend it to allow officers/corporal_plus updates within their district and to accept `assigned_to` transitions.
- Types file regenerates after migration; frontend edits land in a follow-up step after approval.

## Files to change

- New migration (districts table, profile/unit/shift columns, RLS, trigger updates, `user_district` fn, `handle_new_user` update).
- `src/routes/signup.tsx`
- `src/components/roster/volunteer-form-dialog.tsx`
- `src/components/schedule/shift-form-dialog.tsx` (+ shift row/detail views to show assignee)
- `src/routes/_authed/admin/districts.tsx` (new) and admin nav
- `src/routes/_authed/admin/users.tsx` (district picker for admins)
- `src/hooks/use-auth.ts` (expose `districtId`)
