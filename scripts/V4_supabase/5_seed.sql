-- 5_seed.sql
-- Non-destructive sample data. Safe to run multiple times.
BEGIN;

-- Ensure uuid generator exists
SELECT 1 WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname='uuid-ossp');

INSERT INTO public.batches (id,name,created_at)
SELECT uuid_generate_v4(), 'Batch 2025', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.batches WHERE name='Batch 2025');

INSERT INTO public.classes (id,name,batch_id,capacity,created_at)
SELECT uuid_generate_v4(), 'Class 10A', b.id, 30, NOW()
FROM public.batches b
WHERE b.name = 'Batch 2025'
  AND NOT EXISTS (SELECT 1 FROM public.classes c WHERE c.name='Class 10A');

-- Example event
INSERT INTO public.events (id,title,description,start_at,end_at,event_type,created_at)
SELECT uuid_generate_v4(), 'Orientation', 'Welcome event', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour', 'broadcast', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title='Orientation');

COMMIT;
