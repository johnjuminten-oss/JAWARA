-- Update event_type enum to include new categories
BEGIN;

-- First, drop dependent views
DROP VIEW IF EXISTS public.teacher_calendar_events_test;
DROP VIEW IF EXISTS public.teacher_calendar_events;
DROP VIEW IF EXISTS public.student_calendar_events;

-- Then drop ALL policies on the events table to be safe
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', pol.policyname);
    END LOOP;
END $$;

-- Temporarily disable RLS
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Then preserve the existing event_type data as text
ALTER TABLE public.events ALTER COLUMN event_type TYPE text;

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing event_type enum
DROP TYPE IF EXISTS event_type CASCADE;

-- Create new event_type enum with expanded categories
CREATE TYPE event_type AS ENUM (
  -- Academic events
  'lesson',           -- Regular subjects (Math, Geography, etc.)
  'exam',            -- Exams and try outs
  'assignment',      -- Homework and tasks
  
  -- School activities
  'break',           -- Recess, morning break, lunch break
  'prayer',          -- Religious activities
  'sports',          -- Physical education, morning exercise
  'arts',            -- Art and creative classes
  'administrative',  -- Class guidance, orientation
  
  -- Announcements and broadcasts
  'broadcast',           -- General information
  'urgent_broadcast',    -- Time-sensitive information
  'class_announcement',  -- Class-level announcements
  
  -- Other
  'personal'         -- Personal events
);

-- Update any values that aren't in the new enum to 'lesson'
UPDATE public.events SET 
  event_type = 'lesson' 
WHERE event_type NOT IN (
  'lesson', 'exam', 'assignment', 'break', 'prayer', 'sports', 'arts', 
  'administrative', 'broadcast', 'urgent_broadcast', 'class_announcement', 'personal'
);

-- Convert the column back to event_type enum
ALTER TABLE public.events ALTER COLUMN event_type TYPE event_type USING event_type::event_type;

-- Set the default
ALTER TABLE public.events ALTER COLUMN event_type SET DEFAULT 'lesson';

-- Recreate all policies
-- Student policies
CREATE POLICY "Students can view their personal events" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND (
      event_type = 'personal' 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Students can create personal events" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Students can update their personal events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    event_type = 'personal'
    AND created_by = auth.uid()
  );

CREATE POLICY "Students can delete their personal events" ON public.events
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  );

-- Teacher policies
CREATE POLICY "Teachers can view their personal events" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      event_type = 'personal' 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can create personal events" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their personal events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    event_type = 'personal'
    AND created_by = auth.uid()
  );

CREATE POLICY "Teachers can delete their personal events" ON public.events
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      event_type = 'personal'
      AND created_by = auth.uid()
    )
  );

-- Class event policies for teachers
CREATE POLICY "Teachers can create class events" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND target_class IN (
      SELECT class_id FROM public.class_teachers 
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their class events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      created_by = auth.uid()
      OR target_class IN (
        SELECT class_id FROM public.class_teachers 
        WHERE teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can delete their class events" ON public.events
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      created_by = auth.uid()
      OR target_class IN (
        SELECT class_id FROM public.class_teachers 
        WHERE teacher_id = auth.uid()
      )
    )
  );

-- General viewing policies
CREATE POLICY "Users can view events targeted to them" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    target_user = auth.uid()
    OR (target_class IS NULL AND target_user IS NULL)
  );

CREATE POLICY "Users can view class events" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    target_class IN (
      SELECT class_id FROM public.profiles WHERE id = auth.uid()
      UNION
      SELECT class_id FROM public.class_teachers WHERE teacher_id = auth.uid()
    )
  );

-- Admin policies
CREATE POLICY "Admins have full access" ON public.events
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin'
    )
  );

-- Students insert policy (explicitly named)
CREATE POLICY "Students can insert personal events" ON public.events
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND event_type = 'personal'
    AND created_by = auth.uid()
  );

-- Make sure students can update/delete all their personal events
CREATE POLICY "Students can manage personal events" ON public.events
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'student'
    )
    AND event_type = 'personal'
    AND created_by = auth.uid()
  );

-- Make sure teachers can manage all their events
CREATE POLICY "Teachers can manage their events" ON public.events
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'teacher'
    )
    AND (
      created_by = auth.uid()
      OR target_class IN (
        SELECT class_id FROM public.class_teachers 
        WHERE teacher_id = auth.uid()
      )
    )
  );

-- Set default permissions
ALTER TABLE public.events FORCE ROW LEVEL SECURITY;

-- Recreate the calendar event views
CREATE OR REPLACE VIEW public.student_calendar_events AS
SELECT 
  e.*, p.id AS student_id
FROM public.events e
JOIN public.profiles p
  ON (
    (e.target_class IS NOT NULL AND e.target_class = p.class_id)
    OR (e.target_user IS NOT NULL AND e.target_user = p.id)
    OR (e.visibility_scope IN ('all','schoolwide'))
  )
WHERE e.is_deleted = FALSE
  AND p.is_deleted = FALSE;

CREATE OR REPLACE VIEW public.teacher_calendar_events AS
SELECT 
  e.*, t.id AS viewing_teacher_id
FROM public.events e
JOIN public.profiles t ON (
  -- Show events assigned to this teacher
  (e.teacher_id = t.id) OR
  -- Show events this teacher created
  (e.created_by = t.id) OR
  -- Show events for classes they teach (only if no specific teacher assigned)
  (e.teacher_id IS NULL AND e.target_class IN (
    SELECT ct.class_id 
    FROM class_teachers ct 
    WHERE ct.teacher_id = t.id AND ct.is_deleted = FALSE
  ))
)
WHERE t.role = 'teacher'
  AND e.is_deleted = FALSE
  AND t.is_deleted = FALSE;

COMMIT;