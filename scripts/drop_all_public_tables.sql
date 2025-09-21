-- drop_all_public_tables.sql
-- WARNING: Highly destructive. This will DROP EVERY TABLE in the `public` schema using CASCADE.
-- Make a full database snapshot or backup before running. Do NOT run on production unless you intend to wipe the schema.

-- Usage (psql):
--   psql "postgresql://user:pass@host:5432/dbname" -f ./scripts/drop_all_public_tables.sql

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    RAISE NOTICE 'Dropping table: %.% ...', rec.schemaname, rec.tablename;
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE;', rec.schemaname, rec.tablename);
  END LOOP;
  RAISE NOTICE 'All tables in public schema processed.';
END$$;

-- Note: this script only drops tables in the `public` schema. It does not drop views, sequences, types, or functions.
-- If you need to remove views or sequences too, extend the script accordingly. Use with extreme caution.
