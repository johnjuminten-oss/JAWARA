-- Create/replace teacher_calendar_events view that exposes events per teacher via class_teachers
-- Idempotent: safe to run multiple times
-- Ensure any existing view is removed first to avoid ALTER/DROP-on-view errors
DROP VIEW IF EXISTS public.teacher_calendar_events CASCADE;

-- Create a tolerant view that maps events to teachers when:
-- - the event targets a class the teacher is assigned to
-- - OR the event targets the teacher directly (target_user)
-- - OR the event was created by the teacher
-- - OR the event is schoolwide (visibility_scope IN ('all','schoolwide'))
-- Use DISTINCT to avoid duplicates when multiple conditions match.
DO $$
BEGIN
  -- Only create the view if required tables exist to keep this migration idempotent and safe
  IF to_regclass('public.events') IS NOT NULL AND to_regclass('public.class_teachers') IS NOT NULL THEN
    CREATE VIEW public.teacher_calendar_events AS
    SELECT DISTINCT
  e.id,
  e.title,
  e.description,
  e.start_at,
  e.end_at,
  e.event_type,
  e.visibility_scope,
  e.target_class,
  e.target_user,
  e.created_by,
  e.is_recurring,
  e.repeat_until,
  e.is_deleted,
  ct.teacher_id
    FROM public.events e
    JOIN public.class_teachers ct
      ON (
        (e.target_class IS NOT NULL AND ct.class_id = e.target_class)
        OR (e.target_user IS NOT NULL AND e.target_user = ct.teacher_id)
        OR (e.created_by = ct.teacher_id)
        OR (e.visibility_scope IN ('all','schoolwide'))
      )
    WHERE e.is_deleted = FALSE;
  END IF;
END$$;

-- End of view
