-- 1_schema.sql
-- Run this first to set up the basic database structure

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE event_type AS ENUM ('lesson', 'exam', 'assignment', 'personal', 'broadcast');
CREATE TYPE notification_status AS ENUM ('unread', 'read');

-- Create tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'student',
    class_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 30,
    current_enrollment INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    location TEXT,
    event_type event_type NOT NULL,
    created_by UUID REFERENCES profiles(id),
    target_class UUID REFERENCES classes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status notification_status DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_class ON profiles(class_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
