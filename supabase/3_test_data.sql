-- 3_test_data.sql
-- Run this last to add test data (OPTIONAL - only for development)

-- Insert test classes
INSERT INTO classes (id, name, capacity) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Class A', 30),
    ('22222222-2222-2222-2222-222222222222', 'Class B', 25);

-- Insert test profiles
-- Replace 'auth-user-id-1' with actual Supabase user IDs after creating users
INSERT INTO profiles (id, full_name, role, class_id) VALUES
    ('auth-user-id-1', 'Admin User', 'admin', NULL),
    ('auth-user-id-2', 'Teacher One', 'teacher', '11111111-1111-1111-1111-111111111111'),
    ('auth-user-id-3', 'Student One', 'student', '11111111-1111-1111-1111-111111111111');

-- Insert test events
INSERT INTO events (title, description, start_at, end_at, event_type, created_by, target_class) VALUES
    ('Math Class', 'Regular math class', NOW() + interval '1 day', NOW() + interval '1 day' + interval '1 hour', 'lesson', 'auth-user-id-2', '11111111-1111-1111-1111-111111111111');

-- Insert test notifications
INSERT INTO notifications (user_id, title, message, status) VALUES
    ('auth-user-id-3', 'Welcome!', 'Welcome to the class', 'unread');
