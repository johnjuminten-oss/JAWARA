V4_supabase — recommended run order and notes

Files:
1. 1_schema.sql         — create extensions, types, tables, indexes (idempotent)
2. 2_helpers.sql        — SECURITY DEFINER helper functions (avoid RLS recursion)
3. 3_triggers.sql       — updated_at triggers
4. 4_rls_policies.sql   — enable RLS and create policies (idempotent)
5. 5_seed.sql           — optional, non-destructive sample data
6. 6_migrate_events_target.sql — one-time idempotent migration to backfill legacy event targets and drop old columns

Recommended run order (PowerShell / psql):

# set connection string (PowerShell)
$PG_CONN="postgresql://DB_USER:DB_PASS@DB_HOST:DB_PORT/DB_NAME"

# run files in order (example)
psql $PG_CONN -f ".\scripts\V4_supabase\1_schema.sql"
psql $PG_CONN -f ".\scripts\V4_supabase\2_helpers.sql"
psql $PG_CONN -f ".\scripts\V4_supabase\3_triggers.sql"
psql $PG_CONN -f ".\scripts\V4_supabase\4_rls_policies.sql"
# optional seed
psql $PG_CONN -f ".\scripts\V4_supabase\5_seed.sql"

# If you have legacy events using target_type/target_id, run the migration after applying schema/helpers:
psql $PG_CONN -f ".\scripts\V4_supabase\6_migrate_events_target.sql"

Notes:
- Run these on a staging database first. Back up production before applying.
- All files are written to be re-runnable. They use IF NOT EXISTS and DROP POLICY IF EXISTS.
- The helper functions are SECURITY DEFINER to avoid RLS recursion; ensure the function owner is a safe role (typically the DB owner).
-- If you want a single ALTER-only migration to patch an existing production DB (for example, to add a missing column), tell me and I will add it as a one-file migration that only runs ALTER TABLE ... IF NOT EXISTS.
-- If you have legacy events, run `6_migrate_events_target.sql` after `1_schema.sql` to backfill `target_class`/`target_user` and remove the old `target_type`/`target_id` columns.
