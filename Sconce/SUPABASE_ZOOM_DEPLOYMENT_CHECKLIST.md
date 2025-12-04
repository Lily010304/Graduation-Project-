# Zoom Backend Deployment Checklist

Use this checklist to deploy Zoom functionality to Supabase.

## 📋 Pre-Deployment

- [ ] **Zoom App Created**
  - [ ] Logged into https://marketplace.zoom.us/
  - [ ] Created OAuth (not Server-to-Server) app
  - [ ] Copied Client ID
  - [ ] Copied Client Secret
  - [ ] Added redirect URI: `https://your-supabase-url/functions/v1/zoom-oauth-callback`

- [ ] **Supabase Project Ready**
  - [ ] Created Supabase project
  - [ ] Obtained Project URL
  - [ ] Obtained Anon Key
  - [ ] Obtained Service Role Key

- [ ] **Local Environment**
  - [ ] Node.js installed
  - [ ] npm installed
  - [ ] Supabase CLI installed: `npm install -g supabase`

## 🚀 Deployment Steps

### Phase 1: Database Setup (2-3 minutes)

- [ ] **Access Supabase SQL Editor**
  - [ ] Navigate to Supabase Dashboard
  - [ ] Go to SQL Editor
  - [ ] Click "New Query"

- [ ] **Deploy Database Schema**
  - [ ] Open `supabase-zoom-schema.sql` in your editor
  - [ ] Copy entire contents
  - [ ] Paste into Supabase SQL Editor
  - [ ] Click "Run" (or Ctrl+Enter)
  - [ ] Wait for success message

- [ ] **Verify Database Tables**
  - [ ] Go to Supabase Dashboard → Database → Tables
  - [ ] Verify these tables exist:
    - [ ] `instructor_zoom_auth`
    - [ ] `zoom_meetings`
    - [ ] `zoom_meeting_participants`
    - [ ] `zoom_meeting_recordings`
    - [ ] `zoom_webhook_logs`
    - [ ] `zoom_sync_logs`

### Phase 2: Secrets Configuration (1-2 minutes)

- [ ] **Add Secrets to Supabase**
  - [ ] Go to Supabase Dashboard → Settings → Secrets
  - [ ] Click "New Secret"
  - [ ] Name: `ZOOM_CLIENT_ID`
  - [ ] Value: `your_zoom_client_id` (from Zoom app)
  - [ ] Click "Create Secret"
  - [ ] Click "New Secret"
  - [ ] Name: `ZOOM_CLIENT_SECRET`
  - [ ] Value: `your_zoom_client_secret` (from Zoom app)
  - [ ] Click "Create Secret"

- [ ] **Verify Secrets Added**
  - [ ] Go to Settings → Secrets
  - [ ] Confirm you see both secrets listed
  - [ ] Note: Values are hidden for security

### Phase 3: Edge Functions Deployment (3-5 minutes)

- [ ] **Install Supabase CLI** (if not already installed)
  ```bash
  npm install -g supabase
  ```

- [ ] **Login to Supabase**
  - [ ] Open Terminal/PowerShell
  - [ ] Run: `supabase login`
  - [ ] Follow prompts to authenticate
  - [ ] Wait for success confirmation

- [ ] **Link Your Project**
  - [ ] Get your Project Ref from Supabase Dashboard → Settings → General
  - [ ] Run: `supabase link --project-ref YOUR_PROJECT_REF`
  - [ ] Confirm linking

- [ ] **Navigate to Project Directory**
  - [ ] `cd "d:\Graduation Project\Sconce"`

- [ ] **Deploy Functions**
  ```bash
  # Deploy function 1
  supabase functions deploy zoom-utils
  # Wait for success
  
  # Deploy function 2
  supabase functions deploy zoom-oauth-callback
  # Wait for success
  
  # Deploy function 3
  supabase functions deploy zoom-meetings
  # Wait for success
  ```

- [ ] **Verify Functions Deployed**
  - [ ] Run: `supabase functions list`
  - [ ] Confirm you see all 3 functions:
    - [ ] `zoom-utils`
    - [ ] `zoom-oauth-callback`
    - [ ] `zoom-meetings`

### Phase 4: Environment Configuration (1 minute)

- [ ] **Update `.env` File**
  - [ ] Open `.env` in project root
  - [ ] Find/add these variables:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your_anon_key
    VITE_ZOOM_CLIENT_ID=your_zoom_client_id
    ```
  - [ ] Get values from:
    - [ ] SUPABASE_URL: Supabase Dashboard → Settings → API → Project URL
    - [ ] SUPABASE_ANON_KEY: Supabase Dashboard → Settings → API → anon public
    - [ ] ZOOM_CLIENT_ID: Your Zoom app credentials

- [ ] **Save `.env` File**

### Phase 5: Frontend Testing (3-5 minutes)

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

- [ ] **Test Zoom Connection**
  - [ ] Open browser: `http://localhost:5173`
  - [ ] Login as instructor (use dev/dev if available)
  - [ ] Navigate to Dashboard
  - [ ] Click "Add Content" → "Zoom Meeting"
  - [ ] Click "Connect Zoom Account" button
  - [ ] Should redirect to Zoom OAuth page
  - [ ] Sign in with your Zoom account
  - [ ] Approve access
  - [ ] Should redirect back to dashboard
  - [ ] Check console for success message

- [ ] **Test Meeting Creation**
  - [ ] After connection succeeds
  - [ ] Click "Add Content" → "Zoom Meeting" again
  - [ ] Fill meeting form:
    - [ ] Topic: "Test Meeting"
    - [ ] Start Time: Tomorrow at 2 PM
    - [ ] Duration: 60 minutes
    - [ ] Password: test123
  - [ ] Click "Create Meeting"
  - [ ] Should see success message with join URL
  - [ ] Check console for meeting ID

- [ ] **Verify Database Record**
  - [ ] Go to Supabase Dashboard → Database → Tables
  - [ ] Click `zoom_meetings` table
  - [ ] Verify new record created with:
    - [ ] Your meeting topic
    - [ ] Your instructor ID
    - [ ] Join URL starting with `https://zoom.us/j/`
    - [ ] Status: `scheduled`

### Phase 6: Verification & Testing (2-3 minutes)

- [ ] **Check Database Entries**
  ```sql
  -- In Supabase SQL Editor, run:
  SELECT * FROM instructor_zoom_auth LIMIT 1;
  SELECT * FROM zoom_meetings ORDER BY created_at DESC LIMIT 1;
  ```
  - [ ] instructor_zoom_auth has your record
  - [ ] zoom_meetings has test meeting

- [ ] **Check Function Logs**
  - [ ] Terminal: `supabase functions logs zoom-meetings --tail`
  - [ ] Create a test meeting in frontend
  - [ ] Should see logs in terminal
  - [ ] No error messages

- [ ] **Test Browser Console**
  - [ ] Open browser DevTools (F12)
  - [ ] Go to Console tab
  - [ ] Should NOT see error messages
  - [ ] Should see success logs

- [ ] **Verify Zoom Dashboard**
  - [ ] Go to https://zoom.us
  - [ ] Login to your Zoom account
  - [ ] Check "My Meetings"
  - [ ] Your test meeting should appear there!

## ✅ Post-Deployment

- [ ] **Update Documentation**
  - [ ] Note your Supabase Project URL
  - [ ] Note your Zoom Client ID
  - [ ] Save credentials securely

- [ ] **Team Communication**
  - [ ] Notify team that Zoom is deployed
  - [ ] Share `SUPABASE_ZOOM_SETUP.md` for reference
  - [ ] Provide link to Zoom OAuth setup instructions

- [ ] **Production Preparation** (if deploying to production)
  - [ ] [ ] Review RLS policies in `supabase-zoom-schema.sql`
  - [ ] [ ] Update RLS for production security
  - [ ] [ ] Set up encrypted token storage
  - [ ] [ ] Configure CORS if needed
  - [ ] [ ] Set up monitoring/alerts
  - [ ] [ ] Create backup strategy

## 🆘 Troubleshooting During Deployment

### If Database Schema Fails
```bash
# Check error message in Supabase
# Common issues:
# - Extension not enabled: CREATE EXTENSION ... already exists
# - Table already exists: DROP TABLE IF EXISTS first

# Solution: Run again, RLS constraints don't block schema creation
```

### If Secrets Not Found
```bash
# Verify in Supabase Dashboard → Settings → Secrets
# Make sure values are not empty
# Try deploying functions again
```

### If Functions Won't Deploy
```bash
# Check login status
supabase projects list

# Check project link
supabase projects list

# Redeploy specific function
supabase functions deploy zoom-utils --no-verify-jwt
```

### If Frontend Can't Connect
```bash
# Check .env variables exist
# Check Supabase URL is correct
# Check ANON key is not empty
# Check browser console for errors (F12)
```

### If OAuth Redirect Fails
```bash
# Verify redirect URI in Zoom app settings
# Should be: https://your-supabase-url/functions/v1/zoom-oauth-callback
# Check no trailing spaces
# Check HTTPS (not HTTP)
```

## 📊 Success Criteria

When deployment is complete, you should be able to:

✅ Connect instructor Zoom account in 30 seconds
✅ Create Zoom meeting from course dashboard
✅ See meeting automatically created in Zoom account
✅ Access meeting with join URL
✅ View meeting record in database
✅ Share meeting with students

## 🎉 Completion

When all checkboxes are complete:

- [ ] Database: ✅ 6 tables created
- [ ] Secrets: ✅ ZOOM credentials stored
- [ ] Functions: ✅ 3 functions deployed
- [ ] Environment: ✅ .env configured
- [ ] Testing: ✅ OAuth and meeting creation working
- [ ] Verification: ✅ Database shows new records
- [ ] Documentation: ✅ Team informed

**Deployment Status**: 🟢 COMPLETE

---

## Quick Reference

| Task | Time | Command/Action |
|------|------|---|
| Deploy Schema | 2 min | Copy `supabase-zoom-schema.sql` to SQL Editor |
| Add Secrets | 1 min | Supabase → Settings → Secrets (2 new secrets) |
| Deploy Functions | 3 min | `supabase functions deploy zoom-*` |
| Configure Env | 1 min | Update `.env` file |
| Test | 5 min | `npm run dev` and test in browser |
| **TOTAL** | **12 min** | Complete deployment |

---

**Last Updated**: December 4, 2025
**Estimated Total Time**: 12-15 minutes
**Difficulty Level**: Beginner-Friendly
