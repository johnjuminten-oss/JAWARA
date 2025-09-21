-- Migration to create broadcast_user_status table to track per-user read/dismiss status of broadcasts

CREATE TABLE IF NOT EXISTS broadcast_user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'dismissed')) DEFAULT 'unread',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (broadcast_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_user_status_broadcast_id ON broadcast_user_status(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_user_status_user_id ON broadcast_user_status(user_id);
