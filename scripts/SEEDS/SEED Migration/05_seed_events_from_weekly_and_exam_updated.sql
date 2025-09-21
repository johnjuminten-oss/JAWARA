BEGIN;

-- Keep existing CTEs until normalized...
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
  -- Keep existing VALUES section...
  -- Week 1
  (1, DATE '2025-09-15','Senin', TIME '07:00', TIME '07:40','Pembinaan Akademik Wali kelas', NULL),
  -- ... (keep all existing schedule entries)
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
  CASE
    WHEN n.subject ILIKE 'Try Out%' THEN 'Ujian Try Out untuk persiapan'
    WHEN n.subject ILIKE 'Pembinaan%' THEN 'Sesi pembinaan akademik dengan wali kelas'
    WHEN n.subject ILIKE 'Pendalaman%' THEN 'Sesi pendalaman materi'
    ELSE NULL
  END AS description,
  CASE
    -- Academic events
    WHEN n.subject ILIKE 'Try Out%' THEN 'exam'
    WHEN n.subject ILIKE 'Pendalaman%' THEN 'academic_notes'
    WHEN n.subject ILIKE '%Matematika%' 
      OR n.subject ILIKE '%Bahasa%'
      OR n.subject ILIKE '%Inggris%'
      OR n.subject ILIKE '%Geografi%'
      OR n.subject ILIKE '%Ekonomi%'
      OR n.subject ILIKE '%PPKN%'
      OR n.subject ILIKE '%Sosiologi%'
      OR n.subject ILIKE '%Sejarah%'
      OR n.subject ILIKE '%Informatika%' THEN 'regular_study'
    
    -- Break and Prayer times
    WHEN n.subject ILIKE 'Istirahat%' THEN 'break'
    WHEN n.subject ILIKE 'Sholat%' 
      OR n.subject ILIKE '%Agama%'
      OR n.subject ILIKE 'Literasi Kitab%' THEN 'prayer'
    
    -- Physical Activities
    WHEN n.subject ILIKE 'Olahraga%' THEN 'sports'
    
    -- Arts and Culture
    WHEN n.subject ILIKE '%Seni%' THEN 'arts'
    
    -- Administrative
    WHEN n.subject ILIKE 'Pembinaan%' 
      OR n.subject ILIKE 'Persiapan%' THEN 'administrative'
    
    -- Default to regular study for other subjects
    ELSE 'regular_study'
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
  CASE 
    WHEN n.subject ILIKE 'Sholat%' OR n.subject ILIKE 'Istirahat%' THEN 'schoolwide'
    ELSE 'class' 
  END::public.visibility_scope AS visibility_scope,
  jsonb_build_object(
    'week_no', n.week_no,
    'day_name', n.day_name,
    'teacher_name', n.teacher,
    'color', CASE 
      WHEN n.subject ILIKE 'Try Out%' THEN '#DC3545'  -- Red for exams
      WHEN n.subject ILIKE 'Pendalaman%' THEN '#0D6EFD'  -- Blue for academic notes
      WHEN n.subject ILIKE 'Istirahat%' THEN '#F8F9FA'  -- Light gray for breaks
      WHEN n.subject ILIKE 'Sholat%' OR n.subject ILIKE '%Agama%' THEN '#20C997'  -- Teal for prayer
      WHEN n.subject ILIKE 'Olahraga%' THEN '#FD7E14'  -- Orange for sports
      WHEN n.subject ILIKE '%Seni%' THEN '#6F42C1'  -- Purple for arts
      WHEN n.subject ILIKE 'Pembinaan%' OR n.subject ILIKE 'Persiapan%' THEN '#FFC107'  -- Yellow for administrative
      ELSE '#198754'  -- Green for regular study
    END,
    'subject_type', CASE 
      WHEN n.subject ILIKE '%Matematika%' THEN 'mathematics'
      WHEN n.subject ILIKE '%Bahasa%' THEN 'language'
      WHEN n.subject ILIKE '%Inggris%' THEN 'language'
      WHEN n.subject ILIKE '%Geografi%' THEN 'social_science'
      WHEN n.subject ILIKE '%Ekonomi%' THEN 'social_science'
      WHEN n.subject ILIKE '%PPKN%' THEN 'civics'
      WHEN n.subject ILIKE '%Informatika%' THEN 'technology'
      WHEN n.subject ILIKE '%Agama%' THEN 'religious'
      WHEN n.subject ILIKE 'Olahraga%' THEN 'physical_education'
      WHEN n.subject ILIKE '%Seni%' THEN 'arts'
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