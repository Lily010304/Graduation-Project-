# Changelog - Sconce Frontend

All notable changes to the Sconce frontend application will be documented in this file.

## [Unreleased]

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
