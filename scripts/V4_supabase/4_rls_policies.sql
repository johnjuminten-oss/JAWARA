-- 4_rls_policies.sql
-- Enable RLS and create idempotent policies using helper functions
-- Enable RLS safely
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;

-- Drop policies if present to allow safe re-runs
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their class profiles" ON public.profiles;
-- Ensure admin/profile policies are idempotent
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins: explicit policies (avoid USING on INSERT)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Allow authenticated users to create their own profile record (id must match auth.uid())
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view their class profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ( public.is_teacher(auth.uid()) AND profiles.class_id = public.user_class_id(auth.uid()) );

-- Classes policies
DROP POLICY IF EXISTS "Admins can manage all classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their assigned classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view their own class" ON public.classes;
-- Ensure admin/classes policies are idempotent
DROP POLICY IF EXISTS "Admins can view all classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can update classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can delete classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can insert classes" ON public.classes;

-- Admins: explicit policies for classes (avoid USING on INSERT)
CREATE POLICY "Admins can view all classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update classes"
  ON public.classes FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Teachers can view their assigned classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING ( public.is_teacher_of_class(auth.uid(), classes.id) );

CREATE POLICY "Students can view their own class"
  ON public.classes FOR SELECT
  TO authenticated
  USING ( classes.id = public.user_class_id(auth.uid()) );

-- Events policies
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Teachers can manage their class events" ON public.events;
DROP POLICY IF EXISTS "Students can view their class events" ON public.events;
DROP POLICY IF EXISTS "Students can manage their personal events" ON public.events;
-- Ensure admin/events policies are idempotent
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Teachers can view their class events" ON public.events;
DROP POLICY IF EXISTS "Teachers can update their class events" ON public.events;
DROP POLICY IF EXISTS "Teachers can delete their class events" ON public.events;
DROP POLICY IF EXISTS "Teachers can insert class events" ON public.events;
DROP POLICY IF EXISTS "Students can view their personal events" ON public.events;
DROP POLICY IF EXISTS "Students can update their personal events" ON public.events;
DROP POLICY IF EXISTS "Students can delete their personal events" ON public.events;
DROP POLICY IF EXISTS "Students can insert personal events" ON public.events;

-- Admins: explicit policies for events (avoid USING on INSERT)
CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Teachers: split policies so INSERT uses WITH CHECK
CREATE POLICY "Teachers can view their class events"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    public.is_teacher(auth.uid())
    AND public.can_teacher_view_event(auth.uid(), events.id)
  );

CREATE POLICY "Teachers can update their class events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    public.is_teacher(auth.uid())
    AND public.can_teacher_view_event(auth.uid(), events.id)
  );

CREATE POLICY "Teachers can delete their class events"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    public.is_teacher(auth.uid())
    AND public.can_teacher_view_event(auth.uid(), events.id)
  );

CREATE POLICY "Teachers can insert class events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_teacher(auth.uid())
    AND (
      created_by = auth.uid()
      AND (
        -- No teacher assigned (class-wide event)
        teacher_id IS NULL
        -- Or this teacher is assigned
        OR teacher_id = auth.uid()
      )
      AND (
        -- Personal event
        target_class IS NULL
        -- Or teacher is assigned to the class
        OR public.is_teacher_of_class(auth.uid(), target_class)
      )
    )
  );

CREATE POLICY "Students can view their class events"
  ON public.events FOR SELECT
  TO authenticated
  USING (
  ( events.target_class IS NOT NULL AND events.target_class = public.user_class_id(auth.uid()) )
  OR events.created_by = auth.uid()
  );

-- Students: split personal event permissions (INSERT needs WITH CHECK)
CREATE POLICY "Students can view their personal events"
  ON public.events FOR SELECT
  TO authenticated
  USING ( events.created_by = auth.uid() AND event_type = 'personal' );

CREATE POLICY "Students can update their personal events"
  ON public.events FOR UPDATE
  TO authenticated
  USING ( events.created_by = auth.uid() AND event_type = 'personal' );

CREATE POLICY "Students can delete their personal events"
  ON public.events FOR DELETE
  TO authenticated
  USING ( events.created_by = auth.uid() AND event_type = 'personal' );

CREATE POLICY "Students can insert personal events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK ( created_by = auth.uid() AND event_type = 'personal' );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notification status" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notification status"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Alerts policies
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can update their alert status" ON public.alerts;
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their alert status"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create alerts"
  ON public.alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No transaction wrapper: some SQL editors (Supabase) disallow explicit BEGIN/COMMIT blocks.
-- The script is idempotent via DROP POLICY IF EXISTS statements above.
