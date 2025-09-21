-- 9_rls_new_tables.sql
-- Idempotent RLS policies for newly added tables: subjects, class_subjects, teacher_assignments, assignments, submissions
-- Uses helper functions from 2_helpers.sql (public.is_admin, public.is_teacher_of_class, public.user_class_id)

-- Ensure RLS is enabled on these tables
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to allow safe re-runs
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can view subjects" ON public.subjects;

DROP POLICY IF EXISTS "Admins can manage class_subjects" ON public.class_subjects;
DROP POLICY IF EXISTS "Teachers can view their class_subjects" ON public.class_subjects;

DROP POLICY IF EXISTS "Admins can manage teacher_assignments" ON public.teacher_assignments;
DROP POLICY IF EXISTS "Teachers can manage their teacher_assignments" ON public.teacher_assignments;

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage class assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view class assignments" ON public.assignments;

DROP POLICY IF EXISTS "Admins can manage submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can manage their submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their classes" ON public.submissions;

-- Subjects: admins manage, authenticated can view
-- Admins: explicit per-command policies for subjects
CREATE POLICY "Admins can select subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert subjects"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update subjects"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete subjects"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

-- class_subjects: admins manage; teachers can view subjects for their classes
-- Admins: explicit per-command policies for class_subjects
CREATE POLICY "Admins can select class_subjects"
  ON public.class_subjects FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert class_subjects"
  ON public.class_subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update class_subjects"
  ON public.class_subjects FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete class_subjects"
  ON public.class_subjects FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Teachers can view their class_subjects"
  ON public.class_subjects FOR SELECT
  TO authenticated
  USING ( public.is_teacher_of_class(auth.uid(), class_subjects.class_id) );

-- teacher_assignments: admins manage; teachers can view/manage for their classes
-- Admins: explicit per-command policies for teacher_assignments
CREATE POLICY "Admins can select teacher_assignments"
  ON public.teacher_assignments FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert teacher_assignments"
  ON public.teacher_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update teacher_assignments"
  ON public.teacher_assignments FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete teacher_assignments"
  ON public.teacher_assignments FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Teachers: per-command policies for teacher_assignments
CREATE POLICY "Teachers can select their teacher_assignments"
  ON public.teacher_assignments FOR SELECT
  TO authenticated
  USING ( public.is_teacher_of_class(auth.uid(), teacher_assignments.class_id) );

CREATE POLICY "Teachers can insert their teacher_assignments"
  ON public.teacher_assignments FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_teacher_of_class(auth.uid(), teacher_assignments.class_id) );

CREATE POLICY "Teachers can update their teacher_assignments"
  ON public.teacher_assignments FOR UPDATE
  TO authenticated
  USING ( public.is_teacher_of_class(auth.uid(), teacher_assignments.class_id) )
  WITH CHECK ( public.is_teacher_of_class(auth.uid(), teacher_assignments.class_id) );

CREATE POLICY "Teachers can delete their teacher_assignments"
  ON public.teacher_assignments FOR DELETE
  TO authenticated
  USING ( public.is_teacher_of_class(auth.uid(), teacher_assignments.class_id) );

-- assignments: admins manage; teachers can create/update/delete for their classes; students can view
-- Admins: explicit per-command policies for assignments
CREATE POLICY "Admins can select assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Teachers can insert class assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_teacher(auth.uid()) );

CREATE POLICY "Teachers can update class assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING ( public.is_teacher(auth.uid()) )
  WITH CHECK ( public.is_teacher(auth.uid()) );

CREATE POLICY "Teachers can delete class assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING ( public.is_teacher(auth.uid()) );

CREATE POLICY "Students can view class assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING ( assignments.class_id = public.user_class_id(auth.uid()) );

-- submissions: admins manage; students can create/manage own submissions; teachers can view submissions for their classes
-- Admins: explicit per-command policies for submissions
CREATE POLICY "Admins can select submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete submissions"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can insert their submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK ( submissions.student_id = auth.uid() );

CREATE POLICY "Students can update their submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING ( submissions.student_id = auth.uid() )
  WITH CHECK ( submissions.student_id = auth.uid() );

CREATE POLICY "Students can delete their submissions"
  ON public.submissions FOR DELETE
  TO authenticated
  USING ( submissions.student_id = auth.uid() );

CREATE POLICY "Teachers can view submissions for their classes"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    public.is_teacher(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
        AND public.is_teacher_of_class(auth.uid(), a.class_id)
    )
  );

-- End of policies for new tables
