-- Add is_recurring and repeat_until columns to events for recurring schedules
-- Idempotent: safe to run multiple times
BEGIN;

-- Add boolean flag for recurring events
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Add repeat_until timestamp (nullable)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS repeat_until TIMESTAMP WITH TIME ZONE;

-- Optional index to help recurring queries
CREATE INDEX IF NOT EXISTS idx_events_recurring ON public.events(is_recurring, repeat_until);

COMMIT;

-- End of migration
