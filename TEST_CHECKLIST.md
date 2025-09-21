# Project Test Checklist

This checklist focuses on the highest-value manual and quick automated checks to validate styling, auth, RBAC/RLS, dashboard, events, and migrations.

Run order: smoke → auth/profile → RBAC/RLS → dashboard/events → migrations → UI checks → extras.

1) Smoke / build
- [ ] pnpm install
- [ ] pnpm build (no TypeScript errors)
- [ ] pnpm test (unit tests run)

2) Authentication & profiles
- [x] Sign up a new user and complete profile creation
- [x] Sign in / sign out flows
- [x] Edit profile and confirm changes persist and are scoped to the user

3) Role-based access (admin / teacher / student) & RLS
- [ ] As admin: create/update/delete profiles, classes, events, alerts
- [ ] As teacher: view/manage assigned classes and class events only
- [ ] As student: view own class, create personal event, view notifications/alerts
- [ ] Re-run `scripts/V4_supabase/4_rls_policies.sql` in Supabase SQL editor — no "policy already exists" error

4) Dashboard (student & teacher)
- [ ] Load `/student/dashboard` and `/teacher/dashboard` for respective accounts
- [ ] Confirm notifications, upcoming events, assignments appear
- [ ] If an error occurs, copy server log (stringified error) and the returned `error_summary` string

5) Events / schedule management
- [ ] Create single event (class and personal) via UI
- [ ] Create recurring event (if supported) and verify instances
- [ ] Update and delete events; ensure `.select()` returns created/updated rows
- [ ] Edge cases: missing subject_id, invalid target_class

6) Subjects FK & PostgREST relationship (migration)
- [ ] Run `scripts/V4_supabase/2_add_subject_fk.sql` in the target environment
- [ ] If migration created the FK, restart Supabase schema cache / API
- [ ] Confirm PostgREST implicit expansion (e.g. `subject:subjects(name)`) works without PGRST200

7) Notifications & Alerts
- [ ] Generate a notification/alert and verify visibility to intended users
- [ ] Mark notification as read/update status

8) Broadcast flow (teacher)
- [ ] Publish broadcast to a class — verify `events` created with `target_class` and notifications generated

9) Calendar UI & subject display
- [ ] Create events with and without `subject_id` and verify calendar shows subject name (or gracefully handles missing subject)

10) Styling & UI inputs
- [ ] Check login/signup inputs are white (not gray)
- [ ] Check buttons, selects, checkboxes render normally across dark/light
- [ ] Verify category pills still show saturated colors

11) API routes & error handling
- [ ] Exercise key API routes (`/api/events`, `/api/notifications`, `/api/alerts`, `/api/broadcast`) with authenticated requests
- [ ] Confirm API returns helpful error messages (no opaque `{}`)

12) Tests & automation (optional)
- [ ] Add Playwright or Cypress tests for: sign-up/login, create event, dashboard load
- [ ] Add quick vitest integration for `lib/dashboard.ts` repro case that previously returned `{}`

Quick commands (PowerShell)
```powershell
pnpm install
pnpm build
pnpm dev   # start local dev server
pnpm test
```

Notes
- If you hit PGRST200 or FK-related errors, run the migration in the same Supabase project where the `subjects` table exists and restart the API/schema cache.
- If `4_rls_policies.sql` errors about transactions in Supabase SQL editor, use the updated script in `scripts/V4_supabase` (it has no BEGIN/COMMIT).

If you want, I can convert the high-priority items into a checkbox-enabled GitHub issue or a Playwright test suite; tell me which items you want automated first.
