-- Zoom Integration Schema for Sconce LMS
-- Run this in Supabase SQL Editor to create Zoom-related tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== INSTRUCTOR ZOOM ACCOUNTS ====================

-- Store instructor Zoom OAuth connections
CREATE TABLE IF NOT EXISTS instructor_zoom_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id TEXT NOT NULL UNIQUE, -- Links to instructor in your auth system
  zoom_user_id TEXT NOT NULL UNIQUE, -- Zoom's user ID
  zoom_email VARCHAR(255) NOT NULL,
  zoom_first_name VARCHAR(255),
  zoom_last_name VARCHAR(255),
  
  -- OAuth tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  token_scope TEXT,
  
  -- Connection metadata
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_token_refresh TIMESTAMP WITH TIME ZONE,
  connection_status VARCHAR(50) DEFAULT 'active' CHECK (connection_status IN ('active', 'disconnected', 'expired')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_instructor_zoom_auth_instructor_id ON instructor_zoom_auth(instructor_id);
CREATE INDEX idx_instructor_zoom_auth_zoom_user_id ON instructor_zoom_auth(zoom_user_id);
CREATE INDEX idx_instructor_zoom_auth_connection_status ON instructor_zoom_auth(connection_status);

-- ==================== ZOOM MEETINGS ====================

-- Store Zoom meetings created from Sconce
CREATE TABLE IF NOT EXISTS zoom_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoom_meeting_id BIGINT NOT NULL UNIQUE, -- Zoom's meeting ID
  
  -- Course/Instructor information
  course_id TEXT NOT NULL, -- Link to course in your system
  instructor_id TEXT NOT NULL, -- References instructor_zoom_auth
  week_id TEXT, -- Optional: specific week in course
  content_item_id TEXT, -- Optional: specific content item
  
  -- Meeting details
  topic VARCHAR(300) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  timezone VARCHAR(100) DEFAULT 'UTC',
  password VARCHAR(50),
  join_url TEXT NOT NULL,
  
  -- Meeting settings
  waiting_room BOOLEAN DEFAULT true,
  join_before_host BOOLEAN DEFAULT false,
  mute_upon_entry BOOLEAN DEFAULT true,
  host_video BOOLEAN DEFAULT true,
  participant_video BOOLEAN DEFAULT false,
  
  -- Meeting status
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'in_progress', 'ended', 'cancelled')
  ),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_zoom_meetings_zoom_meeting_id ON zoom_meetings(zoom_meeting_id);
CREATE INDEX idx_zoom_meetings_course_id ON zoom_meetings(course_id);
CREATE INDEX idx_zoom_meetings_instructor_id ON zoom_meetings(instructor_id);
CREATE INDEX idx_zoom_meetings_start_time ON zoom_meetings(start_time);
CREATE INDEX idx_zoom_meetings_status ON zoom_meetings(status);
CREATE INDEX idx_zoom_meetings_week_id ON zoom_meetings(week_id);

-- ==================== MEETING PARTICIPANTS ====================

-- Track who joined meetings (optional - for attendance tracking)
CREATE TABLE IF NOT EXISTS zoom_meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES zoom_meetings(id) ON DELETE CASCADE,
  
  -- Participant info
  user_id TEXT NOT NULL, -- Student or instructor ID
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_role VARCHAR(50), -- 'host', 'co-host', 'participant'
  
  -- Attendance tracking
  join_time TIMESTAMP WITH TIME ZONE,
  leave_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  join_url_used TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_zoom_meeting_participants_meeting_id ON zoom_meeting_participants(meeting_id);
CREATE INDEX idx_zoom_meeting_participants_user_id ON zoom_meeting_participants(user_id);

-- ==================== MEETING RECORDINGS ====================

-- Store information about recorded meetings
CREATE TABLE IF NOT EXISTS zoom_meeting_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES zoom_meetings(id) ON DELETE CASCADE,
  
  -- Recording details
  zoom_recording_id TEXT NOT NULL UNIQUE,
  recording_type VARCHAR(50), -- 'cloud', 'local', 'on_demand'
  duration_minutes INTEGER,
  file_size BIGINT,
  
  -- Recording file
  file_name TEXT,
  download_url TEXT,
  play_url TEXT,
  
  -- Sharing settings
  is_shared BOOLEAN DEFAULT false,
  share_with_students BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_zoom_meeting_recordings_meeting_id ON zoom_meeting_recordings(meeting_id);
CREATE INDEX idx_zoom_meeting_recordings_zoom_recording_id ON zoom_meeting_recordings(zoom_recording_id);

-- ==================== MEETING WEBHOOKS LOG ====================

-- Log incoming webhooks from Zoom for debugging
CREATE TABLE IF NOT EXISTS zoom_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  event_type VARCHAR(100) NOT NULL,
  zoom_event_id TEXT,
  zoom_meeting_id BIGINT,
  
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_zoom_webhook_logs_event_type ON zoom_webhook_logs(event_type);
CREATE INDEX idx_zoom_webhook_logs_zoom_meeting_id ON zoom_webhook_logs(zoom_meeting_id);
CREATE INDEX idx_zoom_webhook_logs_processed ON zoom_webhook_logs(processed);

-- ==================== MEETING SYNC LOG ====================

-- Track sync status between Zoom and Sconce
CREATE TABLE IF NOT EXISTS zoom_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  sync_type VARCHAR(100) NOT NULL, -- 'meeting_created', 'recording_available', 'participant_joined', etc.
  meeting_id UUID REFERENCES zoom_meetings(id) ON DELETE SET NULL,
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_zoom_sync_logs_meeting_id ON zoom_sync_logs(meeting_id);
CREATE INDEX idx_zoom_sync_logs_sync_type ON zoom_sync_logs(sync_type);
CREATE INDEX idx_zoom_sync_logs_status ON zoom_sync_logs(status);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_zoom_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_instructor_zoom_auth_updated_at ON instructor_zoom_auth;
DROP TRIGGER IF EXISTS update_zoom_meetings_updated_at ON zoom_meetings;
DROP TRIGGER IF EXISTS update_zoom_meeting_participants_updated_at ON zoom_meeting_participants;
DROP TRIGGER IF EXISTS update_zoom_meeting_recordings_updated_at ON zoom_meeting_recordings;
DROP TRIGGER IF EXISTS update_zoom_sync_logs_updated_at ON zoom_sync_logs;

CREATE TRIGGER update_instructor_zoom_auth_updated_at BEFORE UPDATE ON instructor_zoom_auth
  FOR EACH ROW EXECUTE FUNCTION update_zoom_updated_at_column();

CREATE TRIGGER update_zoom_meetings_updated_at BEFORE UPDATE ON zoom_meetings
  FOR EACH ROW EXECUTE FUNCTION update_zoom_updated_at_column();

CREATE TRIGGER update_zoom_meeting_participants_updated_at BEFORE UPDATE ON zoom_meeting_participants
  FOR EACH ROW EXECUTE FUNCTION update_zoom_updated_at_column();

CREATE TRIGGER update_zoom_meeting_recordings_updated_at BEFORE UPDATE ON zoom_meeting_recordings
  FOR EACH ROW EXECUTE FUNCTION update_zoom_updated_at_column();

CREATE TRIGGER update_zoom_sync_logs_updated_at BEFORE UPDATE ON zoom_sync_logs
  FOR EACH ROW EXECUTE FUNCTION update_zoom_updated_at_column();

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS
ALTER TABLE instructor_zoom_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) to access all
-- Instructors can only see their own meetings
-- Students can see meetings in their courses

DROP POLICY IF EXISTS "Allow all for instructor_zoom_auth" ON instructor_zoom_auth;
DROP POLICY IF EXISTS "Allow all for zoom_meetings" ON zoom_meetings;
DROP POLICY IF EXISTS "Allow all for zoom_meeting_participants" ON zoom_meeting_participants;
DROP POLICY IF EXISTS "Allow all for zoom_meeting_recordings" ON zoom_meeting_recordings;
DROP POLICY IF EXISTS "Allow all for zoom_webhook_logs" ON zoom_webhook_logs;
DROP POLICY IF EXISTS "Allow all for zoom_sync_logs" ON zoom_sync_logs;

-- Basic policies - customize based on your auth setup
CREATE POLICY "Allow all for instructor_zoom_auth" ON instructor_zoom_auth FOR ALL USING (true);
CREATE POLICY "Allow all for zoom_meetings" ON zoom_meetings FOR ALL USING (true);
CREATE POLICY "Allow all for zoom_meeting_participants" ON zoom_meeting_participants FOR ALL USING (true);
CREATE POLICY "Allow all for zoom_meeting_recordings" ON zoom_meeting_recordings FOR ALL USING (true);
CREATE POLICY "Allow all for zoom_webhook_logs" ON zoom_webhook_logs FOR ALL USING (true);
CREATE POLICY "Allow all for zoom_sync_logs" ON zoom_sync_logs FOR ALL USING (true);

-- ==================== REALTIME ====================

-- Enable realtime for important tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'zoom_meetings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE zoom_meetings;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'zoom_meeting_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE zoom_meeting_participants;
  END IF;
END $$;

-- ==================== SUCCESS MESSAGE ====================

DO $$
BEGIN
  RAISE NOTICE '✅ Zoom Integration schema created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - instructor_zoom_auth (OAuth connections)';
  RAISE NOTICE '  - zoom_meetings (Meeting records)';
  RAISE NOTICE '  - zoom_meeting_participants (Attendance tracking)';
  RAISE NOTICE '  - zoom_meeting_recordings (Recording management)';
  RAISE NOTICE '  - zoom_webhook_logs (Webhook logging)';
  RAISE NOTICE '  - zoom_sync_logs (Sync tracking)';
END $$;
