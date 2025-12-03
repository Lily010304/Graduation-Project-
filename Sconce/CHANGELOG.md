# Changelog - Sconce Frontend

All notable changes to the Sconce frontend application will be documented in this file.

## [Unreleased]

### Added - December 3, 2025

#### Backend API Integration - Login Endpoint

- **API Client Module**: Created centralized API service (`src/lib/api.js`)
  - Complete wrapper for all backend endpoints
  - Automatic JWT token management (storage and inclusion in requests)
  - Unified error handling with detailed logging
  - Support for all endpoint types: Identity, Student, Parent, Instructor, Admin
  - Generic `apiRequest` function for DRY code
  - Helper functions: `login`, `logout`, `getCurrentUser`, `isAuthenticated`

- **Login Component Integration**: Connected Login.jsx to backend API
  - Replaced placeholder auth with actual API call to `POST /api/Identity/Account/Login`
  - Added loading state during authentication
  - Error message display for failed login attempts
  - Automatic token storage in localStorage upon successful login
  - Role-based redirect after authentication
  - Disabled form inputs during submission
  - User data persistence for session management

- **Authentication Flow**:
  1. User enters credentials (email, password, role)
  2. Frontend calls `login(email, password)` from API client
  3. API sends POST request to `https://sconce.runasp.net/api/Identity/Account/Login`
  4. Backend validates credentials and returns JWT token + user data
  5. Frontend stores token and user data in localStorage
  6. User redirected to role-specific dashboard

- **Error Handling**:
  - Network errors caught and displayed to user
  - Invalid credentials show clear error message
  - Console logging for debugging
  - Non-blocking error display (red alert box)

### Added - December 1, 2025

#### Instructor Dashboard Restructuring

- **Streamlined Navigation**: Removed redundant tabs from instructor sidebar
  - Removed "Exams & Assignments" - now integrated into course editor
  - Removed "Grading" - will be integrated into specific content items
  - Removed "Student Performance" - to be added as analytics feature later
  - Removed "Payment Log" - moved to admin/manager dashboard
  - Kept essential tabs: Dashboard, My Courses, AI Notebooks, Messages, Schedule

- **Content Creation Dialog**: New modal for adding course content
  - Component: `AddContentDialog.jsx`
  - Visual grid layout inspired by Moodle's activity picker
  - Content types available:
    - URL Link (web resources)
    - YouTube Video (embedded videos)
    - Text Content (instructions, readings)
    - Lecture (video lectures with duration)
    - File Upload (PDFs, documents)
    - Assignment (graded tasks)
    - Quiz (interactive assessments)
  - Search functionality to filter content types
  - Icon-based cards with descriptions for each type

- **Quiz Builder Integration**: Seamless quiz creation workflow
  - Selecting "Quiz" in content dialog navigates to dedicated quiz builder
  - Quiz builder receives context (courseId, weekId) via URL parameters
  - Auto-creates quiz with unique ID when accessed from course
  - "Back to Course" button to return to course editor
  - Quiz data persists in localStorage with course association
  - Route: `#/dashboard/instructor/quiz/<quizId>?course=<courseId>&week=<weekId>`

- **Enhanced Course Editor**: Updated content management
  - "Add Content" button opens new content dialog instead of dropdown
  - Content type pre-selected when adding (no more type selector in form)
  - Conditional form fields based on content type:
    - URL/YouTube: Shows URL input field
    - Lecture: Shows URL and duration fields
    - Text/Assignment: Shows description only
  - Improved UX with type indicator badge when adding content
  - Quiz items link directly to quiz builder for editing

- **Route Handling Updates**: Extended instructor store routing
  - Added quiz builder route parsing in `instructorStore.js`
  - Handles query parameters for course and week context
  - Updated `parseInstructorHash` to support quiz routes
  - Removed routes for deleted dashboard sections

### Changed - December 1, 2025

- **InstructorLayout**: Reduced sidebar menu items from 9 to 5 tabs
- **InstructorDashboard**: Updated route handling to include quiz builder
- **InstructorCourseEditor**: Replaced inline content type selector with dialog
- **ExamsBuilder**: Now accepts props for course context and initial quiz ID

### Removed - December 1, 2025

- Standalone "Exams & Assignments" page (functionality moved to course editor)
- "Grading" placeholder page
- "Student Performance" placeholder page  
- "Payment Log" placeholder page

### Added - November 24-25, 2025

#### Email Verification System
- **EmailConfirmation Component**: Created new component to handle email verification after student registration
  - Extracts token and userID from URL query parameters
  - Calls GET `/api/Identity/Account/ConfirmEmail` endpoint
  - Shows loading spinner, success checkmark, or error states
  - Auto-redirects to login page after 3 seconds on success
  - Matches styling with registration page (gradient background, white card)

- **Student Registration Success Flow**: Updated StudentRegister.jsx
  - Added "Check Your Email" success screen after registration
  - Shows email icon, verification instructions, and tips
  - Displays registered email address
  - "Go to Login" button for manual navigation
  - Removed alert() notifications in favor of dedicated UI

- **Email Verification Route**: Added `#/confirm-email` route in App.jsx
  - Routes to EmailConfirmation component
  - Handles verification link clicks from user inbox

#### Notebook Features

- **Notebook Description Display**: Fixed ChatArea to show AI-generated notebook description
  - Fetches notebook data using `useNotebook` hook
  - Displays description in gray summary box below notebook title
  - Shows loading state while generating content
  - Falls back to "No description available" if missing

- **Example Questions Display**: Implemented suggested questions feature
  - Displays AI-generated example questions as clickable buttons
  - Questions appear at bottom of chat input area
  - Uses horizontal scrollable carousel layout
  - Clicking a question sends it as a message
  - Questions disappear after being clicked (no duplicates)
  - Questions hidden while chat is disabled or messages are pending

- **Notebook Viewport Fix**: Corrected notebook page to fit properly within window
  - Changed from `h-[calc(100vh-8rem)]` to fixed positioning
  - Uses `fixed inset-0 top-[6rem] left-[240px]` to fill exact viewport space
  - Accounts for header height (6rem) and sidebar width (240px)
  - Prevents scrolling issues with three-column layout
  - All columns (Sources, Chat, Studio) now visible and properly sized

#### Chat Integration

- **Supabase Edge Function Integration**: Updated chat message sending
  - Changed from direct n8n webhook calls to Supabase Edge Function
  - Now calls `https://yuopifjsxagpqcywgddi.supabase.co/functions/v1/send-chat-message`
  - Uses Supabase anon key for authentication
  - Proper error handling and logging
  - Edge Function acts as proxy to n8n workflow

- **NotebookPage Data Flow**: Fixed notebook prop passing
  - Added `useNotebook` hook to fetch single notebook by ID
  - Passes complete notebook object to ChatArea component
  - Enables access to description, example_questions, and other fields
  - Fixed build error by removing non-existent AuthContext import

### Fixed - November 24-25, 2025

#### React Query Mutations
- **Delete Source Function**: Fixed useSources.js hook
  - Added `deleteSourceAsync` export for async mutation
  - Added `updateSourceAsync` export for consistency
  - Fixed "deleteSource.mutateAsync is not a function" error in SourcesSidebar
  - Updated SourcesSidebar to use `deleteSourceAsync` instead of `deleteSource.mutateAsync`

#### Build Issues
- **Missing AuthContext Import**: Removed dependency on non-existent AuthContext
  - Replaced `useNotebooks` + `useAuth` pattern with `useNotebook` hook
  - Fixed build error: "Could not resolve ../../contexts/AuthContext"
  - Simplified data fetching to use single-notebook hook

### Technical Improvements

#### Code Quality
- Improved error handling in chat message sending with detailed error logging
- Enhanced real-time subscription for chat messages with proper source mapping
- Better loading states for notebook generation (spinner, status messages)
- Consistent styling across authentication and notebook pages

#### Architecture
- Proper separation of concerns with Supabase Edge Functions
- Secure authentication using Supabase anon keys
- Real-time updates via Supabase subscriptions
- Optimized data fetching with React Query

---

## Integration Points

### Backend API Endpoints Used
- `POST /api/Identity/Account/Login` - User authentication (Student, Instructor, Parent, Manager)
- `POST /api/Student/Account/RegisterStudent` - Student registration
- `GET /api/Identity/Account/ConfirmEmail?token={token}&userID={userID}` - Email verification

### Supabase Services
- **Database Tables**: notebooks, sources, n8n_chat_histories
- **Edge Functions**: 
  - `send-chat-message` - Chat message processing
  - `process-document` - Document upload handling
  - `generate-notebook-content` - Notebook metadata generation
- **Real-time Subscriptions**: Chat messages, notebook updates, source updates

### n8n Workflows (via Edge Functions)
- InsightsLM - Chat (UUID: 2fabf43f-6e6e-424b-8e93-9150e9ce7d6c)
- InsightsLM - Generate Notebook Details
- InsightsLM - Extract Text
- InsightsLM - Process Additional Sources

---

## Dependencies

### Environment Variables Required
```
VITE_SUPABASE_URL=https://yuopifjsxagpqcywgddi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Key Libraries
- React 18+ with JSX
- React Router (hash routing)
- @tanstack/react-query (mutations and queries)
- Supabase JS Client
- Tailwind CSS
- Lucide React (icons)
