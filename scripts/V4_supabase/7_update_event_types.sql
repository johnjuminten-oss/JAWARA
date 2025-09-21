-- First transaction: Update the enum type
BEGIN;

-- Drop existing constraints that use the enum
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Add new values to the enum type
DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'regular_study';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'academic_notes';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'break';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'prayer';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'sports';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'arts';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'administrative';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

COMMIT;

-- Second transaction: Update the metadata for existing events
BEGIN;

-- Update the event colors in the metadata column
UPDATE events
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{color}',
  CASE event_type
    WHEN 'regular_study' THEN '"#198754"'::jsonb  -- Green - Growth
    WHEN 'academic_notes' THEN '"#0D6EFD"'::jsonb -- Blue - Focus
    WHEN 'break' THEN '"#F8F9FA"'::jsonb         -- Off-White - Pause
    WHEN 'prayer' THEN '"#20C997"'::jsonb        -- Teal - Spiritual
    WHEN 'sports' THEN '"#FD7E14"'::jsonb        -- Orange - Energy
    WHEN 'arts' THEN '"#6F42C1"'::jsonb          -- Purple - Creativity
    WHEN 'administrative' THEN '"#FFC107"'::jsonb -- Yellow - Info
    ELSE COALESCE(metadata->'color', 'null'::jsonb)
  END
)
WHERE event_type IN (
  'regular_study', 'academic_notes', 'break', 'prayer',
  'sports', 'arts', 'administrative'
);

COMMIT;