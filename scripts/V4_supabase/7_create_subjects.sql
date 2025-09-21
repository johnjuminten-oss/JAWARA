-- 7_create_subjects.sql
-- Idempotent migration to create subjects and link table class_subjects used by the app

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_subjects (many-to-many mapping between classes and subjects)
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON public.class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON public.class_subjects(subject_id);

-- Notes: The dashboard code expects to query subjects and inner join class_subjects by class_id.
