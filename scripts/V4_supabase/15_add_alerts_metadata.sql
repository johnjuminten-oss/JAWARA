-- Add metadata JSONB column to alerts table if missing
-- Idempotent and safe to run multiple times
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'alerts'
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.alerts
      ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added metadata column to public.alerts';
  ELSE
    RAISE NOTICE 'public.alerts.metadata already exists';
  END IF;
END$$;

-- End of migration
