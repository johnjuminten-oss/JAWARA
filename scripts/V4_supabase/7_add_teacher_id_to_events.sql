-- Migration: Add teacher_id column to events table
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

    -- Add index for teacher_id lookups
    CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON public.events(teacher_id);
  END IF;
END$$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION check_teacher_id_is_teacher()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.teacher_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = NEW.teacher_id AND role = 'teacher'
    ) THEN
      RAISE EXCEPTION 'teacher_id must reference a profile with role = teacher';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_teacher_id_is_teacher ON public.events;

-- Create the trigger
CREATE TRIGGER ensure_teacher_id_is_teacher
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION check_teacher_id_is_teacher();

COMMIT;