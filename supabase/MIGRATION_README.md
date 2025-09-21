Apply migrations in order:

1. Run `1_schema.sql` → sets up tables (already present in this repo).
2. Run `2_add_subject_fk.sql` → adds `subject_id` to `events` and FK to `subjects`.

Example psql (PowerShell):

$PG_CONN="postgresql://user:pass@host:5432/dbname"
psql $PG_CONN -f "./supabase/2_add_subject_fk.sql"

After applying the migration, restart the Supabase/PostgREST service (or your local supabase dev instance) so the schema cache picks up the new FK.

If you can't modify the DB, an alternative is to query joined views server-side instead of using PostgREST implicit expand; see `lib/dashboard.ts` for an example of merging subject data in JS.
