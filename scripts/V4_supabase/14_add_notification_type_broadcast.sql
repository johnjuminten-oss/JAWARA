-- Add "broadcast" to notification_type enum if missing
-- Idempotent: safe to run multiple times
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'broadcast'
  ) THEN
    ALTER TYPE public.notification_type ADD VALUE 'broadcast';
  ELSE
    RAISE NOTICE 'notification_type enum already contains broadcast';
  END IF;
END$$;

-- End of migration
