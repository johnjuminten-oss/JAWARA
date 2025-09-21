-- 2_add_subject_fk.sql
-- Idempotent migration to add subject_id column and FK from events(subject_id) -> subjects(id)
-- Safe to re-run in Supabase SQL editor or via psql.

-- 1) Add nullable subject_id column if missing
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS subject_id uuid;

-- 2) Create an index to support joins/filters (no-op if exists)
CREATE INDEX IF NOT EXISTS idx_events_subject_id ON public.events (subject_id);

-- 3) Add FK constraint if it doesn't already exist and the subjects table is present
DO $$
BEGIN
  -- Only attempt FK creation when subjects table exists to avoid errors in partial schema setups
  IF to_regclass('public.subjects') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE c.conname = 'events_subject_id_fkey'
        AND t.relname = 'events'
    ) THEN
      ALTER TABLE public.events
        ADD CONSTRAINT events_subject_id_fkey
        FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping FK creation: table public.subjects does not exist.';
  END IF;
END
$$;

-- Notes:
-- - The FK uses ON DELETE SET NULL to avoid cascade surprises; change if you prefer CASCADE/RESTRICT.
-- - If you rely on PostgREST implicit relationship expansion (e.g. subject:subjects(name)),
--   you will need to reload the PostgREST/schema cache after running this migration (restart the Supabase DB API or the Supabase project service).
