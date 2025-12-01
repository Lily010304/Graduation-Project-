# Summary Generation Feature - Setup Guide

## Overview
This feature replaces the podcast generation with an AI-powered summarizer that:
- Generates comprehensive summaries of all sources in a notebook
- Maintains equations, main titles, and key points
- Saves the summary as a note in the database
- Displays summaries in the Studio sidebar

## Components Created/Modified

### 1. n8n Workflow
**File**: `insights-lm-local-package/n8n/InsightsLM___Generate_Summary.json`

**Workflow Flow**:
1. **Webhook** - Receives `{notebook_id}` from frontend
2. **Get Sources** - Fetches all completed sources for the notebook
3. **Aggregate** - Combines source titles and content
4. **Truncate Sources** - Limits to 8000 tokens (configurable)
5. **Generate Summary** - LLM creates summary with this prompt:
   ```
   Your task is to create a comprehensive summary of the provided resource(s).

   IMPORTANT REQUIREMENTS:
   - Maintain all equations exactly as they appear in the source
   - Preserve all main titles and headings structure
   - Extract and highlight all key points
   - Organize the summary in a clear, structured format
   - Use markdown formatting for better readability
   ```
6. **Format Note Data** - Structures data for database insertion
7. **Save Note to Database** - Inserts into `notes` table
8. **Build Success Response** - Returns note details to frontend

**Models Used**:
- `qwen3:8b-q4_K_M` with 12000 context window and temperature 0.3

### 2. Supabase Edge Function
**File**: `supabase/functions/generate-summary/index.ts`

**Purpose**: Proxy requests from frontend to n8n workflow

**Environment Variables Needed**:
- `N8N_SUMMARY_WEBHOOK_URL` - The n8n webhook URL (e.g., `http://your-ngrok-url/webhook/summary-generation`)
- `NOTEBOOK_GENERATION_AUTH` - Authentication token for n8n webhook

### 3. Frontend Components

#### StudioSidebar.jsx
**Changes**:
- Replaced "Audio Overview" card with "Summarizer" card
- Changed `handleGeneratePodcast` to `handleGenerateSummary`
- Added `FileText` icon from lucide-react
- Calls `/functions/v1/generate-summary` Supabase Edge Function
- Refetches notes after successful generation

#### useNotes.js Hook
**Changes**:
- Added `refetch` to returned values for manual data refresh

## Setup Instructions

### Step 1: Import n8n Workflow
1. Open your n8n instance
2. Go to Workflows
3. Click "Import from File"
4. Select `InsightsLM___Generate_Summary.json`
5. Activate the workflow
6. Copy the webhook URL (should be something like `/webhook/summary-generation`)

### Step 2: Deploy Supabase Edge Function
```bash
# Navigate to Sconce directory
cd "D:\Graduation Project\Sconce"

# Deploy the function
supabase functions deploy generate-summary

# Set environment variables
supabase secrets set N8N_SUMMARY_WEBHOOK_URL=<your-ngrok-url>/webhook/summary-generation
supabase secrets set NOTEBOOK_GENERATION_AUTH=<your-auth-token>
```

### Step 3: Update n8n Webhook Authentication
1. In n8n, open the "Generate Summary" workflow
2. Click on the "Webhook" node
3. Ensure "Header Auth" is selected
4. The header should match `NOTEBOOK_GENERATION_AUTH` value

### Step 4: Test the Feature
1. Start your frontend: `npm run dev`
2. Navigate to a notebook with uploaded sources
3. Click "Generate Summary" in the Studio sidebar
4. Wait for generation (may take 30-60 seconds)
5. Summary should appear in the Notes section below

## Database Schema

The `notes` table should have these columns:
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'user', -- 'user' or 'ai_generated'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_notes_notebook_id ON notes(notebook_id);
```

## Configuration Options

### Adjust Token Limit
In the workflow's "Truncate Sources" node, modify:
```javascript
const MAX_TOKENS = 8000; // Increase or decrease as needed
```

### Adjust LLM Temperature
In the "Ollama Model" node:
```json
{
  "temperature": 0.3  // Lower = more deterministic, Higher = more creative
}
```

### Customize Summary Prompt
In the "Generate Summary" node, edit the prompt text to change:
- Formatting requirements
- Level of detail
- Specific sections to include/exclude

## Troubleshooting

### Summary not generating
1. Check n8n execution logs for errors
2. Verify Ollama is running: `ollama serve`
3. Ensure `qwen3:8b-q4_K_M` model is installed: `ollama list`
4. Check Supabase Edge Function logs in dashboard

### Summary is truncated
- Increase `MAX_TOKENS` in "Truncate Sources" node
- Increase `numCtx` in Ollama Model node (currently 12000)

### Summary missing equations/formatting
- The prompt specifically asks to maintain equations
- If still issues, modify the prompt to be more explicit about LaTeX formatting

### Notes not appearing in sidebar
1. Check browser console for errors
2. Verify `notes` table exists in Supabase
3. Ensure `notebook_id` foreign key constraint is correct
4. Try manual refresh or reopen notebook

## API Response Format

**Success Response**:
```json
{
  "success": true,
  "message": "Summary generated and saved successfully",
  "note": {
    "id": "uuid",
    "title": "Summary - Nov 30, 2025",
    "content": "# Summary\n\n## Key Points\n...",
    "created_at": "2025-11-30T12:00:00Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Failed to generate summary",
  "error": "Error details",
  "notebook_id": "uuid"
}
```

## Future Enhancements

- [ ] Allow custom summary prompts from UI
- [ ] Support multiple summary styles (brief, detailed, technical)
- [ ] Add progress indicator with percentage
- [ ] Enable editing of generated summaries
- [ ] Export summaries as PDF/Markdown files
- [ ] Schedule automatic summary regeneration when sources change
