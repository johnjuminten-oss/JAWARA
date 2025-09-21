-- Postgres-compatible seeds for batches and classes derived from Batch_and_Class.sql
BEGIN;

-- Ensure batch exists (from: AKSAGARTA)
INSERT INTO public.batches (id, name, created_at)
SELECT uuid_generate_v4(), 'AKSAGARTA', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.batches WHERE name = 'AKSAGARTA'
);

-- Ensure class exists (from: Kelas 12-H) and attach to batch 'AKSAGARTA'
INSERT INTO public.classes (id, name, batch_id, capacity, current_enrollment, created_at)
SELECT uuid_generate_v4(), 'Kelas 12-H', b.id, 30, 0, NOW()
FROM public.batches b
WHERE b.name = 'AKSAGARTA'
  AND NOT EXISTS (
    SELECT 1 FROM public.classes c WHERE c.name = 'Kelas 12-H'
  );

COMMIT;


