-- 8_create_assignments.sql
-- Idempotent migration to create assignments and submissions tables

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);

-- NOTE: The dashboard used a PostgREST expand notation `submissions!assignments_submissions_fkey(id, submitted_at, points_earned)`
-- which expects a FK constraint named something like assignments_submissions_fkey. The FK created via REFERENCES will work for that expansion.
