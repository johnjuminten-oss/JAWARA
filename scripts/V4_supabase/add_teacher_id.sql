-- Add teacher_id column to events table
BEGIN;

-- Add teacher_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'events'
      AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE public.events
    ADD COLUMN teacher_id UUID REFERENCES public.profiles(id);

    -- Ensure teacher_id references a teacher
    ALTER TABLE public.events
    ADD CONSTRAINT chk_events_teacher_role 
    CHECK (
      teacher_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = teacher_id AND p.role = 'teacher'
      )
    );

    -- Add index for teacher_id
    CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON public.events(teacher_id);
  END IF;
END$$;

-- Update teacher calendar view to include teacher_id in visibility rules
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