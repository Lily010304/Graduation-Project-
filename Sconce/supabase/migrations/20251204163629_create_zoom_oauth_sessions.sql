-- Create zoom_oauth_sessions table for temporary OAuth state storage
CREATE TABLE IF NOT EXISTS zoom_oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL UNIQUE,
  instructor_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on state for quick lookups
CREATE INDEX idx_zoom_oauth_sessions_state ON zoom_oauth_sessions(state);

-- Create index on expires_at for cleanup
CREATE INDEX idx_zoom_oauth_sessions_expires_at ON zoom_oauth_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE zoom_oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (OAuth initiation)
CREATE POLICY "Allow insert for OAuth initiation" ON zoom_oauth_sessions
  FOR INSERT WITH CHECK (true);

-- Allow selecting only valid sessions
CREATE POLICY "Allow select valid sessions" ON zoom_oauth_sessions
  FOR SELECT USING (expires_at > NOW());

-- Allow delete for cleanup
CREATE POLICY "Allow delete expired sessions" ON zoom_oauth_sessions
  FOR DELETE USING (true);
