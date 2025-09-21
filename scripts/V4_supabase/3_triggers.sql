-- 3_triggers.sql
-- trigger to set updated_at on UPDATE (idempotent)
BEGIN;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach triggers if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_set_timestamp') THEN
    CREATE TRIGGER profiles_set_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'classes_set_timestamp') THEN
    CREATE TRIGGER classes_set_timestamp
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'events_set_timestamp') THEN
    CREATE TRIGGER events_set_timestamp
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;
END$$;

COMMIT;
