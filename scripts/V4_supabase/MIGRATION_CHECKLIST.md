Migration checklist for V4 Supabase scripts

Follow these steps to apply the repository's idempotent Supabase/Postgres migrations.

Important safety notes
- Do not run `6_migrate_events_target.sql` while the application is still writing legacy `target_type`/`target_id` fields. Only run it after you have deployed the app changes that stop writing legacy fields (or when you are confident no writers exist).
- Always take a backup/snapshot of your database before applying migrations.
- Apply files in the exact order listed below. Some SQL depends on helper functions or policies created earlier.

Order of application
1. `1_schema.sql` — create tables, enums, and views.
2. `2_helpers.sql` — SECURITY DEFINER helper functions used by RLS policies.
3. `3_triggers.sql` — triggers and trigger functions.
4. `4_rls_policies.sql` — row-level security policies (requires helpers to exist).
5. `5_seed.sql` — optional seed data for testing/staging.
6. `6_migrate_events_target.sql` — idempotent migration to backfill legacy `target_type`/`target_id` and drop legacy columns. Run this last and only when ready.

Basic verification after running
- Check that the helper functions exist: `SELECT proname FROM pg_proc WHERE proname LIKE 'is_%';`
- Check policies are enabled on sensitive tables: `
  SELECT tablename, relrowsecurity FROM pg_catalog.pg_class WHERE relrowsecurity = true;
  `
- Verify events mapping: `SELECT COUNT(*) FROM events WHERE target_class IS NULL AND visibility_scope = 'class';` (expect 0 after migration if backfill succeeded).

Rollback guidance
- Each SQL file in this folder is idempotent where possible but may include irreversible changes (dropping legacy columns). In production, the safest rollback is to restore from a database snapshot taken before the migrations.
- If you must revert a single step, inspect the SQL and manually reverse schema changes; prefer restoring a snapshot for correctness.

How to run (PowerShell)
1. Ensure `psql` is available in PATH (Postgres client).
2. Set the connection string in the `PG_CONN` environment variable or pass it to the runner script.
3. From the repository root run:

   powershell -ExecutionPolicy Bypass -File .\scripts\V4_supabase\run_migrations.ps1

If you prefer to run manually, use:

   $PG_CONN="postgresql://user:pass@host:5432/dbname"
   psql $PG_CONN -f .\scripts\V4_supabase\1_schema.sql
   psql $PG_CONN -f .\scripts\V4_supabase\2_helpers.sql
   psql $PG_CONN -f .\scripts\V4_supabase\3_triggers.sql
   psql $PG_CONN -f .\scripts\V4_supabase\4_rls_policies.sql
   psql $PG_CONN -f .\scripts\V4_supabase\5_seed.sql
   # Run the migration last when ready:
   psql $PG_CONN -f .\scripts\V4_supabase\6_migrate_events_target.sql

Verification checklist
- After completing migrations, run `pnpm build` locally to ensure the app compiles against the new schema.
- Run a sample flow in staging: create a broadcast from a teacher and verify students in the class receive/see it.

Contact
- If anything fails, capture the psql stdout/stderr and open an issue with the SQL file name and error output.
