-- 2_helpers.sql
-- SECURITY DEFINER helper functions to avoid RLS recursion
BEGIN;

-- ===================================================
-- User Role Checks
-- ===================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'admin');
$$;

-- Check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(p_uid uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'teacher');
$$;

-- ===================================================
-- Class Assignment Helpers
-- ===================================================

-- Get student's class_id (returns NULL for teachers/admins)
CREATE OR REPLACE FUNCTION public.user_class_id(p_uid uuid) RETURNS uuid
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT class_id FROM public.profiles WHERE id = p_uid AND role = 'student' LIMIT 1;
$$;

-- Check if teacher is assigned to class (uses class_teachers table)
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(p_uid uuid, p_class uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.class_teachers ct ON ct.teacher_id = p.id
    WHERE p.id = p_uid 
      AND p.role = 'teacher'
      AND ct.class_id = p_class
  );
$$;

-- Get all classes a teacher is assigned to
CREATE OR REPLACE FUNCTION public.get_teacher_classes(p_uid uuid) RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT ct.class_id
  FROM public.profiles p
  JOIN public.class_teachers ct ON ct.teacher_id = p.id
  WHERE p.id = p_uid AND p.role = 'teacher';
$$;

-- Check if a teacher can view an event
CREATE OR REPLACE FUNCTION public.can_teacher_view_event(p_uid uuid, p_event_id uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.events e
    WHERE e.id = p_event_id
      AND (
        -- Event is assigned to this teacher
        e.teacher_id = p_uid OR
        -- Teacher created the event
        e.created_by = p_uid OR
        -- Event is for a class they teach and has no specific teacher assigned
        (e.teacher_id IS NULL AND e.target_class IN (
          SELECT ct.class_id 
          FROM class_teachers ct 
          WHERE ct.teacher_id = p_uid AND ct.is_deleted = FALSE
        ))
      )
  );
$$;

COMMIT;
