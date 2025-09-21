BEGIN;

-- Seed weekly schedule rows directly into public.events
-- - created_by: first admin profile
-- - created_by_role: 'admin'
-- - target_class: prefers class named 'Kelas 12-H', else first available class
-- - teacher_id: best-effort match by stripping honorifics (Pak/Bu/Ms./Mr.) from provided teacher name
-- - event_type: classify events as follows:
--   * 'exam' - Try Out sessions
--   * 'break' - Break periods (Istirahat)
--   * 'prayer' - Only Sholat Jumat
--   * 'sports' - Physical education (Olahraga)
--   * 'administrative' - Pembinaan and prep sessions
--   * 'lesson' - All other academic classes (including Agama, Seni, TKA)

WITH admin_owner AS (
  SELECT id
  FROM public.profiles
  WHERE role = 'admin'
  ORDER BY created_at NULLS LAST
  LIMIT 1
),
provided_admin AS (
  -- Prefer a specific admin if it exists
  SELECT p.id
  FROM public.profiles p
  WHERE p.id = '17ad9286-9099-4e7f-a49d-72504b747446'
  LIMIT 1
),
preferred_class AS (
  SELECT c.id
  FROM public.classes c
  WHERE c.name = 'Kelas 12-H'
  LIMIT 1
),
fallback_class AS (
  SELECT c.id
  FROM public.classes c
  ORDER BY c.created_at NULLS LAST
  LIMIT 1
),
provided_class AS (
  -- Prefer a specific class id if it exists
  SELECT c.id
  FROM public.classes c
  WHERE c.id = '9252d153-3472-4c96-9437-6ed95431beaa'
  LIMIT 1
),
target_class AS (
  SELECT id FROM provided_class
  UNION ALL
  SELECT id FROM preferred_class WHERE NOT EXISTS (SELECT 1 FROM provided_class)
  UNION ALL
  SELECT id FROM fallback_class WHERE NOT EXISTS (SELECT 1 FROM preferred_class)
),
weekly_schedule(week_no, schedule_date, day_name, start_time, end_time, subject, teacher) AS (
  VALUES
  -- =====================
  -- WEEK 1 (15–19 Sept 2025)
  -- =====================
  (1, DATE '2025-09-15','Senin', TIME '07:00', TIME '07:40','Pembinaan Akademik Wali kelas', NULL),
  (1, DATE '2025-09-15','Senin', TIME '07:40', TIME '08:20','Sosiologi','Bu Yuni'),
  (1, DATE '2025-09-15','Senin', TIME '08:20', TIME '09:00','Sosiologi','Bu Yuni'),
  (1, DATE '2025-09-15','Senin', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (1, DATE '2025-09-15','Senin', TIME '09:30', TIME '10:15','Pendalaman TKA', NULL),
  (1, DATE '2025-09-15','Senin', TIME '10:15', TIME '11:00','Pendalaman TKA', NULL),
  (1, DATE '2025-09-15','Senin', TIME '11:00', TIME '11:45','Sejarah Lanjutan', NULL),
  (1, DATE '2025-09-15','Senin', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (1, DATE '2025-09-15','Senin', TIME '12:50', TIME '13:30','Bahasa Indonesia','Bu Fauziyah'),
  (1, DATE '2025-09-15','Senin', TIME '13:30', TIME '14:10','Bahasa Indonesia','Bu Fauziyah'),
  (1, DATE '2025-09-15','Senin', TIME '14:10', TIME '14:50','Olahraga','Pak Farhan'),
  (1, DATE '2025-09-15','Senin', TIME '14:50', TIME '15:30','Olahraga','Pak Farhan'),

  (1, DATE '2025-09-16','Selasa', TIME '07:00', TIME '07:30','Persiapan Try Out', NULL),
  (1, DATE '2025-09-16','Selasa', TIME '07:30', TIME '09:00','Try Out TKA', NULL),
  (1, DATE '2025-09-16','Selasa', TIME '09:00', TIME '09:30','Try Out TKA', NULL),
  (1, DATE '2025-09-16','Selasa', TIME '09:30', TIME '10:15','Istirahat Pagi', NULL),
  (1, DATE '2025-09-16','Selasa', TIME '10:15', TIME '11:00','Seni Rupa','Pak Sakti'),
  (1, DATE '2025-09-16','Selasa', TIME '11:00', TIME '11:45','Seni Rupa','Pak Sakti'),
  (1, DATE '2025-09-16','Selasa', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (1, DATE '2025-09-16','Selasa', TIME '12:50', TIME '13:30','Matematika Dasar','Bu Ajeng'),
  (1, DATE '2025-09-16','Selasa', TIME '13:30', TIME '14:10','Matematika Dasar','Bu Ajeng'),
  (1, DATE '2025-09-16','Selasa', TIME '14:10', TIME '14:50','Geografi','Pak Eri'),
  (1, DATE '2025-09-16','Selasa', TIME '14:50', TIME '15:30','Geografi','Pak Eri'),

  (1, DATE '2025-09-17','Rabu', TIME '07:00', TIME '07:40','Sosiologi','Bu Yuni'),
  (1, DATE '2025-09-17','Rabu', TIME '07:40', TIME '08:20','Sosiologi','Bu Yuni'),
  (1, DATE '2025-09-17','Rabu', TIME '08:20', TIME '09:00','Agama','Pak Azhar'),
  (1, DATE '2025-09-17','Rabu', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (1, DATE '2025-09-17','Rabu', TIME '09:30', TIME '10:15','Agama','Pak Azhar'),
  (1, DATE '2025-09-17','Rabu', TIME '10:15', TIME '11:00','Sejarah Lanjutan','Pak Fiqih'),
  (1, DATE '2025-09-17','Rabu', TIME '11:00', TIME '11:45','Sejarah Lanjutan','Pak Fiqih'),
  (1, DATE '2025-09-17','Rabu', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (1, DATE '2025-09-17','Rabu', TIME '12:50', TIME '13:30','Sejarah Lanjutan','Pak Fiqih'),
  (1, DATE '2025-09-17','Rabu', TIME '13:30', TIME '14:10','Informatika','Pak Eri'),
  (1, DATE '2025-09-17','Rabu', TIME '14:10', TIME '14:50','Informatika','Pak Eri'),
  (1, DATE '2025-09-17','Rabu', TIME '14:50', TIME '15:30','Informatika','Pak Eri'),

  (1, DATE '2025-09-18','Kamis', TIME '07:00', TIME '07:40','Literasi Kitab Suci', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '07:40', TIME '08:20','Pendalaman TKA', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '08:20', TIME '09:00','Pendalaman TKA', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '09:30', TIME '10:15','Pendalaman TKA', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '10:15', TIME '11:00','Pendalaman TKA', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '11:00', TIME '11:45','PPKN','Bu Indri'),
  (1, DATE '2025-09-18','Kamis', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (1, DATE '2025-09-18','Kamis', TIME '12:50', TIME '13:30','PPKN','Bu Indri'),
  (1, DATE '2025-09-18','Kamis', TIME '13:30', TIME '14:10','Ekonomi','Bu Ulfi'),
  (1, DATE '2025-09-18','Kamis', TIME '14:10', TIME '14:50','Geografi','Pak Eri'),
  (1, DATE '2025-09-18','Kamis', TIME '14:50', TIME '15:30','Geografi','Pak Eri'),

  (1, DATE '2025-09-19','Jumat', TIME '05:30', TIME '07:00','Olahraga Pagi', NULL),
  (1, DATE '2025-09-19','Jumat', TIME '07:00', TIME '07:45','Istirahat', NULL),
  (1, DATE '2025-09-19','Jumat', TIME '07:50', TIME '08:30','Ekonomi','Bu Ulfi'),
  (1, DATE '2025-09-19','Jumat', TIME '08:30', TIME '09:10','Ekonomi','Bu Ulfi'),
  (1, DATE '2025-09-19','Jumat', TIME '09:10', TIME '09:50','Ekonomi','Bu Ulfi'),
  (1, DATE '2025-09-19','Jumat', TIME '09:50', TIME '10:20','Istirahat', NULL),
  (1, DATE '2025-09-19','Jumat', TIME '10:20', TIME '11:00','Matematika Dasar','Bu Ajeng'),
  (1, DATE '2025-09-19','Jumat', TIME '11:00', TIME '11:40','Matematika Dasar','Bu Ajeng'),
  (1, DATE '2025-09-19','Jumat', TIME '11:40', TIME '12:30','Sholat Jumat', NULL),

  -- =====================
  -- WEEK 2 (22–26 Sept 2025)
  -- =====================
  (2, DATE '2025-09-22','Senin', TIME '07:00', TIME '07:40','Pembinaan Akademik Wali kelas', NULL),
  (2, DATE '2025-09-22','Senin', TIME '07:40', TIME '08:20','Sosiologi','Bu Yuni'),
  (2, DATE '2025-09-22','Senin', TIME '08:20', TIME '09:00','Sosiologi','Bu Yuni'),
  (2, DATE '2025-09-22','Senin', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (2, DATE '2025-09-22','Senin', TIME '09:30', TIME '10:15','Pendalaman TKA', NULL),
  (2, DATE '2025-09-22','Senin', TIME '10:15', TIME '11:00','Pendalaman TKA', NULL),
  (2, DATE '2025-09-22','Senin', TIME '11:00', TIME '11:45','Sejarah Lanjutan', NULL),
  (2, DATE '2025-09-22','Senin', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (2, DATE '2025-09-22','Senin', TIME '12:50', TIME '13:30','Bahasa Indonesia','Bu Fauziyah'),
  (2, DATE '2025-09-22','Senin', TIME '13:30', TIME '14:10','Bahasa Indonesia','Bu Fauziyah'),
  (2, DATE '2025-09-22','Senin', TIME '14:10', TIME '14:50','Olahraga','Pak Farhan'),
  (2, DATE '2025-09-22','Senin', TIME '14:50', TIME '15:30','Olahraga','Pak Farhan'),

  (2, DATE '2025-09-23','Selasa', TIME '07:00', TIME '07:40','Inggris','Ms. Aini'),
  (2, DATE '2025-09-23','Selasa', TIME '07:40', TIME '08:20','Inggris','Ms. Aini'),
  (2, DATE '2025-09-23','Selasa', TIME '08:20', TIME '09:00','Sejarah Indonesia','Pak Mun'),
  (2, DATE '2025-09-23','Selasa', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (2, DATE '2025-09-23','Selasa', TIME '09:30', TIME '10:15','Sejarah Indonesia','Pak Mun'),
  (2, DATE '2025-09-23','Selasa', TIME '10:15', TIME '11:00','Seni Rupa','Pak Sakti'),
  (2, DATE '2025-09-23','Selasa', TIME '11:00', TIME '11:45','Seni Rupa','Pak Sakti'),
  (2, DATE '2025-09-23','Selasa', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (2, DATE '2025-09-23','Selasa', TIME '12:50', TIME '13:30','Matematika','Bu Ajeng'),
  (2, DATE '2025-09-23','Selasa', TIME '13:30', TIME '14:10','Matematika','Bu Ajeng'),
  (2, DATE '2025-09-23','Selasa', TIME '14:10', TIME '14:50','Geografi','Pak Eri'),
  (2, DATE '2025-09-23','Selasa', TIME '14:50', TIME '15:30','Geografi','Pak Eri'),

  (2, DATE '2025-09-24','Rabu', TIME '07:00', TIME '07:40','Sosiologi','Bu Yuni'),
  (2, DATE '2025-09-24','Rabu', TIME '07:40', TIME '08:20','Sosiologi','Bu Yuni'),
  (2, DATE '2025-09-24','Rabu', TIME '08:20', TIME '09:00','Agama','Pak Azhar'),
  (2, DATE '2025-09-24','Rabu', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (2, DATE '2025-09-24','Rabu', TIME '09:30', TIME '10:15','Agama','Pak Azhar'),
  (2, DATE '2025-09-24','Rabu', TIME '10:15', TIME '11:00','Sejarah Lanjutan','Pak Fiqih'),
  (2, DATE '2025-09-24','Rabu', TIME '11:00', TIME '11:45','Sejarah Lanjutan','Pak Fiqih'),
  (2, DATE '2025-09-24','Rabu', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (2, DATE '2025-09-24','Rabu', TIME '12:50', TIME '13:30','Sejarah Lanjutan','Pak Fiqih'),
  (2, DATE '2025-09-24','Rabu', TIME '13:30', TIME '14:10','Informatika','Pak Eri'),
  (2, DATE '2025-09-24','Rabu', TIME '14:10', TIME '14:50','Informatika','Pak Eri'),
  (2, DATE '2025-09-24','Rabu', TIME '14:50', TIME '15:30','Informatika','Pak Eri'),

  (2, DATE '2025-09-25','Kamis', TIME '07:40', TIME '08:20','Pendalaman TKA', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '08:20', TIME '09:00','Pendalaman TKA', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '09:00', TIME '09:30','Istirahat Pagi', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '09:30', TIME '10:15','Pendalaman TKA', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '10:15', TIME '11:00','Pendalaman TKA', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '11:00', TIME '11:45','PPKN','Bu Indri'),
  (2, DATE '2025-09-25','Kamis', TIME '11:45', TIME '12:50','Istirahat Siang', NULL),
  (2, DATE '2025-09-25','Kamis', TIME '12:50', TIME '13:30','PPKN','Bu Indri'),
  (2, DATE '2025-09-25','Kamis', TIME '13:30', TIME '14:10','Ekonomi','Bu Ulfi'),
  (2, DATE '2025-09-25','Kamis', TIME '14:10', TIME '14:50','Geografi','Pak Eri'),
  (2, DATE '2025-09-25','Kamis', TIME '14:50', TIME '15:30','Geografi','Pak Eri'),

  (2, DATE '2025-09-26','Jumat', TIME '05:30', TIME '07:00','Olahraga Pagi', NULL),
  (2, DATE '2025-09-26','Jumat', TIME '07:00', TIME '07:45','Istirahat', NULL),
  (2, DATE '2025-09-26','Jumat', TIME '07:50', TIME '08:30','Ekonomi','Bu Ulfi'),
  (2, DATE '2025-09-26','Jumat', TIME '08:30', TIME '09:10','Ekonomi','Bu Ulfi'),
  (2, DATE '2025-09-26','Jumat', TIME '09:10', TIME '09:50','Ekonomi','Bu Ulfi'),
  (2, DATE '2025-09-26','Jumat', TIME '09:50', TIME '10:20','Istirahat', NULL),
  (2, DATE '2025-09-26','Jumat', TIME '10:20', TIME '11:00','Matematika Dasar','Bu Ajeng'),
  (2, DATE '2025-09-26','Jumat', TIME '11:00', TIME '11:40','Matematika Dasar','Bu Ajeng'),
  (2, DATE '2025-09-26','Jumat', TIME '11:40', TIME '12:30','Sholat Jumat', NULL)
),
normalized AS (
  SELECT
    ws.*,
    NULLIF(btrim(regexp_replace(coalesce(ws.teacher,''), '^(Pak|Bu|Ms\.?|Mr\.?)[ ]+', '', 'i')), '') AS teacher_clean
  FROM weekly_schedule ws
)
INSERT INTO public.events (
  title,
  description,
  event_type,
  start_at,
  end_at,
  location,
  created_by,
  created_by_role,
  target_class,
  target_user,
  teacher_id,
  visibility_scope,
  metadata
)
SELECT
  n.subject AS title,
  NULL AS description,
  CASE
    -- Exams
    WHEN n.subject ILIKE 'Try Out%' THEN 'exam'

    -- Breaks
    WHEN n.subject ILIKE 'Istirahat%' THEN 'break'

    -- Prayer (only Sholat Jumat)
    WHEN n.subject ILIKE 'Sholat Jumat%' THEN 'prayer'

    -- Sports
    WHEN n.subject ILIKE 'Olahraga%' THEN 'sports'

    -- Administrative
    WHEN n.subject ILIKE 'Pembinaan%' 
      OR n.subject ILIKE 'Persiapan%' THEN 'administrative'

    -- Default: all others (Seni Rupa, Agama, Pendalaman TKA, etc.)
    ELSE 'lesson'
  END::public.event_type AS event_type,
  -- interpret local times as Asia/Jakarta and store as timestamptz
  (n.schedule_date + n.start_time) AT TIME ZONE 'Asia/Jakarta' AS start_at,
  (n.schedule_date + n.end_time) AT TIME ZONE 'Asia/Jakarta' AS end_at,
  'Kelas' AS location,
  COALESCE(pa.id, ao.id) AS created_by,
  'admin'::public.user_role AS created_by_role,
  tc.id AS target_class,
  NULL::uuid AS target_user,
  t.id AS teacher_id,
  CASE WHEN tc.id IS NOT NULL THEN 'class' ELSE 'schoolwide' END::public.visibility_scope AS visibility_scope,
  jsonb_build_object(
    'week_no', n.week_no,
    'day_name', n.day_name,
    'teacher_name', n.teacher,
    'color', CASE 
      WHEN n.subject ILIKE 'Try Out%' THEN '#DC3545'   -- exam: red
      WHEN n.subject ILIKE 'Istirahat%' THEN '#F8F9FA' -- break: light gray
      WHEN n.subject ILIKE 'Sholat Jumat%' THEN '#6F42C1' -- prayer: purple
      WHEN n.subject ILIKE 'Olahraga%' THEN '#FD7E14'  -- sports: orange
      WHEN n.subject ILIKE 'Pembinaan%' OR n.subject ILIKE 'Persiapan%' THEN '#FFC107' -- admin: yellow
      ELSE '#28A745'  -- lesson: green
    END,
    'subject_type', CASE 
      WHEN n.subject ILIKE '%Matematika%' THEN 'mathematics'
      WHEN n.subject ILIKE '%Bahasa%' OR n.subject ILIKE '%Inggris%' THEN 'language'
      WHEN n.subject ILIKE '%Geografi%' OR n.subject ILIKE '%Sejarah%' OR n.subject ILIKE '%Sosiologi%' THEN 'social_science'
      WHEN n.subject ILIKE '%PPKN%' THEN 'civics'
      WHEN n.subject ILIKE '%Informatika%' THEN 'technology'
      WHEN n.subject ILIKE '%Agama%' OR n.subject ILIKE 'Literasi Kitab%' THEN 'religious'
      WHEN n.subject ILIKE 'Olahraga%' THEN 'physical_education'
      ELSE 'general'
    END
  ) AS metadata
FROM normalized n
LEFT JOIN provided_admin pa ON TRUE
LEFT JOIN admin_owner ao ON TRUE
LEFT JOIN target_class tc ON TRUE
LEFT JOIN public.profiles t
  ON t.role = 'teacher'
 AND n.teacher_clean IS NOT NULL
 AND t.full_name ILIKE '%' || n.teacher_clean || '%';

COMMIT;
