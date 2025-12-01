# Methodology

## 1. Introduction

This chapter describes the systematic approach undertaken to develop SconceLMS, an AI-powered Learning Management System with integrated notebook-based learning and intelligent document processing capabilities. The methodology encompasses the research design, development process, technical implementation strategies, challenges encountered, and solutions adopted throughout the project lifecycle.

### 1.1 Research Problem and Objectives

The primary research problem addressed in this study was the development of an intelligent learning management system that could:
- Enable students to interact with educational materials through AI-powered chat interfaces
- Automatically generate structured learning content from uploaded documents
- Provide citation-based responses with source tracking
- Facilitate both instructor and student workflows within a unified platform

The main objectives of this research were:
1. To design and implement a full-stack LMS application with modern web technologies
2. To integrate local AI models for document processing and conversational interfaces
3. To develop an n8n-based workflow system for automated content generation
4. To create a responsive, user-friendly interface following modern UX principles
5. To ensure system reliability, scalability, and maintainability

### 1.2 Research Design

This project adopted a **developmental research methodology** combined with **iterative prototyping** and **user-centered design principles**. The research followed an agile development approach with continuous testing, debugging, and refinement cycles.

The methodology can be categorized into several distinct phases:
- **Phase 1**: System Architecture and Technology Selection
- **Phase 2**: Frontend Development and UI/UX Implementation
- **Phase 3**: Backend Integration and API Development
- **Phase 4**: AI Workflow Development and Integration
- **Phase 5**: Testing, Debugging, and Optimization
- **Phase 6**: Deployment and Documentation

---

## 2. Technology Stack Selection

### 2.1 Frontend Technologies

The selection of frontend technologies was based on modern web development best practices, performance requirements, and developer experience considerations.

**Primary Technologies:**
- **React 18+**: Selected for its component-based architecture, virtual DOM performance, and extensive ecosystem
- **Vite**: Chosen as the build tool for its fast Hot Module Replacement (HMR) and optimized production builds
- **Tailwind CSS**: Adopted for utility-first styling approach, enabling rapid UI development and consistent design
- **React Router**: Implemented hash-based routing for client-side navigation

**State Management and Data Fetching:**
- **React Query (@tanstack/react-query)**: Selected for server state management, caching, and real-time data synchronization
- **React Hooks (useState, useEffect, useRef)**: Utilized for component-level state management and side effects

**UI Components and Icons:**
- **Lucide React**: Chosen for consistent, customizable icon library
- **Custom Components**: Developed modular, reusable components following atomic design principles

**Rationale**: This technology stack was selected to ensure:
- Fast development cycles with hot module replacement
- Type-safe code with modern JavaScript (ES6+)
- Responsive, accessible, and performant user interfaces
- Easy integration with backend APIs and real-time subscriptions

### 2.2 Backend Technologies

The backend infrastructure was designed to support both traditional REST APIs and modern serverless functions.

**Primary Backend Services:**
- **ASP.NET Core API**: Selected for robust authentication, user management, and core business logic
  - Hosted on: `https://sconce.runasp.net`
  - Provides endpoints for student/instructor registration, login, and email verification
  
- **Supabase**: Chosen as the Backend-as-a-Service (BaaS) platform for:
  - PostgreSQL database with built-in real-time subscriptions
  - Edge Functions for serverless compute
  - Row-level security policies for data protection
  - Vector storage for document embeddings

**Database Schema:**
Key tables implemented in Supabase PostgreSQL:
- `notebooks`: Stores notebook metadata (title, description, icon, color, generation_status)
- `sources`: Manages uploaded documents and their processing status
- `n8n_chat_histories`: Stores chat message history with session tracking
- `documents`: Vector embeddings for semantic search (pgvector extension)

**Rationale**: The hybrid backend approach was chosen to:
- Leverage ASP.NET Core's mature authentication system
- Utilize Supabase's real-time capabilities for live chat updates
- Enable serverless architecture for document processing workflows
- Provide scalable vector search for AI-powered retrieval

### 2.3 AI and Automation Technologies

The AI infrastructure was designed to run locally for privacy, cost-efficiency, and control.

**Core Technologies:**
- **Ollama**: Selected as the local LLM inference server
  - Models used: 
    - `qwen2.5:3b-instruct-q4_K_M` (chat responses, 1.9 GB)
    - `qwen3:8b-q4_K_M` (notebook generation, larger context window)
    - `nomic-embed-text:latest` (embeddings, 274 MB)
  
- **n8n**: Chosen as the workflow automation platform
  - Self-hosted for security and customization
  - Provides visual workflow designer for complex AI pipelines
  - Supports webhooks, HTTP requests, and database operations

**Vector Search:**
- **pgvector**: PostgreSQL extension for vector similarity search
- Enables semantic document retrieval using cosine similarity

**Rationale**: Local AI infrastructure was chosen to:
- Eliminate API costs associated with cloud-based LLMs
- Ensure data privacy and compliance
- Provide low-latency responses
- Enable full customization of prompts and workflows

---

## 3. Development Process and Implementation

### 3.1 Phase 1: System Architecture and Initial Setup

#### 3.1.1 Project Initialization

The project began with setting up the development environment and project structure:

```bash
# Frontend initialization
npm create vite@latest sconce -- --template react
cd sconce
npm install
```

**Dependencies installed:**
- Core: `react`, `react-dom`, `react-router-dom`
- State management: `@tanstack/react-query`
- Styling: `tailwindcss`, `postcss`, `autoprefixer`
- Icons: `lucide-react`
- HTTP client: Built-in `fetch` API
- Supabase: `@supabase/supabase-js`

**Project structure established:**
```
Sconce/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, registration components
│   │   ├── notebook/       # Notebook-related components
│   │   └── shared/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, Supabase client
│   ├── App.jsx             # Root component with routing
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
└── vite.config.js          # Build configuration
```

#### 3.1.2 Environment Configuration

Environment variables were configured to separate development and production settings:

```env
# .env.local (not committed to version control)
VITE_SUPABASE_URL=https://yuopifjsxagpqcywgddi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_API_BASE_URL=https://sconce.runasp.net
```

**Challenge**: Initial CORS issues when calling the ASP.NET Core API from localhost.

**Solution**: Implemented CORS policy on the backend server with explicit origin allowance:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowLocalhost", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

### 3.2 Phase 2: Frontend Development

#### 3.2.1 Authentication System Implementation

**Approach**: Hybrid authentication using both ASP.NET Core (primary) and Supabase (session management).

**Registration Flow:**
1. User submits registration form (StudentRegister.jsx)
2. POST request to `/api/Student/Account/RegisterStudent`
3. Backend creates user account and sends verification email
4. Success screen displays "Check Your Email" message
5. User clicks verification link in email
6. EmailConfirmation.jsx component validates token via GET request
7. Redirect to login page upon successful verification

**Key Components Developed:**
- `StudentRegister.jsx`: Registration form with validation
- `EmailConfirmation.jsx`: Email verification handler
- `Login.jsx`: Authentication form for students/instructors

**Challenge**: Email verification links failed initially due to incorrect URL encoding.

**Solution**: Implemented proper URL parameter encoding and query string parsing:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userID = urlParams.get('userID');

const response = await fetch(
  `${API_URL}/api/Identity/Account/ConfirmEmail?` +
  `token=${encodeURIComponent(token)}&userID=${encodeURIComponent(userID)}`
);
```

#### 3.2.2 Notebook Interface Development

The notebook interface underwent multiple iterations to achieve the current three-column layout.

**Design Evolution:**
1. **Initial Design**: Single-column chat interface
2. **Second Iteration**: Two-column layout (sources + chat)
3. **Final Design**: Three-column layout (sources + chat + studio)

**Final Layout Components:**
- **SourcesSidebar** (25-35% width): Displays uploaded documents, allows deletion, shows citation viewer
- **ChatArea** (35-45% width): Main conversation interface with message history
- **StudioSidebar** (30% width): Future podcast generation features, toggleable visibility

**Implementation Details:**

`NotebookPage.jsx` orchestrates the layout with dynamic width calculations:
```javascript
const sourcesWidth = isSourceDocumentOpen 
  ? (isStudioVisible ? 'w-[35%]' : 'w-[30%]') 
  : (isStudioVisible ? 'w-[25%]' : 'w-[30%]');
  
const chatWidth = isSourceDocumentOpen 
  ? (isStudioVisible ? 'w-[35%]' : 'w-[70%]') 
  : (isStudioVisible ? 'w-[45%]' : 'w-[70%]');
```

**Challenge**: Initial viewport sizing issues where the notebook didn't fit properly in the window.

**Solution**: Changed from calculated height (`h-[calc(100vh-8rem)]`) to fixed positioning:
```css
position: fixed;
top: 6rem;
left: 240px;
right: 0;
bottom: 0;
```

---

## 4. AI Workflow Development

### 4.1 n8n Workflow Architecture

The AI processing pipeline was built using n8n, a node-based workflow automation tool. Three primary workflows were developed:

#### 4.1.1 Generate Notebook Details Workflow

**Purpose**: Automatically generate notebook metadata (title, description, example questions) from uploaded documents.

**Workflow Nodes:**
1. **Webhook Trigger**: Receives `{notebookId, filePath, sourceType}`
2. **Extract Text**: Parses PDF/DOCX/TXT files using text extraction libraries
3. **Generate Title & Description (LLM)**: Ollama node with `qwen3:8b-q4_K_M` model
4. **Structured Output Parser**: Validates JSON schema with auto-fix enabled
5. **Normalize Output**: Cleans and standardizes LLM response
6. **Random Color**: Assigns theme color to notebook
7. **Update Supabase**: Saves metadata to `notebooks` table

**Challenge**: "Model output doesn't fit required format" errors due to missing Structured Output Parser.

**Solution**: Added parser node with flexible schema accepting both nested and flat JSON:
```json
{
  "anyOf": [
    {"required": ["output"]},
    {"required": ["title", "summary"]}
  ],
  "additionalProperties": true
}
```

**Challenge**: "Expecting Unicode escape sequence" error in Random Color node.

**Solution**: Fixed Normalize Output code that was creating duplicate keys:
```javascript
// BEFORE (buggy):
return { json: { ...j, output } };  // Spread creates duplicates

// AFTER (fixed):
return { json: { output: {
  title: (outObj.title || 'Untitled'),
  summary: (outObj.summary || 'No summary'),
  example_questions: toQuestionsArray(outObj.example_questions),
  emoji: normalizeEmoji(outObj.emoji)
}}};
```

#### 4.1.2 Chat Workflow

**Purpose**: Answer user questions using RAG (Retrieval-Augmented Generation) with citations.

**Workflow Nodes:**
1. **Webhook**: Receives `{session_id, message}` from frontend
2. **Save Human Message**: Immediately stores user message in database
3. **Fetch Chat History**: Retrieves last 10 messages for context
4. **Generate Search Query**: LLM creates vector search query from user question
5. **Supabase Vector Store**: Retrieves top-10 relevant chunks using cosine similarity
6. **Merge & Dedup Chunks**: Removes duplicate retrieved passages
7. **Heuristic Rerank**: Sorts by (similarity_score × text_length)
8. **Aggregate Combined**: Prepares context for LLM
9. **Generate Response**: LLM answers with citations [1][2]
10. **Normalize LLM Output**: Standardizes response format
11. **Create Citations**: Maps citation numbers to source metadata
12. **Save AI Response**: Stores answer with structured content
13. **Respond to Webhook**: Returns JSON response to frontend

**Challenge**: Duplicate AI responses - same question generated two different answers.

**Solution**: Discovered workflow had two parallel vector retrieval paths causing double execution:
```json
// BEFORE (buggy - double execution):
"Generate Search Query1": {
  "main": [[
    {"node": "Supabase Vector Store"},
    {"node": "Supabase Multi Retrieve"}  // Extra path!
  ]]
}

// AFTER (fixed - single execution):
"Generate Search Query1": {
  "main": [[
    {"node": "Supabase Vector Store"}
  ]]
}
```

**Challenge**: Frontend showing duplicate user messages.

**Solution**: Added conditional check to hide pending message if it already exists in messages array:
```javascript
{pendingUserMessage && 
 !messages.some(m => isUserMessage(m) && m.message.content === pendingUserMessage) && (
  <div className="flex justify-end">
    <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg">
      {pendingUserMessage}
    </div>
  </div>
)}
```

**Challenge**: Users could spam-click send button causing multiple workflow executions.

**Solution**: Implemented debounce flag with 1-second cooldown:
```javascript
const [isSendingMessage, setIsSendingMessage] = useState(false);

const handleSend = async (text) => {
  if (isSendingMessage) return;
  setIsSendingMessage(true);
  
  try {
    await sendMessage({ notebookId, content });
  } finally {
    setTimeout(() => setIsSendingMessage(false), 1000);
  }
};
```

---

## 5. Data Collection and Processing

### 5.1 Document Upload and Processing

**Upload Flow:**
1. User selects file(s) via `AddSourcesDialog.jsx`
2. Frontend uploads to Supabase Storage
3. Supabase Edge Function `process-document` triggers n8n webhook
4. n8n extracts text from document
5. Text is chunked into ~500-character segments with 50-character overlap
6. Each chunk is embedded using `nomic-embed-text` model
7. Embeddings stored in `documents` table with metadata
8. Source status updated to "completed"

**Chunking Strategy:**
- **Chunk size**: ~500 characters (balances context vs. retrieval precision)
- **Overlap**: 50 characters (prevents information loss at boundaries)
- **Metadata preserved**: source_id, chunk_index, notebook_id

**Challenge**: Initial 401 unauthorized errors when calling n8n webhooks.

**Solution**: Configured Supabase Edge Function to include proper authentication header:
```javascript
const response = await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${NOTEBOOK_GENERATION_AUTH}`
  },
  body: JSON.stringify(payload)
});
```

### 5.2 Message Storage and Retrieval

**Database Schema:**
```sql
CREATE TABLE n8n_chat_histories (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Message Format:**
```json
{
  "type": "human" | "ai",
  "content": "string" | {
    "output": [
      {
        "text": "Answer with [1] citations",
        "citations": [{"chunk_index": 1, "source_id": "uuid"}]
      }
    ]
  }
}
```

**Real-time Synchronization:**
Implemented using Supabase real-time subscriptions:
```javascript
const channel = supabase
  .channel('chat-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'n8n_chat_histories',
    filter: `session_id=eq.${notebookId}`
  }, (payload) => {
    const newMessage = transformMessage(payload.new, sourceMap);
    queryClient.setQueryData(['chat-messages', notebookId], 
      (old) => [...old, newMessage]
    );
  })
  .subscribe();
```

---

## 6. Testing and Validation

### 6.1 Unit Testing Approach

**Components Tested:**
- `MessageRenderer.jsx`: Validates proper rendering of both plain text and structured content with citations
- `useChatMessages.js`: Ensures correct transformation of database messages to display format
- `useNotebook.js`: Validates single notebook fetching and caching

**Testing Strategy:**
Manual testing was conducted throughout development with focus on:
- User interaction flows (registration → verification → notebook creation → chat)
- Real-time updates (new messages appearing without page refresh)
- Error handling (network failures, invalid inputs, missing data)

### 6.2 Build Validation

**Production Build Process:**
```bash
npm run build
```

**Build Configuration (`vite.config.js`):**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/functions': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
```

**Build Metrics:**
- Total modules transformed: 2,236
- Output size: ~688 KB (minified JavaScript)
- CSS size: ~58 KB (minified)
- Build time: ~7.92 seconds

**Challenge**: Initial build errors due to JSX syntax issues (missing closing tags, duplicate code).

**Solution**: Systematic code review and syntax validation:
```jsx
// BEFORE (broken):
<input ... disabled={...}
<button ...>  // Missing closing tag on input!

// AFTER (fixed):
<input ... disabled={...} />
<button ...>...</button>
```

---

## 7. Challenges and Solutions Summary

### 7.1 Technical Challenges

| Challenge | Impact | Solution Implemented | Outcome |
|-----------|--------|---------------------|---------|
| CORS errors from localhost | Blocked API calls | Added CORS policy on ASP.NET backend | ✅ Resolved |
| Email verification URL encoding | Broken verification links | Implemented `encodeURIComponent()` | ✅ Resolved |
| Missing Structured Output Parser | Workflow failures | Added parser node with flexible schema | ✅ Resolved |
| Duplicate keys in Normalize Output | Random Color node errors | Removed spread operator | ✅ Resolved |
| Duplicate AI responses | Poor UX, wasted resources | Removed extra vector retrieval path | ✅ Resolved |
| Duplicate user messages | Confusing chat display | Added conditional rendering check | ✅ Resolved |
| Spam-click sending | Multiple workflow executions | Implemented debounce with 1s cooldown | ✅ Resolved |
| Viewport sizing issues | Content cut off | Changed to fixed positioning | ✅ Resolved |
| JSX syntax errors | Build failures | Code review and validation | ✅ Resolved |

### 7.2 Workflow Debugging Process

**Systematic Approach:**
1. **Identify**: Check n8n execution logs for error messages
2. **Isolate**: Test individual nodes with manual execution
3. **Analyze**: Examine input/output data at each step
4. **Fix**: Modify node configuration or code
5. **Validate**: Re-run workflow and verify success
6. **Document**: Update changelog with fix details

**Example: Debugging Duplicate Responses**

**Step 1 - Observation**: User reported receiving two different AI answers for same question.

**Step 2 - Investigation**: 
- Checked n8n execution tab
- Found "Generate Response1" node had two runs (run1, run2)
- Each run produced different output

**Step 3 - Root Cause Analysis**:
- Examined workflow connections JSON
- Discovered two parallel paths from "Generate Search Query"
- Both paths merged at "Merge & Dedup Chunks"

**Step 4 - Solution**:
- Removed connection to "Supabase Multi Retrieve"
- Kept single path through "Supabase Vector Store"

**Step 5 - Validation**:
- Re-imported workflow
- Sent test message
- Confirmed single AI response

---

## 8. Development Tools and Environment

### 8.1 Code Editor and Extensions

**Primary Editor**: Visual Studio Code

**Essential Extensions Used:**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- GitLens

### 8.2 Version Control

**Git Workflow:**
- Repository: GitHub (`Lily010304/Graduation-Project-`)
- Branch strategy: Main branch for stable code
- Submodule: `insights-lm-local-package` for n8n workflows

**Commit Pattern:**
```bash
# For submodule changes:
cd insights-lm-local-package
git add n8n/InsightsLM___Chat.json
git commit -m "Fix: Remove duplicate vector retrieval path"
git push

# Update parent repo:
cd ..
git add insights-lm-local-package
git commit -m "Update submodule: Fix chat workflow double execution"
git push
```

### 8.3 Local Development Environment

**Services Running:**
- **Frontend Dev Server**: `npm run dev` (port 5173)
- **Ollama**: `ollama serve` (port 11434)
- **n8n**: Self-hosted (port configured via ngrok)
- **Mock Functions Server**: `npm run start:mock-functions` (port 8787)

**Port Management:**
| Service | Port | Purpose |
|---------|------|---------|
| Vite Dev Server | 5173 | Frontend development |
| Mock Functions | 8787 | Local Edge Function testing |
| Ollama API | 11434 | LLM inference |
| n8n | Variable (ngrok) | Workflow automation |

---

## 9. User Experience Design Decisions

### 9.1 Chat Interface Design

**Design Principles Applied:**
- **Immediate Feedback**: Show user message instantly (optimistic UI)
- **Loading States**: Display typing indicators for AI responses
- **Error Handling**: Graceful fallbacks for failed requests
- **Citation Visibility**: Inline citation buttons for source transparency

**Message Rendering Strategy:**

Created `MessageRenderer.jsx` component to handle:
```javascript
// User messages (plain text):
<div>{content}</div>

// AI messages (structured with citations):
{content.segments.map(segment => (
  <span>
    {segment.text}
    {segment.citation_id && (
      <button onClick={() => onCitationClick(citation)}>
        [{segment.citation_id}]
      </button>
    )}
  </span>
))}
```

### 9.2 Source Management UX

**Upload Flow:**
1. Click "Upload Resources" button
2. Dialog opens with file picker
3. Select PDF/DOCX/TXT files
4. Upload progress indicator
5. Success confirmation
6. Sources appear in sidebar with processing status

**Processing Status Indicators:**
- 🔄 Processing (animated spinner)
- ✅ Completed (green checkmark)
- ❌ Failed (red error icon)

### 9.3 Responsive Design

**Breakpoints Implemented:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptive Features:**
- Collapsible Studio sidebar
- Responsive column widths
- Mobile-optimized dialogs
- Touch-friendly button sizes

---

## 10. Documentation and Knowledge Management

### 10.1 Code Documentation

**Documentation Strategy:**
- Inline comments for complex logic
- JSDoc comments for reusable functions
- README files for setup instructions
- Changelog for tracking modifications

### 10.2 Changelog Management

Created two comprehensive changelog files:
- `Sconce/CHANGELOG.md`: Frontend changes
- `insights-lm-local-package/CHANGELOG.md`: Workflow changes

**Changelog Structure:**
```markdown
# Changelog

## [Date] - YYYY-MM-DD

### Added
- Feature descriptions

### Fixed
- Bug fix descriptions

### Changed
- Modification descriptions

### Technical Details
- Implementation specifics
```

---

## 11. Conclusion

This methodology chapter has documented the systematic approach taken to develop SconceLMS, covering:

1. **Technology Selection**: Justified choices for React, Supabase, Ollama, and n8n
2. **Development Process**: Phased implementation from architecture to deployment
3. **AI Integration**: Detailed workflow development for document processing and chat
4. **Data Management**: Database design, real-time synchronization, and vector search
5. **Testing Strategy**: Build validation and manual testing approach
6. **Challenge Resolution**: Systematic debugging and problem-solving process
7. **UX Design**: User-centered interface decisions and responsive design

The iterative development approach, combined with continuous testing and debugging, enabled the successful creation of a functional AI-powered LMS with robust features and reliable performance.

**Key Success Factors:**
- ✅ Agile methodology with rapid iteration cycles
- ✅ Comprehensive error logging and debugging
- ✅ User-centered design principles
- ✅ Systematic problem-solving approach
- ✅ Detailed documentation throughout development
- ✅ Version control for code and workflow management

**Future Enhancements Identified:**
- Code splitting to reduce bundle size
- Automated testing suite (Jest, React Testing Library)
- Performance monitoring and optimization
- Advanced analytics and usage tracking
- Multi-language support (i18n)
- Dark mode implementation

This methodology provides a reproducible roadmap for similar AI-integrated educational platform development projects.
