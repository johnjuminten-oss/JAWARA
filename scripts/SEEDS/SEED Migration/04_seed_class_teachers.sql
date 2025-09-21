-- Link teachers to class based on Guru.sql (all teachers teach Kelas XII-H)
BEGIN;

WITH cls AS (
  SELECT id FROM public.classes WHERE name = 'Kelas 12-H'
)
INSERT INTO public.class_teachers (id, class_id, teacher_id, assigned_at)
SELECT uuid_generate_v4(), (SELECT id FROM cls), p.id, NOW()
FROM public.profiles p
WHERE p.role = 'teacher'
  AND p.email IN (
    'Fiqihjuara@gmail.com',
    'ajeng409@gmail.com',
    'ulfahpatrusha@gmail.com',
    'munawirawing9@gmail.com'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.class_teachers ct 
    WHERE ct.class_id = (SELECT id FROM cls) AND ct.teacher_id = p.id
  );

COMMIT;


