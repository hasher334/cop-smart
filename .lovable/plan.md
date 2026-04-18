
You've completed Iterations 1-3 (Auth + Admin, VDASH Scheduling with Calendar, FOCUS Dispatch Reference). Looking at the route stubs that exist (`roster`, `vehicles`, `training`, `forms`, `resources`, `profile`, `admin/migration`) and the dashboard tiles, here's what's logically next.

## Recommended Next: Iteration 4 — Roster (Volunteers Directory)

The Roster page is currently a stub but the `profiles` table is already built and populated (you have at least the admin profile). It's the natural next step because:
- It unlocks the rest of the app — Schedule already references `profiles` (volunteer_1/volunteer_2), and a directory makes those references browsable.
- It's a prerequisite for Users & Roles management.
- Data layer already exists; it's mostly UI work.

### Scope for Iteration 4

**Build `/roster` page:**
- Searchable, filterable list of all volunteers from `profiles`
- Filters: status (active/inactive/leave/retired/pending), home unit, rank
- Card or table view toggle (mobile-first cards, desktop table)
- Click a volunteer → detail drawer/dialog showing badge, rank, unit, phone, email, hire date, status

**Admin-only actions** (gated by `useAuth().isAdmin`):
- "New Volunteer" button → dialog to create profile (badge_no, full_name, rank, home_unit_id, status, phone, email)
- Edit existing profile
- Change status (active ↔ inactive ↔ leave ↔ retired)

**Components to create:**
- `src/components/roster/volunteer-card.tsx`
- `src/components/roster/volunteer-form-dialog.tsx`
- `src/components/roster/volunteer-detail-sheet.tsx`

**Files to edit:**
- `src/routes/_authed/roster.tsx` (replace stub)

### Alternatives if you'd rather not do Roster next

1. **Iteration 5 — Users & Roles admin page** — promote/demote accounts (admin, corporal_plus, officer, volunteer). Smaller scope, unblocks team onboarding.
2. **Iteration 6 — Vehicles** — fleet directory (needs new `vehicles` table migration).
3. **Iteration 7 — Training** — certifications/expirations tracker (needs new tables).
4. **Polish** — remove the "Set up admin account" bootstrap button from `/login` now that admin exists; add unit filter to the Calendar view.

