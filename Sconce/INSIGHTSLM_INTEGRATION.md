# InsightsLM Integration Guide for Sconce

This guide explains how to integrate the InsightsLM AI-powered notebook system into your Sconce Arabic learning platform.

## 🎯 What's Been Created

### 1. Core Libraries

**`src/lib/supabase.js`**
- Supabase client configuration
- Authentication helpers (signIn, signUp, signOut)
- Database connection

**`src/lib/insightsLM.js`**
- Complete API for InsightsLM features:
  - Notebook management (create, list, get details)
  - Resource upload (PDF, DOCX, YouTube videos)
  - RAG Chat with citations
  - Podcast generation
  - Notes management
  - Quiz & Summary generation (TODO - needs n8n workflows)

### 2. UI Components

**For Instructors:**
- `src/components/instructor/Notebooks.jsx` - Full notebook manager
  - Create notebooks by week
  - Upload resources (PDF, DOCX, YouTube)
  - View uploaded sources
  - Access Chat, Podcast, Notes tabs
- `src/components/instructor/Chat.jsx` - AI chat interface with RAG

**For Students:**
- `src/components/StudentNotebooks.jsx` - Limited access interface
  - View learning materials by week
  - Ask AI questions
  - View summaries (TODO)
  - Take quizzes (TODO)

### 3. Integration Points

- Updated `InstructorDashboard.jsx` to include notebooks view
- Updated `StudentDashboard.jsx` with "View Learning Materials" button
- Added route: `#/dashboard/instructor` → `notebooks` view

## 📋 Setup Instructions

### Step 1: Install Dependencies

```bash
cd "d:\Graduation Project\Sconce"
npm install @supabase/supabase-js
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Get your Supabase credentials from docker-compose:
```bash
# From: d:\Graduation Project\local-ai-packaged\docker-compose.yml
# Look for the postgres service environment variables
```

3. Update `.env`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<from-docker-compose>
VITE_N8N_URL=http://localhost:5678/webhook
VITE_N8N_AUTH=<from-n8n-header-auth>
```

### Step 3: Add Navigation Menu Item

Update `src/components/InstructorLayout.jsx` to add "Notebooks" menu item:

```jsx
const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: FileText },
  { id: 'notebooks', label: 'AI Notebooks', icon: Brain }, // ADD THIS
  // ... rest of menu
];
```

### Step 4: Test the Integration

1. Start your Sconce dev server:
```bash
npm run dev
```

2. Navigate to instructor dashboard:
```
http://localhost:5173/#/dashboard/instructor
```

3. Click "AI Notebooks" in the sidebar

## 🔧 Configuration with Your n8n Workflows

### Current Workflows Available:
1. ✅ **Chat with RAG** - `InsightsLM___Chat.json`
   - Endpoint: `POST /webhook/2fabf43f-6e6e-424b-8e93-9150e9ce7d6c`
   - Body: `{session_id, message, user_id}`

2. ✅ **Generate Notebook Details** - `InsightsLM___Generate_Notebook_Details.json`
   - Auto-generates title, summary, icon for uploaded resources

3. ✅ **Podcast Generation** - `InsightsLM___Podcast_Generation.json`
   - Converts notebook sources to audio overview

4. ✅ **Upsert to Vector Store** - `InsightsLM___Upsert_to_Vector_Store.json`
   - Processes uploaded documents and creates embeddings

### Workflows You Need to Create:

#### 1. Quiz Generation Workflow
Create: `d:\Graduation Project\local-ai-packaged\insights-lm-local-package\n8n\InsightsLM___Generate_Quiz.json`

**Purpose:** Generate Arabic language quiz questions from notebook content

**Flow:**
```
Webhook → Fetch Notebook Sources → 
Generate Quiz Questions (Ollama) → 
Format as JSON → 
Save to Database → 
Respond
```

**Expected Input:**
```json
{
  "notebookId": "uuid",
  "questionCount": 10,
  "difficulty": "medium",
  "language": "arabic"
}
```

**Expected Output:**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "ما هو...؟",
      "options": ["أ", "ب", "ج", "د"],
      "correct_answer": "ب",
      "explanation": "..."
    }
  ]
}
```

#### 2. Summary Generation Workflow
Create: `d:\Graduation Project\local-ai-packaged\insights-lm-local-package\n8n\InsightsLM___Generate_Summary.json`

**Purpose:** Create concise Arabic summary of all notebook resources

**Flow:**
```
Webhook → Fetch Notebook Sources → 
Aggregate Content → 
Generate Summary (Ollama) → 
Save to Database → 
Respond
```

**Expected Input:**
```json
{
  "notebookId": "uuid",
  "language": "arabic"
}
```

**Expected Output:**
```json
{
  "summary": "ملخص المحتوى...",
  "key_points": ["نقطة 1", "نقطة 2"],
  "word_count": 150
}
```

## 🗄️ Database Tables (Supabase)

These tables should already exist from InsightsLM setup:

```sql
-- Notebooks (weekly learning materials)
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  description TEXT,
  icon TEXT DEFAULT '📚',
  week_number INTEGER,
  generation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sources (uploaded resources)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  source_type TEXT, -- 'pdf', 'docx', 'youtube', etc.
  file_path TEXT,
  title TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (vector embeddings)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,
  metadata JSONB, -- {notebook_id, source_id}
  embedding VECTOR(768) -- or 384 depending on your model
);

-- Chat histories
CREATE TABLE n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id UUID, -- maps to notebook_id
  message JSONB, -- {type: 'human'|'ai', content: '...'}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Audio overviews (podcasts)
CREATE TABLE audio_overviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Customization

### Week-Based Organization
The system is designed for your 52-week Arabic program:
- Each notebook = 1 week of learning
- Instructors create notebooks for each week
- Students access materials by week number

### Arabic Language Support
All text generation (summaries, quizzes) should specify `language: 'arabic'` in requests.

Update Ollama prompts to generate Arabic content:
```javascript
// In n8n workflows
const systemPrompt = `You are an Arabic language teaching assistant. 
Generate all content in Modern Standard Arabic (الفصحى).
Focus on educational clarity for young learners.`;
```

### Role-Based Access
Implement in Supabase Row Level Security (RLS):

```sql
-- Instructors can create/edit their notebooks
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY instructor_notebooks ON notebooks
  FOR ALL
  USING (user_id = auth.uid() AND auth.jwt() ->> 'role' = 'instructor');

-- Students can only read published notebooks
CREATE POLICY student_notebooks ON notebooks
  FOR SELECT
  USING (generation_status = 'completed');
```

## 🚀 Next Steps

1. **Test existing features:**
   - Create a notebook
   - Upload a PDF resource
   - Chat with the AI about the content

2. **Create missing workflows:**
   - Quiz generation
   - Summary generation

3. **Enhance UI:**
   - Add Podcast player component
   - Improve Notes editor (rich text)
   - Add quiz results tracking

4. **Authentication:**
   - Replace mock `userId` with real Supabase auth
   - Implement role-based access

5. **Production:**
   - Deploy Supabase to production
   - Use ngrok or public URL for n8n webhooks
   - Configure proper CORS

## 🐛 Troubleshooting

**"Failed to load notebooks"**
- Check Supabase connection in browser console
- Verify `.env` variables are loaded (restart dev server)
- Check Supabase is running: `http://localhost:54321`

**"Failed to send message"**
- Verify n8n is running: `http://localhost:5678`
- Check webhook URL matches your workflow
- Verify auth header is correct

**"Ollama not responding"**
- Check Ollama container: `docker ps | grep ollama`
- Verify models are downloaded: `docker exec ollama ollama list`

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [n8n Docs](https://docs.n8n.io)
- [Ollama Docs](https://ollama.ai/docs)
- [InsightsLM GitHub](https://github.com/theaiautomators/insights-lm-public)
