-- 1_schema.sql
-- Clean idempotent schema for School Schedule System (with soft delete + views)
BEGIN;

-- ===================================================
-- EXTENSIONS
-- ===================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===================================================
-- ENUM TYPES
-- ===================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin','teacher','student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM (
      'lesson','exam','assignment',
      'personal','broadcast','urgent_broadcast','class_announcement'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('unread','read','dismissed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('event_update','alert','system','notification');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    CREATE TYPE alert_type AS ENUM ('exam_reminder','overload_warning','conflict_alert','announcement');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_scope') THEN
    CREATE TYPE visibility_scope AS ENUM ('all','role','class','batch','personal','schoolwide');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type') THEN
    CREATE TYPE delivery_type AS ENUM ('in_app','email','both');
  END IF;
END$$;

-- ===================================================
-- BATCHES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- CLASSES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 30,
  current_enrollment INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- PROFILES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  class_id UUID REFERENCES public.classes(id),
  batch_id UUID REFERENCES public.batches(id),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- CLASS_TEACHERS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.class_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(class_id, teacher_id)
);

-- ===================================================
-- EVENTS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  event_type event_type NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_by_role user_role,
  target_class UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  target_user UUID REFERENCES public.profiles(id),
  teacher_id UUID REFERENCES public.profiles(id),
  CHECK (
    (target_class IS NOT NULL AND target_user IS NULL)
    OR (target_user IS NOT NULL AND target_class IS NULL)
    OR (target_class IS NULL AND target_user IS NULL)
  ),
  -- Ensure teacher_id references a teacher
  CHECK (
    teacher_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = teacher_id AND p.role = 'teacher'
    )
  ),
  visibility_scope visibility_scope DEFAULT 'all',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- NOTIFICATIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.events(id),
  title TEXT,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  status notification_status DEFAULT 'unread',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conname = 'chk_notifications_event_or_message'
      AND c.conrelid = 'public.notifications'::regclass
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT chk_notifications_event_or_message CHECK (event_id IS NOT NULL OR message IS NOT NULL);
  END IF;
END$$;

-- ===================================================
-- ALERTS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  alert_type alert_type NOT NULL,
  message TEXT NOT NULL,
  delivery delivery_type DEFAULT 'in_app',
  status notification_status DEFAULT 'unread',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- VIEWS (Calendar Events)
-- ===================================================
-- Student view
CREATE OR REPLACE VIEW public.student_calendar_events AS
SELECT 
  e.*, p.id AS student_id
FROM public.events e
JOIN public.profiles p
  ON (
    (e.target_class IS NOT NULL AND e.target_class = p.class_id)
    OR (e.target_user IS NOT NULL AND e.target_user = p.id)
    OR (e.visibility_scope IN ('all','schoolwide'))
  )
WHERE e.is_deleted = FALSE
  AND p.is_deleted = FALSE;

-- Teacher view
CREATE OR REPLACE VIEW public.teacher_calendar_events AS
SELECT 
  e.*, t.id AS viewing_teacher_id
FROM public.events e
JOIN public.profiles t ON (
  -- Show events assigned to this teacher
  (e.teacher_id = t.id) OR
  -- Show events this teacher created
  (e.created_by = t.id) OR
  -- Show events for classes they teach (only if no specific teacher assigned)
  (e.teacher_id IS NULL AND e.target_class IN (
    SELECT ct.class_id 
    FROM class_teachers ct 
    WHERE ct.teacher_id = t.id AND ct.is_deleted = FALSE
  ))
)
WHERE t.role = 'teacher'
  AND e.is_deleted = FALSE
  AND t.is_deleted = FALSE;

-- ===================================================
-- INDEXES
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_target_class ON public.events(target_class);
CREATE INDEX IF NOT EXISTS idx_events_target_user ON public.events(target_user);
CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON public.events(teacher_id);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);

COMMIT;

-- 1_schema.sql
-- Clean idempotent schema for School Schedule System
BEGIN;

-- ===================================================
-- EXTENSIONS
-- ===================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===================================================
-- ENUM TYPES
-- ===================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin','teacher','student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM (
      'lesson','exam','assignment',
      'personal','broadcast','urgent_broadcast','class_announcement'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('unread','read','dismissed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('event_update','alert','system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    CREATE TYPE alert_type AS ENUM ('exam_reminder','overload_warning','conflict_alert','announcement');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_scope') THEN
    CREATE TYPE visibility_scope AS ENUM ('all','role','class','batch','personal','schoolwide');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type') THEN
    CREATE TYPE delivery_type AS ENUM ('in_app','email','both');
  END IF;
END$$;

-- If running against an existing DB where the enum already exists, ensure 'notification' value is present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'notification_type' AND e.enumlabel = 'notification'
    ) THEN
      ALTER TYPE notification_type ADD VALUE 'notification';
    END IF;
  END IF;
END$$;

-- ===================================================
-- BATCHES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- e.g., "2025", "X", "XI"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- CLASSES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "X MIPA 1"
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 30,
  current_enrollment INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- PROFILES (Users)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  class_id UUID REFERENCES public.classes(id), -- for students
  batch_id UUID REFERENCES public.batches(id), -- grouping by year
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ===================================================
-- CLASS_TEACHERS (NEW: Relation between class and teachers)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.class_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, teacher_id)
);

-- Events (normalized targeting)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  event_type event_type NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  -- optional helper to make ownership easier to query without a join
  created_by_role user_role,
  -- explicit foreign keys for targeting
  target_class UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  target_user UUID REFERENCES public.profiles(id),
  -- enforce mutual exclusivity: either target_class OR target_user (or neither for schoolwide)
  CHECK (
    (target_class IS NOT NULL AND target_user IS NULL)
    OR (target_user IS NOT NULL AND target_class IS NULL)
    OR (target_class IS NULL AND target_user IS NULL)
  ),
  -- optional visibility scope for quick filtering (strict enum)
  visibility_scope visibility_scope DEFAULT 'all',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- index to speed up class-targeted lookupsd
CREATE INDEX IF NOT EXISTS idx_events_target_class ON public.events(target_class);
CREATE INDEX IF NOT EXISTS idx_events_target_user ON public.events(target_user);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.events(id),
  title TEXT,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  status notification_status DEFAULT 'unread',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Ensure notifications contain at least a message or a linked event (message is NOT NULL by schema,
-- but this explicit check documents intent and allows future message-null variants)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conname = 'chk_notifications_event_or_message'
      AND c.conrelid = 'public.notifications'::regclass
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT chk_notifications_event_or_message CHECK (event_id IS NOT NULL OR message IS NOT NULL);
  END IF;
END$$;

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  alert_type alert_type NOT NULL,
  message TEXT NOT NULL,
  delivery delivery_type DEFAULT 'in_app',
  status notification_status DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);

COMMIT;
