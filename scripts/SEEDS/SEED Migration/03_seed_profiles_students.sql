-- Seed student profiles derived from Siswa.sql
BEGIN;

-- Attach students to class 'Kelas 12-H' if exists
WITH target_class AS (
  SELECT id FROM public.classes WHERE name = 'Kelas 12-H'
)
, s AS (
  SELECT 'Sarah Aquinny Lontoh'::text AS full_name, 'sarahaquinl06@gmail.com'::text AS email UNION ALL
  SELECT 'Farhan Ramadhan Kusumawardhana', 'farhan.dhanwar@gmail.com' UNION ALL
  SELECT 'Soraya Fatika Arawinda Galela', 'sorayfatika@gmail.com' UNION ALL
  SELECT 'Radya Raka Ramadhan', 'rdyark@gmail.com' UNION ALL
  SELECT 'Agna Ilma Solihah', 'agnailmasolihah@gmail.com' UNION ALL
  SELECT 'Khalif Ali Husain', 'khalifalihusain30@gmail.com' UNION ALL
  SELECT 'Nurna Annisa Finsa', 'finsanurna@gmail.com' UNION ALL
  SELECT 'muhammad fabero arkana', 'muhammad.fabero@gmail.com' UNION ALL
  SELECT 'Syarifa Syah Putri', 'syarifasyahputri@gmail.com' UNION ALL
  SELECT 'Salma Fatiha Putri Rahardian', 'salmafatihaputri@gmail.com' UNION ALL
  SELECT 'Pradhika Varen Wicaksono', 'varenwicaksono@gmail.com' UNION ALL
  SELECT 'Jovita Fiducia', 'jovitaf.107@gmail.com' UNION ALL
  SELECT 'maliqa indra putri', 'maliqa.indra08@gmail.com' UNION ALL
  SELECT 'fatima aletha zahra', 'alethasofian@gmail.com' UNION ALL
  SELECT 'Khansa Putri Karnova', 'karnovakhansa@gmail.com' UNION ALL
  SELECT 'Nazara Rifqa Rizkyantika', 'nazararifqa@gmail.com' UNION ALL
  SELECT 'Aldila Prasasti', 'aldilaprasastireal@gmail.com' UNION ALL
  SELECT 'Disya Az Zahra Zulnasri', 'disyazulnasri0610@gmail.com' UNION ALL
  SELECT 'Kanesha Vallia', 'kaneshavallia@gmail.com'
)
INSERT INTO public.profiles (id, email, full_name, role, class_id, created_at)
SELECT uuid_generate_v4(), s.email, s.full_name, 'student', (SELECT id FROM target_class), NOW()
FROM s
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.email = s.email
);

COMMIT;


