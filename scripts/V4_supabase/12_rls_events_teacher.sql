-- Allow teachers to select events for classes they teach
-- Idempotent: safe to run multiple times

-- Ensure RLS enabled
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Remove old policy if exists
DROP POLICY IF EXISTS "Teachers can select class events" ON public.events;

CREATE POLICY "Teachers can select class events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (
    -- admins see everything
    public.is_admin(auth.uid())
    OR
    -- teachers may see events targeted at classes they teach
    (
      public.is_teacher(auth.uid())
      AND target_class IS NOT NULL
      AND public.is_teacher_of_class(auth.uid(), target_class)
    )
    OR
    -- creators see their own events
    (created_by = auth.uid())
    OR
    -- public visibility (class/schoolwide)
    (visibility_scope = 'class' OR visibility_scope = 'schoolwide')
  );

-- End of policy
