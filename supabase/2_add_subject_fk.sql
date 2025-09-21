-- 2_add_subject_fk.sql
-- Idempotent migration to add subject_id to events and foreign key to subjects

-- Add subject_id column if missing
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS subject_id UUID;

-- Create index for subject_id for performance
CREATE INDEX IF NOT EXISTS idx_events_subject_id ON public.events(subject_id);

-- Add foreign key constraint only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_subject_id_fkey'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_subject_id_fkey FOREIGN KEY (subject_id)
      REFERENCES public.subjects(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Optionally, set subject_id for existing events that can be mapped via other relations
-- (This is left intentionally empty; if you have a mapping source, add update statements here.)
