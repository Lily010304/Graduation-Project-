# 🎓 Sconce × InsightsLM Integration

## Overview

This integration brings **AI-powered learning notebooks** to your Sconce Arabic learning platform. InsightsLM provides instructors with tools to create weekly learning materials and gives students an AI assistant to help them study.

## ✨ Features

### For Instructors
- ✅ **Create Notebooks by Week** - Organize materials for your 52-week Arabic program
- ✅ **Upload Resources** - PDFs, DOCX files, YouTube videos
- ✅ **AI Chat with Citations** - Students can ask questions and get answers with source references
- ✅ **Podcast Generation** - Convert materials to audio overviews
- ✅ **Notes Management** - Keep teaching notes for each week
- ⏳ **Quiz Generation** - Auto-create quizzes from materials (coming soon)
- ⏳ **Summary Generation** - AI-generated summaries (coming soon)

### For Students  
- ✅ **View Learning Materials** - Access weekly resources
- ✅ **Ask AI Questions** - Chat with AI about the materials
- ⏳ **View Summaries** - Quick overview of weekly content
- ⏳ **Take Quizzes** - Test understanding with auto-generated quizzes

## 📁 What's Been Created

```
Sconce/
├── src/
│   ├── lib/
│   │   ├── supabase.js          ← Supabase client & auth
│   │   └── insightsLM.js        ← InsightsLM API functions
│   └── components/
│       ├── instructor/
│       │   ├── Notebooks.jsx    ← Full notebook manager
│       │   └── Chat.jsx         ← AI chat interface
│       ├── StudentNotebooks.jsx ← Student view
│       ├── InstructorDashboard.jsx (updated)
│       └── StudentDashboard.jsx    (updated)
├── .env.example                 ← Environment variables template
├── INSIGHTSLM_INTEGRATION.md    ← Full integration guide
└── package.json                 (updated with @supabase/supabase-js)
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd "d:\Graduation Project\Sconce"
npm install
```

This will install the new `@supabase/supabase-js` dependency.

### 2. Configure Environment

Create `.env` file from template:

```powershell
copy .env.example .env
```

Then update with your credentials:

```env
# Get from docker-compose.yml
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-key>

# n8n webhook configuration
VITE_N8N_URL=http://localhost:5678/webhook
VITE_N8N_AUTH=<your-auth-token>
```

### 3. Start Development Server

```powershell
npm run dev
```

Navigate to:
- Instructor: `http://localhost:5173/#/dashboard/instructor`
- Student: `http://localhost:5173/#/dashboard/student`

## 📖 Usage Examples

### Instructor: Create a Week's Materials

1. Go to Instructor Dashboard → Click "AI Notebooks" (you may need to add this to the menu)
2. Click "Create Notebook"
3. Enter week number (e.g., Week 1) and title
4. Upload resources: PDFs, DOCX files, or YouTube videos
5. Wait for processing (n8n extracts text and creates embeddings)
6. Students can now chat with the materials!

### Student: Study with AI

1. Go to Student Dashboard → Click "View Learning Materials"
2. Select a week's notebook
3. Click "Ask AI" to chat about the content
4. AI will answer with citations to specific sources

### Using the Chat Interface

```javascript
// Example: Student asks a question
Student: "What are the Arabic vowel marks?"

// AI responds with citations
AI: "Arabic uses three short vowel marks (harakat): 
- Fatha (ـَ) for 'a' sound [1]
- Kasra (ـِ) for 'i' sound [1]
- Damma (ـُ) for 'u' sound [2]

📚 Sources: [1] [2]"
```

## 🔌 Backend Requirements

Your InsightsLM backend must be running:

```powershell
cd "d:\Graduation Project\local-ai-packaged"

# Start all services
docker-compose up -d

# Check status
docker ps
```

Required containers:
- ✅ `postgres` - Supabase database
- ✅ `n8n` - Workflow automation (port 5678)
- ✅ `ollama` - LLM inference
- ✅ `coqui-tts` - Text-to-speech for podcasts

## 🎯 Next Steps

### Immediate (Ready to Use)
1. ✅ Test creating notebooks
2. ✅ Upload resources  
3. ✅ Chat with AI about materials

### Short Term (Need n8n Workflows)
1. Create Quiz Generation workflow
2. Create Summary Generation workflow
3. Add authentication (replace mock user IDs)

### Long Term (Enhancements)
1. Add podcast player UI
2. Rich text notes editor
3. Quiz results tracking
4. Student progress analytics

## 🏗️ Architecture

```
┌─────────────┐
│   Sconce    │  React Frontend
│  (Vite)     │  
└──────┬──────┘
       │ API calls
       ↓
┌──────────────┐
│   Supabase   │  Database + Auth + Storage
│  (Postgres)  │  
└──────┬───────┘
       │ Edge Functions
       ↓
┌──────────────┐
│     n8n      │  Workflow Automation
│ (Webhooks)   │  
└──────┬───────┘
       │ LLM calls
       ↓
┌──────────────┐
│   Ollama     │  Local LLM (qwen2.5)
│  (Docker)    │  + Embeddings (nomic)
└──────────────┘
```

## 🗄️ Database Schema

Key tables (in Supabase):

- `notebooks` - Weekly learning materials
- `sources` - Uploaded resources (PDFs, videos)
- `documents` - Vector embeddings for RAG
- `n8n_chat_histories` - Chat messages
- `notes` - Instructor notes
- `audio_overviews` - Generated podcasts

See `INSIGHTSLM_INTEGRATION.md` for full SQL schema.

## 🔐 Authentication

Currently using mock user IDs. To implement real auth:

```javascript
// src/lib/supabase.js provides:
import { getCurrentUser, signIn, signOut } from './lib/supabase';

// Use in components:
const user = await getCurrentUser();
const userId = user.id;
const userRole = user.user_metadata.role; // 'instructor' | 'student'
```

## 🐛 Troubleshooting

**Problem: "Failed to load notebooks"**
```powershell
# Check Supabase is running
curl http://localhost:54321

# Check environment variables
cat .env

# Restart dev server (to reload .env)
npm run dev
```

**Problem: "Chat not working"**
```powershell
# Check n8n is running
curl http://localhost:5678

# Check Ollama has models
docker exec ollama ollama list

# Should show:
# - qwen2.5:3b-instruct-q4_K_M
# - nomic-embed-text
```

**Problem: "No upload working"**
```powershell
# Check Supabase Storage bucket exists
# Go to: http://localhost:54321/project/default/storage/buckets

# Create 'sources' bucket if missing
```

## 📚 Documentation

- **Full Integration Guide**: `INSIGHTSLM_INTEGRATION.md`
- **API Reference**: See `src/lib/insightsLM.js` JSDoc comments
- **Component Props**: See individual component files

## 🤝 Contributing

To add new features:

1. **API Function**: Add to `src/lib/insightsLM.js`
2. **UI Component**: Create in `src/components/`
3. **n8n Workflow**: Add to `d:\Graduation Project\local-ai-packaged\insights-lm-local-package\n8n\`
4. **Database**: Update Supabase schema if needed

## 📝 TODO

- [ ] Create Quiz Generation n8n workflow
- [ ] Create Summary Generation n8n workflow
- [ ] Add real authentication
- [ ] Add podcast player component
- [ ] Implement notes rich text editor
- [ ] Add quiz results tracking
- [ ] Add student progress dashboard
- [ ] Add Arabic RTL support
- [ ] Add dark mode

## 📄 License

Same as Sconce project.

---

**Need Help?** See `INSIGHTSLM_INTEGRATION.md` for detailed documentation.
