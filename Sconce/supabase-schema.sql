-- InsightsLM Database Schema for Sconce Integration
-- Run this in Supabase SQL Editor: http://localhost:3000/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notebooks table (weekly learning materials)
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Will be replaced with auth.users reference when auth is implemented
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  week_number INTEGER,
  generation_status TEXT DEFAULT 'pending',
  example_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notebooks' AND column_name='week_number') THEN
    ALTER TABLE notebooks ADD COLUMN week_number INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notebooks' AND column_name='generation_status') THEN
    ALTER TABLE notebooks ADD COLUMN generation_status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notebooks' AND column_name='example_questions') THEN
    ALTER TABLE notebooks ADD COLUMN example_questions JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notebooks' AND column_name='icon') THEN
    ALTER TABLE notebooks ADD COLUMN icon TEXT DEFAULT '📚';
  END IF;
END $$;

-- Add check constraint for generation_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notebooks_generation_status_check') THEN
    ALTER TABLE notebooks ADD CONSTRAINT notebooks_generation_status_check 
      CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed'));
  END IF;
END $$;

-- Sources table (uploaded resources)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'docx', 'txt', 'youtube', 'url', 'file')),
  file_path TEXT,
  title TEXT,
  summary TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (vector embeddings for RAG)
-- Note: You need pgvector extension for this
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(768), -- Adjust dimension based on your embedding model
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat histories table
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL, -- Maps to notebook_id
  message JSONB NOT NULL, -- {type: 'human'|'ai', content: '...'}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio overviews table (podcasts)
CREATE TABLE IF NOT EXISTS audio_overviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_week_number ON notebooks(week_number);
CREATE INDEX IF NOT EXISTS idx_sources_notebook_id ON sources(notebook_id);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_audio_overviews_notebook_id ON audio_overviews(notebook_id);

-- Create vector similarity search index (if using pgvector)
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security (RLS) - Basic setup
-- You should customize these based on your authentication strategy
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_overviews ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (DISABLE IN PRODUCTION!)
-- Replace these with proper policies once you implement authentication
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for notebooks" ON notebooks;
DROP POLICY IF EXISTS "Allow all for sources" ON sources;
DROP POLICY IF EXISTS "Allow all for documents" ON documents;
DROP POLICY IF EXISTS "Allow all for chat histories" ON n8n_chat_histories;
DROP POLICY IF EXISTS "Allow all for notes" ON notes;
DROP POLICY IF EXISTS "Allow all for audio overviews" ON audio_overviews;

-- Create policies
CREATE POLICY "Allow all for notebooks" ON notebooks FOR ALL USING (true);
CREATE POLICY "Allow all for sources" ON sources FOR ALL USING (true);
CREATE POLICY "Allow all for documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all for chat histories" ON n8n_chat_histories FOR ALL USING (true);
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all for audio overviews" ON audio_overviews FOR ALL USING (true);

-- Enable Realtime for chat (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'n8n_chat_histories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE n8n_chat_histories;
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (drop first if they exist)
DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
DROP TRIGGER IF EXISTS update_sources_updated_at ON sources;
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;

CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'InsightsLM database schema created successfully!';
  RAISE NOTICE 'Tables created: notebooks, sources, documents, n8n_chat_histories, notes, audio_overviews';
  RAISE NOTICE 'You can now use the Sconce AI Notebooks feature.';
END $$;
