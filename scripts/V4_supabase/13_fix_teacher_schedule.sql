-- 13_fix_teacher_schedule.sql
-- Idempotent migration to help teacher calendars:
-- 1) Create class_teachers rows for classes where a teacher created a class-targeted event
-- 2) Install a safe RLS policy that allows authenticated teachers to SELECT events for classes they teach

BEGIN;

-- 1) Backfill class_teachers when a teacher created a class-targeted event
-- This will not overwrite existing mappings and is safe to re-run.
INSERT INTO public.class_teachers (id, class_id, teacher_id, assigned_at)
SELECT uuid_generate_v4(), e.target_class, e.created_by, NOW()
FROM public.events e
JOIN public.profiles p ON p.id = e.created_by
WHERE e.target_class IS NOT NULL
  AND p.role = 'teacher'
  AND NOT EXISTS (
    SELECT 1 FROM public.class_teachers ct
    WHERE ct.class_id = e.target_class AND ct.teacher_id = e.created_by
  );

-- 2) Ensure RLS policy exists so teachers can SELECT events for classes they teach
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Drop old policy if present
DROP POLICY IF EXISTS "Teachers can select class events" ON public.events;

-- Create a direct-check policy (doesn't rely on helper functions)
CREATE POLICY "Teachers can select class events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_teachers ct
      WHERE ct.class_id = public.events.target_class
        AND ct.teacher_id = auth.uid()
    )
    OR created_by = auth.uid()
    OR visibility_scope IN ('all','schoolwide')
  );

COMMIT;

-- End of migration
