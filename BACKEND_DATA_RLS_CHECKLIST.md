# Backend data relationships & RLS checklist

Purpose
- A concise, actionable checklist and SQL snippets to validate the database schema, foreign-key relationships, soft-delete semantics, and Row-Level Security (RLS) policies for common dashboard use-cases in this project (Supabase / Postgres).

Assumptions
- The project uses Postgres (Supabase) and follows the repository conventions: tables like `profiles`, `classes`, `batches`, `class_teachers`, `events`, `notifications`, `alerts` and supporting SQL scripts under `scripts/V4_supabase` or `supabase/`.
- Events are normalized to `target_class` (UUID) and `target_user` (UUID) plus a `visibility_scope` enum. Tables use `is_deleted` for soft deletes.
- RLS helper functions exist in `2_helpers.sql` (e.g. `is_admin(uid)`, `is_teacher_of_class(uid, class_id)`).

How to use
- Run the SQL snippets below against your dev/staging database (use `psql` or Supabase SQL editor). Replace connection placeholders with your database connection string. The snippets are safe read checks; write checks are marked and should be run on non-production or with proper backups.

Checklist — Schema & relationships
- [ ] Confirm expected tables exist
  - Query: SELECT table_name FROM information_schema.tables WHERE table_schema='public';
- [ ] Confirm foreign keys and referenced columns
  - Verify each FK: events.target_class -> classes.id, events.target_user -> profiles.id, class_teachers.teacher_id -> profiles.id, class_teachers.class_id -> classes.id
  - SQL sample to list FKs:
    ```sql
    SELECT
      tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    ```
- [ ] Check for orphaned rows (no referenced parent)
  - Example: find events whose target_class doesn't exist
    ```sql
    SELECT e.id FROM events e
    LEFT JOIN classes c ON e.target_class = c.id
    WHERE e.target_class IS NOT NULL AND c.id IS NULL AND e.is_deleted = FALSE;
    ```

Checklist — Soft-delete and cleanup rules
- [ ] Ensure queries and views filter `is_deleted = FALSE`
  - Confirm views such as `student_calendar_events` and `teacher_calendar_events` include that filter.
  - Query view definition:
    ```sql
    SELECT definition FROM pg_views WHERE viewname = 'student_calendar_events';
    ```
- [ ] Confirm cascaded soft-delete behavior is deliberate
  - Verify whether child records (notifications, alerts) are soft-deleted or physically deleted when parent is deleted; document intended behavior.

Checklist — Events targeting and visibility
- [ ] Ensure new code uses normalized fields
  - `events` should prefer `target_class` and `target_user` + `visibility_scope` over legacy `target_type/target_id` fields.
- [ ] Validate event visibility views for each role
  - `student_calendar_events` should return events visible to student based on class membership and `visibility_scope` rules.
  - `teacher_calendar_events` should return events visible to teacher(s) of a class.

Checklist — RLS and helper functions
- [ ] List active RLS policies for critical tables
  - SQL:
    ```sql
    SELECT policyname, tablename, permissive, roles, cmd
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('events','notifications','alerts','profiles','classes');
    ```
- [ ] Confirm helper functions exist and are SECURITY DEFINER for policy use
  - Look for functions in `scripts/V4_supabase/2_helpers.sql` or `supabase/2_security.sql` named like `is_admin`, `is_teacher_of_class`, `profile_belongs_to_user`, etc.
  - Sample check:
    ```sql
    SELECT proname, pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE proname ILIKE 'is_%' AND n.nspname = 'public';
    ```
  - Inspect the returned `definition` for `SECURITY DEFINER`.

Checklist — Views and API surface
- [ ] Ensure dashboards use curated views, not raw tables
  - Views to check: `student_calendar_events`, `teacher_calendar_events` (must exist and select only non-deleted, permitted columns).
- [ ] Ensure RLS policies permit SELECT on those views for the intended role (or the view runs as a security-definer function)

Practical tests (safe to run on dev)
- Test 1 — Can a student read only their class events
  - Connect as a test student user (or emulate by running with a session token) and run:
    ```sql
    -- replace :student_id with the student's UUID
    SELECT * FROM student_calendar_events WHERE user_id = ':student_id' LIMIT 10;
    ```
  - Expected: only events targeted to the student's class, public broadcasts, or personal events owned by the student appear.
- Test 2 — Teacher event creation permissions
  - Attempt to insert an `events` row with `target_class` equal to a class the teacher teaches; the insert should succeed for teacher role but fail otherwise.
  - Example (run in non-production test):
    ```sql
    INSERT INTO events (title, start_ts, end_ts, target_class, visibility_scope, created_by, event_type)
    VALUES ('Test', now(), now()+interval '1 hour', '<class-uuid>', 'class', '<teacher-uuid>', 'class');
    ```
  - Expected: success when executed by a teacher who teaches that class; otherwise RLS should prevent it.
- Test 3 — Ensure notifications are scoped
  - Verify notifications are created for intended recipients and that users cannot read notifications addressed to other users:
    ```sql
    SELECT * FROM notifications WHERE user_id = '<other_user>' AND is_deleted = FALSE;
    ```
  - Expected: RLS prevents reading another user's notifications.

Automated test ideas
- SQL-based tests
  - Create a migration/test schema and insert fixture rows for a teacher, student, class; assert select/insert/update/delete behaviors under different roles (use pgTAP or simple SQL scripts that exercise policies).
- Integration tests (server-side)
  - Use Supabase client with test service role to setup fixtures, then use client-as-user tokens to verify behavior from the API routes (e.g., `app/api/events/*` handlers).

Troubleshooting checklist (if RLS blocks legitimate operations)
- Confirm policies use helper SECURITY DEFINER functions (avoids recursion).
- If server APIs need to bypass RLS, ensure server code uses a service_role key securely (only from server) and the API enforces its own authorization.
- Add targeted audit queries to locate missing helper logic or mismatched role checks.

Quick commands (PowerShell-friendly) to run locally
```powershell
# PG_CONN should be like "postgresql://user:pass@host:5432/db"
psql $env:PG_CONN -c "SELECT viewname FROM pg_views WHERE schemaname='public';"
psql $env:PG_CONN -c "SELECT definition FROM pg_views WHERE viewname='student_calendar_events';"
psql $env:PG_CONN -c "SELECT * FROM pg_policies WHERE schemaname='public';"
```

Notes & best practices
- Prefer views for dashboard reads so RLS and complex joins live in the DB and the frontend reads a simple interface.
- Keep helper functions in `2_helpers.sql` and mark them `SECURITY DEFINER` to avoid recursion inside policies.
- Document intended behavior for soft-delete vs hard-delete; make tests assert that behavior.

Requirements coverage
- Provide an MD file to check backend data relationships and policies based on good use-cases — Done.

Next steps (optional)
- I can open specific SQL files (e.g., `scripts/V4_supabase/1_schema.sql` or `supabase/2_security.sql`) and extract exact foreign keys and policy code and generate a detailed report or failing testcases.
