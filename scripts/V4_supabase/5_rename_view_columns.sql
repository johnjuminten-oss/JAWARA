-- 5_rename_view_columns.sql
-- Idempotent safety migration to adjust view column names that may have changed
-- Avoids `cannot change name of view column` errors by performing conditional renames

-- Safe rename: student_calendar_events.student_id -> subject_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'student_calendar_events'
      AND column_name = 'student_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'student_calendar_events'
      AND column_name = 'subject_id'
  ) THEN
    RAISE NOTICE 'Renaming student_calendar_events.student_id -> subject_id';
    EXECUTE 'ALTER VIEW public.student_calendar_events RENAME COLUMN student_id TO subject_id';
  ELSE
    RAISE NOTICE 'No rename needed for student_calendar_events (student_id missing or subject_id already present)';
  END IF;
END
$$;

-- If you have other view column name changes to apply, add similar guarded blocks here.

-- Important: prefer guarded renames over DROP VIEW ... CREATE unless you intend to drop dependent objects.
