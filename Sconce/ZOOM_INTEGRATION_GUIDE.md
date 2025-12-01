# Zoom API Integration Guide for Sconce

## Overview

The Zoom integration allows instructors to create and schedule live Zoom meetings directly from course content. This guide covers the complete setup process.

## Architecture

```
Frontend (React)
    ↓
Supabase Client
    ↓
Supabase Edge Function (Deno)
    ↓
Zoom API (Server-to-Server OAuth)
```

**Security**: All Zoom API credentials are stored securely in Supabase Edge Function secrets and never exposed to the frontend.

---

## Step 1: Create a Zoom Server-to-Server OAuth App

### 1.1 Go to Zoom Marketplace

Visit: https://marketplace.zoom.us/

### 1.2 Create a New App

1. Click **"Develop"** in the top navigation
2. Click **"Build App"**
3. Select **"Server-to-Server OAuth"** app type
4. Click **"Create"**

### 1.3 Configure App Information

Fill in the following:
- **App Name**: `Sconce LMS Integration` (or your preferred name)
- **Company Name**: Your organization name
- **Developer Contact**: Your email
- **Description**: `Integration for creating Zoom meetings from Sconce LMS`

Click **"Continue"**

### 1.4 Get Your Credentials

On the **App Credentials** page, you'll see:
- **Account ID**: `abc123def456` (example)
- **Client ID**: `xyz789abc123` (example)
- **Client Secret**: `secret_key_here` (example)

**⚠️ Important**: Keep these credentials secure! Copy them to a safe location.

### 1.5 Add Scopes (Permissions)

Navigate to the **Scopes** tab and add the following:
- ✅ `meeting:write:admin` - Create meetings
- ✅ `meeting:read:admin` - Read meeting details
- ✅ `user:read:admin` - Read user information

Click **"Continue"**

### 1.6 Activate the App

Click **"Activate your app"** to enable it.

---

## Step 2: Configure Supabase Edge Function Secrets

You have two options depending on whether you're using **Supabase Cloud** or **Self-hosted Supabase**.

### Option A: Supabase Cloud (Hosted)

#### Using Supabase Dashboard:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Project Settings** → **Edge Functions**
4. Click **"Add Secret"**
5. Add the following secrets one by one:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `ZOOM_ACCOUNT_ID` | Your Account ID from Zoom | Found in App Credentials |
| `ZOOM_CLIENT_ID` | Your Client ID from Zoom | Found in App Credentials |
| `ZOOM_CLIENT_SECRET` | Your Client Secret from Zoom | Found in App Credentials |

#### Using Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set ZOOM_ACCOUNT_ID=your_account_id_here
supabase secrets set ZOOM_CLIENT_ID=your_client_id_here
supabase secrets set ZOOM_CLIENT_SECRET=your_client_secret_here

# Verify secrets are set
supabase secrets list
```

### Option B: Self-hosted Supabase (Docker)

Add the Zoom credentials to your `.env` file in the Supabase Docker setup:

```bash
# Add these lines to your .env file
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
```

Then update your `docker-compose.yml` to pass these as environment variables to the Edge Functions container:

```yaml
functions:
  environment:
    - ZOOM_ACCOUNT_ID=${ZOOM_ACCOUNT_ID}
    - ZOOM_CLIENT_ID=${ZOOM_CLIENT_ID}
    - ZOOM_CLIENT_SECRET=${ZOOM_CLIENT_SECRET}
```

Restart your Supabase containers:

```bash
docker-compose down
docker-compose up -d
```

---

## Step 3: Deploy the Edge Function

### 3.1 Ensure Supabase CLI is Installed

```bash
npm install -g supabase
```

### 3.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref
```

### 3.3 Deploy the Function

From your Sconce project directory:

```bash
# Deploy the create-zoom-meeting function
supabase functions deploy create-zoom-meeting

# You should see output like:
# Deploying create-zoom-meeting (project ref: abc-123)
# Bundled create-zoom-meeting in XX ms.
# Deployed Function create-zoom-meeting in XX ms.
```

### 3.4 Verify Deployment

```bash
# List all deployed functions
supabase functions list

# You should see:
# create-zoom-meeting
# generate-summary (if already deployed)
```

---

## Step 4: Test the Integration

### 4.1 Frontend Testing

1. Start your Vite dev server (if not running):
   ```bash
   npm run dev
   ```

2. Navigate to the Instructor Dashboard → My Courses
3. Open a course and select a week
4. Click **"+ Add Content"**
5. Select **"Zoom Meeting"**
6. Fill in the meeting details:
   - **Topic**: "Week 1: Introduction"
   - **Start Time**: Select a future date/time
   - **Duration**: 60 minutes
   - **Password**: (optional) "test123"
   - **Settings**: Enable/disable as needed

7. Click **"Create Meeting"**

### 4.2 Expected Behavior

✅ **Success**: 
- Meeting is created and added to course content
- You should see the meeting in the course week with a join URL
- The join URL should be a real Zoom link like: `https://zoom.us/j/1234567890?pwd=abc123`

❌ **Error Messages**:

| Error | Cause | Solution |
|-------|-------|----------|
| "Zoom API credentials not configured" | Secrets not set in Edge Function | Follow Step 2 to set secrets |
| "Failed to get Zoom access token: 401" | Invalid credentials | Double-check Account ID, Client ID, and Client Secret |
| "Failed to create Zoom meeting: 403" | Missing scopes/permissions | Ensure app has required scopes (Step 1.5) |
| "Function not found" | Edge function not deployed | Deploy function (Step 3.3) |

### 4.3 Manual API Testing (Optional)

Test the Edge Function directly using `curl`:

```bash
# Replace with your Supabase URL and anon key
curl -X POST https://yuopifjsxagpqcywgddi.supabase.co/functions/v1/create-zoom-meeting \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Meeting",
    "startTime": "2025-12-05T14:00:00Z",
    "duration": 60,
    "password": "test123",
    "waitingRoom": true,
    "muteUponEntry": true
  }'
```

Expected response:
```json
{
  "success": true,
  "meeting": {
    "id": 12345678901,
    "topic": "Test Meeting",
    "startTime": "2025-12-05T14:00:00Z",
    "duration": 60,
    "joinUrl": "https://zoom.us/j/12345678901?pwd=...",
    "meetingId": "12345678901",
    "password": "test123"
  }
}
```

---

## Step 5: Production Deployment

### 5.1 Verify All Secrets

```bash
# List all secrets to ensure they're set
supabase secrets list

# You should see:
# ZOOM_ACCOUNT_ID
# ZOOM_CLIENT_ID
# ZOOM_CLIENT_SECRET
# (plus any other secrets you've set)
```

### 5.2 Deploy Updated Frontend

Build and deploy your frontend with the updated Zoom integration:

```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### 5.3 Monitor Function Logs

Monitor Edge Function execution:

```bash
# Stream function logs in real-time
supabase functions logs create-zoom-meeting --tail

# View recent logs
supabase functions logs create-zoom-meeting
```

---

## Troubleshooting

### Issue: "Invalid access token"

**Cause**: The OAuth token expires after 1 hour.

**Solution**: The Edge Function automatically requests a new token for each meeting creation. No action needed.

---

### Issue: "Meeting creation fails silently"

**Cause**: Check browser console and Edge Function logs.

**Steps**:
1. Open browser DevTools (F12) → Console tab
2. Look for errors like "Failed to invoke function"
3. Check Edge Function logs:
   ```bash
   supabase functions logs create-zoom-meeting
   ```

---

### Issue: "CORS error when calling Edge Function"

**Cause**: CORS headers not properly configured.

**Solution**: The Edge Function already includes CORS headers. Ensure you're calling it through the Supabase client:

```javascript
const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
  body: { /* meeting data */ }
});
```

---

## File Structure

```
Sconce/
├── src/
│   └── components/
│       └── instructor/
│           ├── ZoomMeetingDialog.jsx      # Frontend UI
│           ├── InstructorCourseEditor.jsx # Course editor integration
│           └── AddContentDialog.jsx       # Content type selector
├── supabase/
│   └── functions/
│       ├── create-zoom-meeting/
│       │   └── index.ts                   # Edge Function for Zoom API
│       └── generate-summary/
│           └── index.ts                   # Example Edge Function
├── .env                                   # Local development (DO NOT commit)
└── .env.example                           # Template for environment vars
```

---

## Security Best Practices

✅ **DO**:
- Store Zoom credentials in Supabase Edge Function secrets
- Use Server-to-Server OAuth (not JWT or OAuth 2.0)
- Keep `.env` in `.gitignore`
- Rotate secrets periodically
- Monitor Edge Function logs for suspicious activity

❌ **DON'T**:
- Never commit `.env` files with real credentials
- Never expose Zoom credentials in frontend code
- Don't use deprecated JWT authentication
- Don't share credentials in public repositories

---

## API Rate Limits

Zoom API has the following rate limits:
- **Light**: 100 requests per day
- **Pro**: 1,000 requests per day
- **Business/Enterprise**: 10,000 requests per day

Monitor your usage in the Zoom Marketplace dashboard.

---

## Next Steps

1. ✅ Complete Zoom app setup
2. ✅ Configure Supabase secrets
3. ✅ Deploy Edge Function
4. ✅ Test meeting creation
5. 🔄 **Optional**: Add meeting management features:
   - Update meeting details
   - Delete meetings
   - List all meetings
   - View meeting participants
   - Start/end meetings from LMS

---

## Additional Resources

- [Zoom Server-to-Server OAuth Documentation](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)
- [Zoom API Reference](https://developers.zoom.us/docs/api/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Edge Function logs: `supabase functions logs create-zoom-meeting`
3. Check browser console for frontend errors
4. Verify Zoom app is activated and has correct scopes
5. Ensure secrets are properly set in Supabase

---

**Last Updated**: December 1, 2025
