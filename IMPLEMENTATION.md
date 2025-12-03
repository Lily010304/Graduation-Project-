# IMPLEMENTATION DOCUMENTATION

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Services](#backend-services)
5. [InsightsLM AI Engine](#insightslm-ai-engine)
6. [Database Architecture](#database-architecture)
7. [System Connections](#system-connections)
8. [Core Workflows](#core-workflows)
9. [Authentication & Security](#authentication--security)

---

## 1. System Architecture Overview

SconceLMS is a full-stack AI-powered Learning Management System that integrates multiple technologies across frontend, backend, and AI processing layers.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React 19.1.1 + Vite 7.1.7 + Tailwind CSS + React Query       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ├─────────────────┬─────────────────┬──────────────
                 │                 │                 │
        ┌────────▼────────┐ ┌─────▼──────┐  ┌──────▼───────┐
        │  ASP.NET Core   │ │  Supabase  │  │ InsightsLM   │
        │   Backend API   │ │ PostgreSQL │  │  (n8n + AI)  │
        └─────────────────┘ └─────┬──────┘  └──────┬───────┘
                                  │                 │
                            ┌─────▼─────────────────▼────┐
                            │   Ollama (Local LLM)       │
                            │  - qwen2.5:3b-instruct     │
                            │  - nomic-embed-text        │
                            └────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19.1.1, Vite 7.1.7, Tailwind CSS 3.4.14, React Query 5.90.10 |
| **UI Components** | Radix UI, Lucide React, Framer Motion, GSAP |
| **Backend API** | ASP.NET Core (https://sconce.runasp.net) |
| **Database** | Supabase PostgreSQL with pgvector extension |
| **Real-time** | Supabase Real-time subscriptions |
| **AI Engine** | n8n workflows + Ollama local LLMs |
| **LLM Models** | qwen2.5:3b-instruct-q4_K_M, qwen3:8b-q4_K_M |
| **Embeddings** | nomic-embed-text (274 MB) |
| **Serverless** | Supabase Edge Functions (Deno/TypeScript) |
| **Storage** | Supabase Storage buckets |

---

## 2. Frontend Technologies

### 2.1 Core Framework & Build Tools

#### React 19.1.1
- **Purpose**: UI framework with concurrent features
- **Key Features Used**:
  - Function components with hooks
  - Concurrent rendering for smooth UI
  - Suspense for data fetching
  - Error boundaries for fault isolation

#### Vite 7.1.7
- **Purpose**: Fast build tool and development server
- **Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Import alias
    },
  },
})
```
- **Features**:
  - Hot Module Replacement (HMR) for instant updates
  - Optimized production builds
  - ES modules for faster loading

### 2.2 State Management

#### React Query (@tanstack/react-query) 5.90.10
- **Purpose**: Server state management, caching, and synchronization
- **Implementation**:
```javascript
// App.jsx - Global setup
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>
  <AppContent />
</QueryClientProvider>
```
- **Features Used**:
  - Automatic caching and refetching
  - Real-time data synchronization
  - Optimistic updates
  - Mutation handling
  - Query invalidation

### 2.3 Styling & UI

#### Tailwind CSS 3.4.14
- **Purpose**: Utility-first CSS framework
- **Plugins**:
  - `tailwindcss-animate 1.0.7` - Animation utilities
  - `autoprefixer 10.4.21` - Vendor prefix automation

#### Radix UI Components
- **Purpose**: Unstyled, accessible component primitives
- **Components Used**:
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-tabs` - Tab navigation
  - `@radix-ui/react-toast` - Notifications
  - `@radix-ui/react-scroll-area` - Custom scrollbars
  - `@radix-ui/react-slot` - Component composition

#### UI Utilities
- **lucide-react 0.546.0**: 1000+ SVG icons
- **class-variance-authority 0.7.1**: Variant-based component styling
- **clsx 2.1.1**: Conditional class names
- **tailwind-merge 3.4.0**: Smart class merging

### 2.4 Animation Libraries

#### Framer Motion 12.23.24
- **Purpose**: Declarative animations for React
- **Use Cases**:
  - Page transitions
  - Component entrance/exit animations
  - Gesture-based interactions

#### GSAP 3.13.0
- **Purpose**: Timeline-based animations
- **Use Cases**:
  - Complex animation sequences
  - SVG animations
  - Scroll-triggered effects

#### Additional Animation Tools
- **Lenis 1.3.11**: Smooth scrolling library
- **Embla Carousel 8.6.0**: Touch-friendly carousels
  - `embla-carousel-autoplay 8.6.0` plugin

### 2.5 Backend Integration

#### Supabase Client (@supabase/supabase-js) 2.39.0
- **Purpose**: All-in-one backend SDK
- **Configuration** (`src/lib/supabase.js`):
```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});
```
- **Features Used**:
  - PostgreSQL database access
  - Real-time subscriptions
  - File storage
  - Edge Functions (serverless)
  - Vector database queries
  - Third-party API integrations (Zoom)

---

## 3. Frontend Implementation

### 3.1 Application Structure

```
Sconce/src/
├── components/
│   ├── notebook/           # Notebook workspace components
│   │   ├── AddSourcesDialog.jsx
│   │   ├── ChatArea.jsx
│   │   ├── MessageRenderer.jsx
│   │   ├── NotebookPage.jsx
│   │   ├── SourcesSidebar.jsx
│   │   ├── StudioSidebar.jsx
│   │   └── SourceContentViewer.jsx
│   ├── instructor/         # Instructor-specific components
│   │   ├── AddContentDialog.jsx
│   │   ├── ZoomMeetingDialog.jsx
│   │   └── ExamsBuilder.jsx
│   ├── EmailConfirmation.jsx
│   ├── Login.jsx
│   ├── StudentRegister.jsx
│   ├── InstructorDashboard.jsx
│   └── InstructorCourseEditor.jsx
├── hooks/                  # Custom React hooks
│   ├── useChatMessages.js
│   ├── useNotebooks.js
│   ├── useNotes.js
│   ├── useSources.js
│   ├── useFileUpload.js
│   └── useDocumentProcessing.js
├── lib/
│   ├── supabase.js        # Supabase client configuration
│   ├── api.js             # Backend API client (ASP.NET Core)
│   └── instructorStore.js # Course management state
├── App.jsx                # Main app with routing
└── main.jsx               # Entry point
```

### 3.2 Routing System

**Implementation**: Hash-based routing (no server-side configuration needed)

**File**: `src/App.jsx`
```javascript
function AppContent() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  
  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route matching
  if (currentRoute === '#/login') return <Login />;
  if (currentRoute === '#/register') return <RegisterChooser />;
  if (currentRoute === '#/dashboard/student') return <StudentDashboard />;
  // ... more routes
}
```

**Routes**:
- `#/` → Landing page (FullPageSlider)
- `#/login` → Login page
- `#/register` → Registration chooser
- `#/register/student` → Student registration
- `#/register/instructor` → Instructor registration
- `#/confirm-email` → Email confirmation
- `#/dashboard/student` → Student dashboard
- `#/dashboard/instructor` → Instructor dashboard
- `#/dashboard/instructor/courses` → Course list
- `#/dashboard/instructor/course/:id` → Course editor
- `#/dashboard/instructor/quiz/:id` → Quiz builder
- `#/notebook/:id` → Notebook workspace

### 3.3 Custom Hooks

#### useNotebooks.js
**Purpose**: Manage notebooks (create, fetch, real-time updates)

**Key Features**:
- Fetches notebooks with source counts
- Real-time subscription for updates
- Notebook creation mutation

**Implementation**:
```javascript
export const useNotebooks = (userId) => {
  const queryClient = useQueryClient();

  // Query for fetching notebooks
  const { data: notebooks, isLoading } = useQuery({
    queryKey: ['notebooks', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      // Fetch source counts
      const notebooksWithCounts = await Promise.all(
        data.map(async (notebook) => {
          const { count } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .eq('notebook_id', notebook.id);
          return { ...notebook, sourceCount: count || 0 };
        })
      );
      
      return notebooksWithCounts;
    },
    enabled: !!userId,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notebooks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notebooks',
        filter: `user_id=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries(['notebooks', userId]);
      })
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [userId]);

  // Create notebook mutation
  const createNotebook = useMutation({
    mutationFn: async (data) => {
      const { data: notebook } = await supabase
        .from('notebooks')
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      return notebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notebooks', userId]);
    },
  });

  return { notebooks, isLoading, createNotebook };
};
```

#### useChatMessages.js
**Purpose**: Handle chat messaging with AI

**Key Features**:
- Fetch and transform chat messages
- Real-time message subscription
- Send messages to AI via Edge Function
- Message format transformation (supports citations)

**Message Transformation**:
```javascript
const transformMessage = (rawMessage, sourceMap) => {
  const msg = rawMessage.message;
  
  if (msg.type === 'human') {
    return {
      id: rawMessage.id,
      type: 'user',
      content: msg.content,
    };
  }
  
  if (msg.type === 'ai') {
    const parsed = JSON.parse(msg.content);
    return {
      id: rawMessage.id,
      type: 'ai',
      content: parsed.output.map(segment => ({
        text: segment.text,
        citations: segment.citations.map(c => ({
          chunkIndex: c.chunk_index,
          sourceId: sourceMap.get(c.chunk_index)?.id,
          title: sourceMap.get(c.chunk_index)?.title,
        }))
      }))
    };
  }
};
```

**Send Message Implementation**:
```javascript
const sendMessage = useMutation({
  mutationFn: async ({ notebookId, content }) => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-chat-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          session_id: notebookId,
          message: content
        })
      }
    );
    return await response.json();
  },
});
```

#### useSources.js
**Purpose**: Manage document sources

**Key Features**:
- Fetch sources for a notebook
- Real-time source updates
- Add/update/delete sources
- Optimistic UI updates

**Real-time Implementation**:
```javascript
useEffect(() => {
  const channel = supabase
    .channel('sources-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sources',
      filter: `notebook_id=eq.${notebookId}`
    }, (payload) => {
      queryClient.setQueryData(['sources', notebookId], (old = []) => {
        switch (payload.eventType) {
          case 'INSERT':
            return [payload.new, ...old];
          case 'UPDATE':
            return old.map(s => s.id === payload.new.id ? payload.new : s);
          case 'DELETE':
            return old.filter(s => s.id !== payload.old.id);
          default:
            return old;
        }
      });
    })
    .subscribe();
  
  return () => supabase.removeChannel(channel);
}, [notebookId]);
```

#### useFileUpload.js
**Purpose**: Handle file uploads to Supabase Storage

**Implementation**:
```javascript
export const useFileUpload = () => {
  const uploadFile = async (file, notebookId, sourceId) => {
    const fileExtension = file.name.split('.').pop();
    const filePath = `${notebookId}/${sourceId}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
      .from('sources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    return filePath;
  };

  return { uploadFile };
};
```

### 3.4 Key Components

#### Login.jsx
**Purpose**: User authentication interface

**Features**:
- Role-based login (Student, Instructor, Parent, Manager)
- Integration with backend API via `src/lib/api.js`
- JWT token management (automatic storage)
- Loading states during authentication
- Error message display for failed attempts
- Role-specific redirects after successful login

**Authentication Flow**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // Call backend API
    const response = await login(email, password);
    
    // Token automatically stored by api.js
    localStorage.setItem('userRole', role);
    
    // Redirect based on role
    if (role === 'student') window.location.hash = '#/dashboard/student';
    else if (role === 'instructor') window.location.hash = '#/dashboard/instructor';
    // etc.
  } catch (err) {
    setError(err.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

**State Management**:
- `email`, `password` - Form inputs
- `role` - Selected user role (student/instructor/parent/manager)
- `isLoading` - Button disabled during API call
- `error` - Error message display
- `showPwd` - Password visibility toggle

**Error Handling**:
- Network errors caught and displayed
- Invalid credentials show user-friendly message
- Form inputs disabled during submission
- Red alert box for error display

#### NotebookPage.jsx
**Purpose**: Main three-column notebook workspace

**Layout**:
```
┌────────────────┬─────────────────┬────────────────┐
│ SourcesSidebar │   ChatArea      │ StudioSidebar  │
│   (25-35%)     │   (35-70%)      │    (30%)       │
│                │                 │                │
│ • Source list  │ • Chat messages │ • Summarizer   │
│ • Add sources  │ • Input field   │ • Notes        │
│ • File viewer  │ • Citations     │                │
└────────────────┴─────────────────┴────────────────┘
```

**Dynamic Width Calculation**:
```javascript
const sourcesWidth = isSourceDocumentOpen 
  ? (isStudioVisible ? 'w-[35%]' : 'w-[30%]') 
  : (isStudioVisible ? 'w-[25%]' : 'w-[30%]');

const chatWidth = isSourceDocumentOpen
  ? (isStudioVisible ? 'w-[35%]' : 'w-[70%]')
  : (isStudioVisible ? 'w-[45%]' : 'w-[70%]');
```

#### ChatArea.jsx
**Purpose**: Chat interface with AI

**Features**:
- Message display with citations
- User input field
- Example questions
- Clear chat functionality
- Typing indicators
- Pending message handling

**Send Handler**:
```javascript
const handleSendMessage = async (content) => {
  if (!content.trim() || isSending) return;
  
  // Add pending message for optimistic UI
  setPendingMessage({
    type: 'user',
    content: content.trim()
  });
  
  // Send to AI
  await sendMessageAsync({
    notebookId,
    content: content.trim()
  });
  
  // Clear pending
  setPendingMessage(null);
};
```

#### MessageRenderer.jsx
**Purpose**: Render chat messages with citation support

**Implementation**:
```javascript
export default function MessageRenderer({ message, onCitationClick }) {
  if (message.type === 'user') {
    return <div className="text-gray-900">{message.content}</div>;
  }
  
  if (message.type === 'ai') {
    return message.content.map((segment, idx) => (
      <div key={idx}>
        <span>{segment.text}</span>
        {segment.citations.map((citation, cIdx) => (
          <button
            key={cIdx}
            onClick={() => onCitationClick(citation.sourceId)}
            className="citation-button"
          >
            [{citation.chunkIndex}]
          </button>
        ))}
      </div>
    ));
  }
}
```

#### StudioSidebar.jsx
**Purpose**: AI-powered tools (Summarizer, Notes)

**Features**:
- Generate Summary button
- Notes display
- Notes CRUD operations

**Summarizer Implementation**:
```javascript
const handleGenerateSummary = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-summary`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ notebook_id: notebookId })
      }
    );
    
    if (response.ok) {
      // Refetch notes to show new summary
      refetchNotes();
    }
  } finally {
    setIsGenerating(false);
  }
};
```

#### AddSourcesDialog.jsx
**Purpose**: Multi-source upload interface

**Supported Source Types**:
1. **File Upload**: PDF, TXT, Markdown, Audio
2. **Website Links**: Multiple URLs at once
3. **Copied Text**: Paste text content

**File Upload Flow**:
```javascript
const handleFileUpload = async (files) => {
  // 1. Create source entries (status: pending)
  const created = await Promise.all(
    files.map(file => addSourceAsync({
      notebookId,
      title: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'text',
      processing_status: 'pending'
    }))
  );
  
  // 2. Process each file sequentially
  for (let i = 0; i < created.length; i++) {
    // Upload to storage
    const filePath = await uploadFile(files[i], notebookId, created[i].id);
    
    // Update status to processing
    await updateSource({
      sourceId: created[i].id,
      updates: { file_path: filePath, processing_status: 'processing' }
    });
    
    // Trigger document processing (extraction + embeddings)
    await processDocumentAsync({
      sourceId: created[i].id,
      filePath,
      sourceType: file.type.includes('pdf') ? 'pdf' : 'text'
    });
    
    // Mark as completed
    await updateSource({
      sourceId: created[i].id,
      updates: { processing_status: 'completed' }
    });
  }
};
```

---

## 4. Backend Services

### 4.1 ASP.NET Core API

**URL**: `https://sconce.runasp.net`

**Purpose**: Authentication, user management, and LMS core functionality

#### API Client (`src/lib/api.js`)

**Purpose**: Centralized service for all backend API calls

**Key Features**:
- **Automatic Authentication**: Includes JWT token in all requests
- **Token Management**: Stores and retrieves auth token from localStorage
- **Error Handling**: Unified error catching with detailed logging
- **Type Safety**: JSDoc comments for all functions
- **Response Parsing**: Handles both JSON and text responses

**Configuration**:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sconce.runasp.net';
```

**Generic Request Handler**:
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/plain',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  // Handle errors and parse response
};
```

**Authentication Endpoints**:
- `POST /api/Identity/Account/Login` - User login with credentials
- `GET /api/Identity/Account/ConfirmEmail` - Email verification
- `POST /api/Identity/Account/ForgotPassword` - Password reset request
- `PATCH /api/Identity/Account/ResetPassword` - Reset password with code

**Student Endpoints**:
- `POST /api/Student/Account/RegisterStudent` - Student registration
- `GET /api/Student/Account/ApproveParentLink` - Approve parent-student link
- `POST /api/Student/Application/Apply` - Submit application (multipart/form-data)
- `GET /api/Student/Application/Status` - Check application status

**Parent Endpoints**:
- `POST /api/Parent/Account/RegisterParent` - Register parent (send invite)
- `POST /api/Parent/Account/RegisterParentWithInvite` - Register with token

**Instructor Endpoints**:
- `POST /api/Instructor/Application/Apply` - Submit application with CV
- `GET /api/Instructor/Application/Status` - Check application status

**Admin Endpoints**:
- `GET /api/Admin/Course` - List courses
- `POST /api/Admin/Course` - Create course
- `GET /api/Admin/Program` - List programs
- `POST /api/Admin/Program` - Create program
- `GET /api/Admin/Section` - List sections
- `POST /api/Admin/Section` - Create section
- `GET /api/Admin/Instructor/Applications` - List instructor applications
- `GET /api/Admin/Instructor/Applications/:id` - Get application details
- `GET /api/Admin/Student/Applications` - List student applications
- `GET /api/Admin/Student/Applications/:id` - Get application details

**Utility Functions**:
```javascript
// Login and store token
export const login = async (email, password) => {
  const response = await apiRequest('/api/Identity/Account/Login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.token) localStorage.setItem('authToken', response.token);
  if (response.user) localStorage.setItem('userData', JSON.stringify(response.user));
  
  return response;
};

// Logout and clear session
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.hash = '#/login';
};

// Get current user
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Check authentication status
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
```

**CORS Configuration**: Allows `http://localhost:5173` (development)

### 4.2 Supabase Backend

**URL**: `https://yuopifjsxagpqcywgddi.supabase.co`

**Services Used**:

#### PostgreSQL Database
- **Purpose**: Primary data storage
- **Extensions**:
  - `pgvector` - Vector embeddings for semantic search
  - `uuid-ossp` - UUID generation

#### Real-time Subscriptions
- **Purpose**: Live data synchronization
- **Configuration**: 10 events per second limit
- **Tables with Real-time**:
  - `notebooks` - Notebook updates
  - `sources` - Source changes
  - `n8n_chat_histories` - New chat messages

#### Storage
- **Bucket**: `sources`
- **Purpose**: Store uploaded files (PDF, audio, text)
- **Path Structure**: `{notebookId}/{sourceId}.{extension}`
- **Access**: Public URLs with signed temporary access

#### Edge Functions (Serverless)
- **Runtime**: Deno/TypeScript
- **Purpose**: Bridge frontend to n8n workflows

**Functions**:

1. **send-chat-message**
   - **Path**: `/functions/v1/send-chat-message`
   - **Purpose**: Proxy chat messages to n8n workflow
   - **Implementation**:
   ```typescript
   const { session_id, message } = await req.json();
   
   // Call n8n webhook
   const response = await fetch(webhookUrl, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': authHeader,
     },
     body: JSON.stringify({ session_id, message })
   });
   
   return new Response(JSON.stringify(await response.json()));
   ```

2. **generate-summary**
   - **Path**: `/functions/v1/generate-summary`
   - **Purpose**: Trigger summary generation workflow
   - **Implementation**:
   ```typescript
   const { notebook_id } = await req.json();
   
   const response = await fetch(N8N_SUMMARY_WEBHOOK_URL, {
     method: 'POST',
     body: JSON.stringify({ notebook_id })
   });
   
   return new Response(JSON.stringify(await response.json()));
   ```

3. **process-document**
   - **Path**: `/functions/v1/process-document`
   - **Purpose**: Initiate document text extraction and embedding
   - **Flow**:
     1. Receive sourceId, filePath, sourceType
     2. Generate public file URL
     3. Call n8n extraction workflow
     4. Update source status in database

4. **create-zoom-meeting**
   - **Path**: `/functions/v1/create-zoom-meeting`
   - **Purpose**: Create Zoom meetings via Zoom API for live class sessions
   - **Authentication**: Server-to-Server OAuth
   - **Flow**:
     1. Receive meeting details (topic, startTime, duration, settings)
     2. Retrieve Zoom credentials from Edge Function secrets
     3. Obtain OAuth access token from Zoom API
     4. Create scheduled meeting via Zoom API
     5. Return meeting details (joinUrl, meetingId, password)
   - **Integration**: Meeting data saved as course content items
   - **Security**: API credentials stored in Supabase secrets (never exposed to frontend)

---

## 5. InsightsLM AI Engine

### 5.1 Architecture

InsightsLM is a local AI processing engine built with **n8n** workflow automation and **Ollama** for LLM inference.

```
┌─────────────────────────────────────────────────────────┐
│                      n8n Workflows                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Extract Text │  │  Upsert to   │  │     Chat     │ │
│  │   Workflow   │→ │Vector Store  │← │   Workflow   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Summary    │  │   Notebook   │  │   Process    │ │
│  │  Generation  │  │  Generation  │  │  Additional  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Ollama LLM Server    │
            │   (localhost:11434)    │
            ├────────────────────────┤
            │ qwen2.5:3b-instruct    │
            │ qwen3:8b-q4_K_M        │
            │ nomic-embed-text       │
            └────────────────────────┘
```

### 5.2 Ollama Models

**Installation**: Local LLM inference server

**Models Used**:

1. **qwen2.5:3b-instruct-q4_K_M**
   - **Size**: 1.9 GB
   - **Purpose**: Chat responses, query generation
   - **Quantization**: 4-bit for faster inference
   - **Context**: 32K tokens

2. **qwen3:8b-q4_K_M**
   - **Size**: ~5 GB
   - **Purpose**: Higher quality text generation
   - **Use Cases**: Summaries, notebook descriptions

3. **nomic-embed-text**
   - **Size**: 274 MB
   - **Purpose**: Text embeddings for vector search
   - **Dimensions**: 768
   - **Use Case**: Convert text chunks to vectors for semantic search

**API Endpoint**: `http://localhost:11434`

### 5.3 n8n Workflows

**Location**: `d:\Graduation Project\local-ai-packaged(changed)\insights-lm-local-package\n8n\`

#### Workflow 1: Extract Text
**File**: `InsightsLM___Extract_Text.json`

**Purpose**: Extract text from uploaded documents

**Flow**:
```
1. Receive filePath from Edge Function
2. Generate signed URL for file access
3. Download file from Supabase Storage
4. Extract text based on file type:
   - PDF: Use PDF parser
   - Audio: Use speech-to-text
   - Text: Direct read
5. Return extracted text
```

**Key Nodes**:
- `Generate Signed URL` - Create temporary access URL
- `Download File` - Fetch file content
- `Extract Text` - Type-specific extraction
- `Return Result` - Send text back

#### Workflow 2: Upsert to Vector Store
**File**: `InsightsLM___Upsert_to_Vector_Store.json`

**Purpose**: Create embeddings and store in Supabase

**Flow**:
```
1. Receive extracted text
2. Split text into chunks (overlap for context)
3. Generate embeddings using nomic-embed-text
4. Store in Supabase 'documents' table with metadata
5. Associate with notebook_id for filtering
```

**Chunking Strategy**:
- Chunk size: 500-1000 characters
- Overlap: 100 characters
- Preserve sentence boundaries

**Metadata Stored**:
```json
{
  "notebook_id": "uuid",
  "source_id": "uuid",
  "chunk_index": 1,
  "title": "Document title"
}
```

#### Workflow 3: Chat
**File**: `InsightsLM___Chat.json`

**Purpose**: RAG-based chat with citations

**Flow**:
```
1. Receive user message + session_id (notebook_id)
2. Fetch chat history from n8n_chat_histories table
3. Generate search query using LLM
   - Input: User query + conversation context
   - Output: Optimized vector search query
4. Retrieve relevant chunks from vector store
   - Primary retrieval: Top 10 chunks
   - Multi-query retrieval: Top 6 chunks (expanded query)
5. Merge and deduplicate chunks
6. Heuristic re-ranking (score × length)
7. Generate AI response using top chunks
   - Prompt: Answer using ONLY context, cite with [number]
   - Output: JSON with citations
8. Normalize LLM output
9. Create structured response with citations
10. Save human message to database
11. Save AI response to database
12. Return response to frontend
```

**Key Nodes**:
- `Generate Search Query` - Convert query to vector search
- `Supabase Vector Store` - Retrieve similar chunks
- `Merge & Dedup Chunks` - Combine results
- `Heuristic Rerank` - Score by relevance
- `Generate Response` - LLM chat completion
- `Normalize LLM Output` - Parse JSON/text response
- `Create Output Structure with Citations` - Format for frontend

**Citation Format**:
```json
{
  "output": [
    {
      "text": "The answer is X based on the source [1].",
      "citations": [
        { "chunk_index": 1 }
      ]
    }
  ]
}
```

#### Workflow 4: Generate Summary
**File**: `InsightsLM___Generate_Summary.json`

**Purpose**: Create comprehensive notebook summary

**Flow**:
```
1. Receive notebook_id
2. Fetch all sources for notebook
3. Retrieve document chunks from vector store
4. Generate summary using LLM
   - Prompt: Summarize with markdown formatting
   - Requirements: Preserve equations, maintain structure
5. Save summary as note in database
6. Return success
```

**Summary Prompt**:
```
Create a comprehensive summary of the following content.
Requirements:
- Use markdown formatting
- Preserve mathematical equations
- Include main titles and key points
- Structure: Introduction → Main Points → Conclusion
```

#### Workflow 5: Generate Notebook Details
**File**: `InsightsLM___Generate_Notebook_Details.json`

**Purpose**: Auto-generate notebook title and description

**Flow**:
```
1. Receive first source content
2. Analyze content with LLM
3. Generate:
   - Title (5-10 words)
   - Description (1-2 sentences)
   - Icon suggestion
4. Update notebook in database
```

#### Workflow 6: Process Additional Sources
**File**: `InsightsLM___Process_Additional_Sources.json`

**Purpose**: Handle multiple source uploads

**Flow**:
```
1. Receive array of source IDs
2. For each source:
   - Extract text
   - Generate embeddings
   - Upsert to vector store
3. Update processing status
```

#### Workflow 7: Podcast Generation (Legacy)
**File**: `InsightsLM___Podcast_Generation.json`

**Purpose**: Generate audio overview (replaced by summarizer)

**Note**: No longer actively used; replaced with text summarizer.

### 5.4 n8n Configuration

**Webhook Authentication**: Header-based auth token

**Environment Variables**:
- `SUPABASE_URL` - Database URL
- `SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access
- `NOTEBOOK_GENERATION_AUTH` - Webhook auth token
- `NOTEBOOK_CHAT_URL` - Chat webhook URL
- `N8N_SUMMARY_WEBHOOK_URL` - Summary webhook URL
- `DOCUMENT_PROCESSING_WEBHOOK_URL` - Doc processing URL

**Ollama Connection**:
- Host: `http://localhost:11434`
- Models loaded on demand
- Timeout: 120 seconds for generation

---

## 6. Database Architecture

### 6.1 Database Schema

**Platform**: Supabase PostgreSQL

**Tables**:

#### notebooks
```sql
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  week_number INTEGER,
  generation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store notebook metadata

**Fields**:
- `user_id` - Owner reference (ASP.NET user ID)
- `title` - Notebook name
- `description` - Auto-generated or manual
- `icon` - Emoji icon
- `generation_status` - `pending`, `processing`, `completed`, `failed`

#### sources
```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'pdf', 'text', 'audio', 'website'
  file_path TEXT,
  file_size BIGINT,
  url TEXT,
  content TEXT,
  processing_status TEXT DEFAULT 'pending',
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Track uploaded sources

**Processing Status Flow**:
```
pending → processing → completed
                    ↘ failed
```

#### documents (Vector Store)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(768), -- pgvector extension
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

**Purpose**: Store text chunks with embeddings

**Metadata Example**:
```json
{
  "notebook_id": "abc-123",
  "source_id": "def-456",
  "chunk_index": 1,
  "title": "Introduction to AI",
  "source_type": "pdf"
}
```

**Vector Search**:
```sql
SELECT id, content, metadata, 1 - (embedding <=> $1) AS similarity
FROM documents
WHERE metadata->>'notebook_id' = $2
ORDER BY embedding <=> $1
LIMIT 10;
```

#### n8n_chat_histories
```sql
CREATE TABLE n8n_chat_histories (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL, -- notebook_id
  message JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON n8n_chat_histories(session_id);
```

**Purpose**: Store chat conversation history

**Message Format**:
```json
// Human message
{
  "type": "human",
  "content": "What is machine learning?"
}

// AI message
{
  "type": "ai",
  "content": "{\"output\":[{\"text\":\"ML is... [1]\",\"citations\":[{\"chunk_index\":1}]}]}"
}
```

#### notes
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store user notes and AI-generated summaries

### 6.2 Row-Level Security (RLS)

**Enabled on**: `notebooks`, `sources`, `notes`

**Policy Example** (notebooks):
```sql
-- Users can only see their own notebooks
CREATE POLICY "Users can view own notebooks"
ON notebooks FOR SELECT
USING (auth.uid() = user_id);

-- Users can only create notebooks for themselves
CREATE POLICY "Users can create own notebooks"
ON notebooks FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 7. System Connections

### 7.1 Frontend ↔ Supabase

**Connection Type**: Direct via Supabase client

**Data Flow**:
```
React Component
    ↓ (React Query hook)
Custom Hook (useNotebooks, useSources, etc.)
    ↓ (Supabase client)
Supabase PostgreSQL Database
    ↓ (Real-time subscription)
React Component (auto-update)
```

**Example Flow** (Fetching Notebooks):
```javascript
// 1. Component calls hook
const { notebooks } = useNotebooks(userId);

// 2. Hook queries Supabase
const { data } = await supabase
  .from('notebooks')
  .select('*')
  .eq('user_id', userId);

// 3. Real-time updates
supabase
  .channel('notebooks-changes')
  .on('postgres_changes', { table: 'notebooks' }, (payload) => {
    // Auto-refetch data
  })
  .subscribe();
```

**Authentication**:
- Anonymous key for read operations
- Row-level security enforces access control

### 7.2 Frontend ↔ ASP.NET Core

**Connection Type**: REST API

**Authentication Flow**:
```
1. User submits login form
2. Frontend sends POST to https://sconce.runasp.net/api/auth/login
3. Backend validates credentials
4. Returns JWT token + user data
5. Frontend stores token in localStorage
6. Subsequent requests include: Authorization: Bearer {token}
```

**Registration Flow**:
```
1. User fills registration form
2. POST to /api/auth/register
3. Backend creates user in SQL Server
4. Sends verification email
5. User clicks email link → /api/auth/verify-email
6. Account activated
```

### 7.3 Frontend ↔ InsightsLM

**Connection Type**: Indirect via Supabase Edge Functions

**Chat Flow**:
```
Frontend (ChatArea.jsx)
    ↓ sendMessageAsync()
Custom Hook (useChatMessages.js)
    ↓ fetch('/functions/v1/send-chat-message')
Supabase Edge Function
    ↓ fetch(N8N_WEBHOOK_URL)
n8n Chat Workflow
    ↓ Vector search + LLM generation
Ollama (localhost:11434)
    ↓ AI response
n8n saves to database
    ↓ Real-time subscription
Frontend updates UI
```

**Summary Generation Flow**:
```
Frontend (StudioSidebar.jsx)
    ↓ handleGenerateSummary()
    ↓ fetch('/functions/v1/generate-summary')
Supabase Edge Function
    ↓ fetch(N8N_SUMMARY_WEBHOOK_URL)
n8n Summary Workflow
    ↓ Retrieve chunks, generate summary
Ollama (qwen3:8b)
    ↓ Summary text
n8n saves to notes table
    ↓ refetchNotes()
Frontend displays new note
```

### 7.4 Supabase ↔ n8n

**Connection Type**: Webhooks (HTTP POST)

**Document Processing Flow**:
```
Frontend uploads file
    ↓ useFileUpload hook
Supabase Storage (file saved)
    ↓ processDocumentAsync()
Edge Function: process-document
    ↓ POST to n8n webhook
n8n Extract Text Workflow
    ↓ Download from Supabase Storage
    ↓ Extract text (PDF/audio/text)
n8n Upsert Vector Store Workflow
    ↓ Generate embeddings via Ollama
    ↓ INSERT into documents table
Supabase Database (embeddings stored)
    ↓ Update source status
Frontend (real-time update)
```

**Authentication**: Header auth token passed in every request

### 7.5 n8n ↔ Ollama

**Connection Type**: HTTP API

**Chat Completion Request**:
```json
POST http://localhost:11434/api/chat
{
  "model": "qwen2.5:3b-instruct-q4_K_M",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "What is AI?" }
  ],
  "stream": false,
  "format": "json"
}
```

**Embedding Generation**:
```json
POST http://localhost:11434/api/embeddings
{
  "model": "nomic-embed-text",
  "prompt": "Text to embed"
}
```

**Response**:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]  // 768 dimensions
}
```

---

## 8. Core Workflows

### 8.1 User Registration & Login

**Registration**:
```
1. User fills form (name, email, password, role)
2. Frontend calls registerStudent() or registerParent() from api.js
3. POST to ASP.NET API: /api/Student/Account/RegisterStudent
4. Backend creates user in database
5. Sends verification email
6. User clicks link → /api/Identity/Account/ConfirmEmail?token={token}&userID={userID}
7. Frontend (EmailConfirmation.jsx) calls confirmEmail()
8. Account activated
9. Redirect to login page
```

**Login**:
```
1. User enters credentials in Login.jsx
2. Form submits → handleSubmit() called
3. Frontend calls login(email, password) from api.js
4. API sends POST to /api/Identity/Account/Login
5. Backend validates against database
6. Returns JWT token + user data as JSON
7. api.js stores token in localStorage.authToken
8. api.js stores user data in localStorage.userData
9. Frontend stores role in localStorage.userRole
10. Redirect to role-specific dashboard:
    - Student → #/dashboard/student
    - Instructor → #/dashboard/instructor
    - Parent → #/dashboard/parent
    - Manager → #/manager
```

**Token Usage in Subsequent Requests**:
```javascript
// Every API call automatically includes token
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json',
  }
};
```

### 8.2 Create Notebook

**Flow**:
```
1. User clicks "New Notebook" in StudentDashboard
2. Modal opens with title/description inputs
3. On submit:
   - createNotebookAsync({ title, description, user_id })
4. Hook calls Supabase:
   - INSERT INTO notebooks (title, description, user_id)
5. React Query invalidates cache
6. Real-time subscription triggers refetch
7. New notebook appears in list
8. Navigate to notebook workspace
```

### 8.3 Upload & Process Document

**Complete Flow**:
```
1. User drags PDF into AddSourcesDialog
2. handleFileUpload():
   a. Create source entry (status: pending)
      - INSERT INTO sources (notebook_id, title, type, processing_status)
   b. Upload file to Supabase Storage
      - supabase.storage.from('sources').upload(filePath, file)
   c. Update source (status: processing, file_path: filePath)
   d. Call Edge Function: process-document
      - POST /functions/v1/process-document
      - Body: { sourceId, filePath, sourceType }
3. Edge Function:
   a. Generate public file URL
   b. Call n8n webhook: DOCUMENT_PROCESSING_WEBHOOK_URL
   c. Payload: { source_id, file_url, file_path, source_type }
4. n8n Extract Text Workflow:
   a. Generate signed URL for download
   b. Download file from Supabase Storage
   c. Extract text based on type:
      - PDF: Use PDF parser node
      - Audio: Speech-to-text (Whisper)
      - Text: Direct read
   d. Return extracted text
5. n8n Upsert Vector Store Workflow:
   a. Receive extracted text
   b. Split into chunks (500-1000 chars, 100 overlap)
   c. For each chunk:
      - Generate embedding via Ollama (nomic-embed-text)
      - INSERT INTO documents (content, embedding, metadata)
   d. Metadata includes: notebook_id, source_id, chunk_index
6. Update source status to completed
7. Frontend:
   a. Real-time subscription detects source update
   b. UI updates to show "Completed" status
   c. Document is now searchable in chat
```

### 8.4 Chat with AI

**RAG Flow**:
```
1. User types question in ChatArea
2. handleSendMessage():
   a. Add pending message (optimistic UI)
   b. Call sendMessageAsync({ notebookId, content })
3. Hook calls Edge Function:
   - POST /functions/v1/send-chat-message
   - Body: { session_id: notebookId, message: content }
4. Edge Function proxies to n8n webhook
5. n8n Chat Workflow:
   a. Save human message to n8n_chat_histories
   b. Fetch conversation history (last 10 messages)
   c. Generate search query:
      - LLM input: User query + chat history
      - LLM output: { "search_query": "optimized query" }
   d. Vector search:
      - Primary: Retrieve top 10 chunks
      - Expanded: Multi-query retrieval (top 6)
   e. Merge & deduplicate chunks
   f. Heuristic re-rank (score × chunk length)
   g. Generate response:
      - Prompt: "Answer using ONLY context below. Cite with [number]."
      - Context: Top 10 ranked chunks
      - LLM: qwen2.5:3b-instruct
      - Output: JSON with text and citations
   h. Normalize output (handle JSON/text formats)
   i. Create structured response:
      {
        "output": [{
          "text": "Answer with [1] citation",
          "citations": [{"chunk_index": 1}]
        }]
      }
   j. Save AI response to n8n_chat_histories
   k. Return response to Edge Function
6. Edge Function returns to frontend
7. Frontend:
   a. Real-time subscription receives new message
   b. Transform message (map citations to sources)
   c. Render with MessageRenderer component
   d. Citations are clickable buttons
```

### 8.5 Generate Summary

**Flow**:
```
1. User clicks "Generate Summary" in StudioSidebar
2. handleGenerateSummary():
   - fetch('/functions/v1/generate-summary')
   - Body: { notebook_id }
3. Edge Function calls n8n webhook
4. n8n Summary Workflow:
   a. Receive notebook_id
   b. Fetch all sources for notebook
   c. Retrieve document chunks from vector store
   d. Combine chunks into context
   e. Generate summary:
      - Prompt: "Create comprehensive summary with markdown"
      - Requirements: Preserve equations, main titles, key points
      - LLM: qwen3:8b-q4_K_M
   f. Save summary:
      - INSERT INTO notes (notebook_id, title, content)
      - Title: "AI-Generated Summary"
      - Content: Markdown summary
5. Frontend:
   a. refetchNotes() to reload notes list
   b. New summary appears in Studio sidebar
   c. User can view/edit summary
```

### 8.6 View Source Citation

**Flow**:
```
1. User clicks citation button [1] in chat message
2. onCitationClick(sourceId) triggered
3. Component:
   a. Find source in sources list by sourceId
   b. Open SourceContentViewer sidebar
   c. Display source metadata (title, type)
   d. If PDF: Show PDF viewer
   e. If text: Show text content
   f. Highlight relevant section (if available)
```

---

## 9. Authentication & Security

### 9.1 Authentication Flow

**JWT-Based Authentication**:
```
1. User logs in via ASP.NET API
2. Backend generates JWT token
3. Frontend stores token in localStorage
4. All API requests include: Authorization: Bearer {token}
5. Backend validates token on each request
6. Token expires after 24 hours (refresh required)
```

**Supabase Auth**:
- Uses anonymous key for public operations
- Row-level security policies enforce data isolation
- Each user can only access their own notebooks/sources

### 9.2 Security Measures

**Frontend**:
- Environment variables for sensitive keys (`.env`)
- HTTPS for all API calls
- Input validation before API calls
- XSS protection via React's default escaping

**Backend (ASP.NET)**:
- Password hashing (bcrypt)
- Email verification required
- CORS restrictions (localhost only in dev)
- Rate limiting on auth endpoints

**Supabase**:
- Row-level security (RLS) enabled
- Service role key only in Edge Functions
- Signed URLs for temporary file access
- API key rotation support

**n8n Webhooks**:
- Header-based authentication
- Token validation on every request
- HTTPS required in production
- IP whitelisting (optional)

**Ollama**:
- Local-only access (localhost:11434)
- No external network exposure
- Model weights stored locally

### 9.3 Data Privacy

**User Data**:
- User credentials stored in ASP.NET database (encrypted)
- Notebook data isolated by user_id
- Files stored in user-specific paths

**Document Processing**:
- All processing done locally (Ollama)
- No data sent to external AI APIs
- Vector embeddings stored securely in Supabase

**Chat History**:
- Stored per notebook (session_id)
- Only accessible to notebook owner
- Can be deleted by user (Clear Chat)

---

## 10. Deployment Architecture

### Current Setup

**Frontend**: 
- Development: `http://localhost:5173` (Vite dev server)
- Build: `npm run build` → `dist/` folder
- Production: Static hosting (Vercel/Netlify/AWS S3)

**Backend API**: 
- Hosted: `https://sconce.runasp.net` (Azure/RunASP)
- Database: SQL Server

**Supabase**: 
- Cloud-hosted PostgreSQL
- Edge Functions: Auto-deployed
- Storage: Cloud buckets

**InsightsLM**:
- Local n8n instance (self-hosted)
- Local Ollama server (port 11434)
- Requires: Docker or native installation

**Zoom Integration**:
- API Type: Server-to-Server OAuth
- Credentials: Stored in Supabase Edge Function secrets
- Scopes: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`
- Meeting Creation: Server-side via Edge Function
- Security: No credentials exposed to frontend

### Production Considerations

**Scaling**:
- Frontend: CDN distribution
- Backend: Load balancer + multiple instances
- Supabase: Auto-scales (managed)
- n8n: Queue-based processing for high load
- Ollama: GPU acceleration for faster inference
- Zoom: Rate limits managed server-side

**Monitoring**:
- Frontend: Error tracking (Sentry)
- Backend: Application Insights
- Supabase: Built-in monitoring
- n8n: Workflow execution logs
- Ollama: System resource monitoring
- Zoom: API usage tracking via Edge Function logs

**Backup**:
- Database: Daily automated backups
- Files: S3 versioning
- Vector embeddings: Periodic snapshots
- Zoom meeting records: Stored as course content metadata

---

## 11. Third-Party Integrations

### 11.1 Zoom Video Conferencing

**Purpose**: Enable live virtual class sessions within courses

**Architecture**:
- **Frontend Component**: `ZoomMeetingDialog.jsx` - Meeting configuration UI
- **Backend**: Supabase Edge Function (`create-zoom-meeting`)
- **API**: Zoom REST API v2 with Server-to-Server OAuth

**Meeting Creation Flow**:
1. Instructor fills meeting form (topic, date/time, duration, settings)
2. Frontend calls Edge Function with meeting parameters
3. Edge Function authenticates with Zoom using stored credentials
4. Zoom API creates scheduled meeting and returns details
5. Meeting data (join URL, ID, password) saved as course content
6. Students access meeting via "Join Meeting" button in course

**Meeting Data Structure**:
```json
{
  "type": "zoom",
  "title": "Week 1 Live Session",
  "url": "https://zoom.us/j/1234567890?pwd=...",
  "durationMins": 60,
  "zoomData": {
    "meetingId": "1234567890",
    "password": "abc123",
    "startTime": "2025-12-05T18:00:00Z",
    "settings": {
      "waitingRoom": true,
      "joinBeforeHost": false,
      "muteUponEntry": true
    }
  }
}
```

**Security Features**:
- OAuth credentials stored in Supabase secrets (never in frontend)
- Server-side API calls prevent credential exposure
- Meeting passwords optional but recommended
- Waiting room enabled by default
- Host controls via Zoom dashboard

**Instructor Features**:
- "Start Meeting" button opens Zoom as host
- Meeting details displayed (ID, password, start time)
- Edit/delete meetings via course editor
- View meeting settings and participants (future)

**Student Features**:
- "Join Meeting" button as participant
- Wait in waiting room until host admits
- Access meeting ID and password if needed
- Meeting starts when instructor joins

---

## Conclusion

This implementation leverages modern web technologies with local AI processing to create a privacy-focused, high-performance learning management system. The architecture separates concerns effectively:

- **Frontend**: React + React Query for reactive UI
- **Backend**: ASP.NET Core for auth, Supabase for data
- **AI Engine**: n8n + Ollama for local LLM processing
- **Real-time**: Supabase subscriptions for live updates
- **Vector Search**: pgvector for semantic retrieval
- **Video Conferencing**: Zoom API integration for live classes

All components work together seamlessly through well-defined APIs and webhook integrations, with third-party services (like Zoom) integrated securely via serverless functions, ensuring scalability, security, and maintainability.
