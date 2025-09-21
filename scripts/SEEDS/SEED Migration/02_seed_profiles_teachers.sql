-- Seed teacher profiles derived from Guru.sql
BEGIN;

-- Ensure auth users exist would normally be required; for seed, we insert profiles by email if missing

-- Helper upsert for one teacher
WITH t AS (
  SELECT 'Fiqih'::text AS full_name, 'Fiqihjuara@gmail.com'::text AS email UNION ALL
  SELECT 'Ajeng', 'ajeng409@gmail.com' UNION ALL
  SELECT 'Ulfah Fitriah', 'ulfahpatrusha@gmail.com' UNION ALL
  SELECT 'Munawir', 'munawirawing9@gmail.com'
)
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT uuid_generate_v4(), t.email, t.full_name, 'teacher', NOW()
FROM t
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.email = t.email
);

COMMIT;


