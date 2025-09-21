-- 6_create_teacher_assignments.sql
-- Idempotent migration to create teacher_assignments table used by admin UI

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(teacher_id, class_id, subject)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON public.teacher_assignments(class_id);

-- No-op if table already exists. Run this in the same Supabase project where other schema migrations were applied.
