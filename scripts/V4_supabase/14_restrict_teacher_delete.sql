-- 14_restrict_teacher_delete.sql
-- Restrict teachers to only delete their personal events
-- Idempotent migration to update teacher event deletion permissions

BEGIN;

-- First drop any existing teacher delete policies
DROP POLICY IF EXISTS "Teachers can delete their class events" ON public.events;
DROP POLICY IF EXISTS "Teachers can delete class events" ON public.events;
DROP POLICY IF EXISTS "Teachers can manage their events" ON public.events;
DROP POLICY IF EXISTS "Teachers can delete their personal events" ON public.events;

-- Create new restricted delete policy for teachers
CREATE POLICY "Teachers can only delete personal events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND event_type = 'personal'
    AND created_by = auth.uid()
  );

-- Teachers should still be able to select events they're involved with
CREATE POLICY "Teachers can view all relevant events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      -- Can view events they created
      created_by = auth.uid()
      OR
      -- Can view events for classes they teach
      target_class IN (
        SELECT class_id FROM public.class_teachers 
        WHERE teacher_id = auth.uid()
      )
      OR
      -- Can view school-wide events
      visibility_scope IN ('all', 'schoolwide')
    )
  );

-- Teachers can still create and edit their own personal events
CREATE POLICY "Teachers can manage their personal events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND event_type = 'personal'
    AND created_by = auth.uid()
  )
  WITH CHECK (
    event_type = 'personal'
    AND created_by = auth.uid()
  );

COMMIT;