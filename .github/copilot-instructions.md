## Quick orientation — what to do next

Read these notes before making changes: this repository is a Next.js 13+ app (app/ directory) with a Supabase/Postgres backend (SQL scripts under `scripts/V4_supabase`). The goal is to keep DB schema, RLS, and helper functions in `scripts/V4_supabase` and let the frontend query simple views (e.g. `student_calendar_events`) instead of complex filters.

Checklist for small tasks
- Run `pnpm build` locally to surface TypeScript/Next issues before editing UI code.
- When changing DB schema, update `scripts/V4_supabase/1_schema.sql` and add idempotent changes in that folder (2_helpers.sql, 3_triggers.sql, 4_rls_policies.sql, 6_migrate_events_target.sql).
- Prefer editing the API layer (app/api/*) when behavior needs to change rather than rewriting RLS policies directly.

Architecture & big-picture
- Frontend: `app/` (Next.js server components + client components under `components/`). Key UI pieces: `components/dashboard/*`, `components/teacher/*`, `components/student/*`.
- API: Next.js route handlers under `app/api/*` (e.g. `app/api/broadcast/route.ts`). These use `lib/supabase/server.ts` to create a server-side Supabase client.
- DB: `scripts/V4_supabase/1_schema.sql` defines tables: `batches`, `classes`, `profiles`, `class_teachers`, `events`, `notifications`, `alerts`. Events use normalized target columns: `target_class` (UUID) and `target_user` (UUID) and a `visibility_scope` enum.
- RLS and security helpers: `scripts/V4_supabase/2_helpers.sql` contains SECURITY DEFINER helper functions used by policies to avoid recursion.
- Migration pattern: apply `1_schema.sql` → `2_helpers.sql` → `3_triggers.sql` → `4_rls_policies.sql` → `5_seed.sql` → `6_migrate_events_target.sql`. See `scripts/V4_supabase/README.md` for commands.

Project-specific conventions
- Events targeting: prefer `target_class`/`target_user` + `visibility_scope`. Avoid legacy `target_type`/`target_id` text fields when writing new code (there is an idempotent migration to backfill legacy rows).
 - Events targeting: prefer `target_class`/`target_user` + `visibility_scope`. The repository includes idempotent migration scripts to backfill legacy `target_type`/`target_id` rows; new code should use the normalized fields.
- Soft-delete: tables include `is_deleted` boolean; queries shown in the code and views filter on `is_deleted = FALSE`.
- Views: frontend should read from `student_calendar_events` and `teacher_calendar_events` views. RLS policies must allow SELECT on those views for the correct role.
- Route handler params: some Next-generated types were problematic; many handlers accept `ctx: any` for the second arg and read `ctx.params.id`. Follow existing examples in `app/api/alerts/[id]/route.ts` and `app/api/notifications/[id]/route.ts`.

Developer workflows & commands
- Local dev: `pnpm dev` (Next dev server). Use `pnpm build` to validate types (Next runs typechecks during build).
- Tests: `pnpm test` (vitest). Run `pnpm test:watch` for iterative work.
- Apply SQL locally (psql example):
  ```powershell
  $PG_CONN="postgresql://user:pass@host:5432/dbname"
  psql $PG_CONN -f ".\scripts\V4_supabase\1_schema.sql"
  psql $PG_CONN -f ".\scripts\V4_supabase\2_helpers.sql"
  psql $PG_CONN -f ".\scripts\V4_supabase\4_rls_policies.sql"
  ```

Files and patterns to inspect for changes
- DB schema and migrations: `scripts/V4_supabase/1_schema.sql`, `6_migrate_events_target.sql`, `2_helpers.sql`, `4_rls_policies.sql`.
- Server supabase client: `lib/supabase/server.ts` — this function is async; call with `await` in server components.
- Broadcast flow: `app/api/broadcast/route.ts`, `components/teacher/broadcast-form.tsx`, `components/dashboard/broadcast-banner.tsx`.
- Calendar UI: `components/calendar/*` and `components/student/student-calendar-view.tsx`.
- Hooks: `hooks/use-notifications.ts`, `hooks/use-alerts.ts`, `hooks/use-class-data.ts` — use these for client-side queries and subscriptions.

Common gotchas & examples
- When adding RLS policy that needs to reference user ownership, call a SECURITY DEFINER helper from `2_helpers.sql` rather than selecting from `profiles` inside the policy body (avoids infinite recursion). Example helper names: `is_admin(uid)`, `is_teacher_of_class(uid, class_id)` (see `scripts/V4_supabase/2_helpers.sql`).
- To publish a broadcast to a class: update `app/api/broadcast/route.ts` to insert into `events` using `target_class` + `visibility_scope='class'` and create notifications in `notifications`/`alerts` tables.
- If TypeScript build fails with generated route types, search for occurrences of typed route handler signatures and prefer `ctx: any` pattern or match the generated types exactly.

When to ask for clarification
- If DB semantics are unclear (e.g., whether `deleted_by` should be FK to `profiles`), ask before changing FK constraints — schema changes affect RLS logic.
- If a change touches both RLS policies and API behavior, propose the small migration steps and tests to run in staging.

If this file needs additions, tell me which areas you want deeper examples for (RLS patterns, helper SQL functions, or sample API patches).

---
Paths referenced above: `scripts/V4_supabase/*`, `app/api/*`, `lib/supabase/*`, `components/*`, `hooks/*`, `types/*`.
