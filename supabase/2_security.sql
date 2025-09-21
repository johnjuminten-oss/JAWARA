-- 2_security.sql
-- Run this second to set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Classes policies
CREATE POLICY "Anyone can view classes"
    ON classes FOR SELECT
    TO authenticated
    USING (true);

-- Admins: explicit per-command policies for classes
CREATE POLICY "Admins can select classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert classes"
    ON classes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update classes"
    ON classes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete classes"
    ON classes FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Events policies
CREATE POLICY "Users can view relevant events"
    ON events FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid()
        OR target_class IN (
            SELECT class_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Users: per-command policies for events they own
CREATE POLICY "Users can select their events"
    ON events FOR SELECT
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert their events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their events"
    ON events FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their events"
    ON events FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- Teachers: per-command policies for managing class events
CREATE POLICY "Teachers can select class events"
    ON events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'teacher'
            AND class_id = events.target_class
        )
    );

CREATE POLICY "Teachers can insert class events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'teacher'
            AND class_id = target_class
        )
    );

CREATE POLICY "Teachers can update class events"
    ON events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'teacher'
            AND class_id = events.target_class
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'teacher'
            AND class_id = target_class
        )
    );

CREATE POLICY "Teachers can delete class events"
    ON events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'teacher'
            AND class_id = events.target_class
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
