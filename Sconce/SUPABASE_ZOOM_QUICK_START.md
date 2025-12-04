# Supabase Zoom Backend Setup - Quick Start

## ✅ Prerequisites
- Supabase account with project created
- Zoom app created (OAuth type)
- Supabase CLI installed: `npm install -g supabase`

## 🚀 Quick Setup (5 Steps)

### Step 1️⃣: Deploy Database (2 mins)
```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Create new query
# 3. Copy entire content of: supabase-zoom-schema.sql
# 4. Run it
# 5. Verify all 6 tables created
```

**Tables created**:
- `instructor_zoom_auth` - OAuth tokens
- `zoom_meetings` - Meeting records  
- `zoom_meeting_participants` - Attendance
- `zoom_meeting_recordings` - Recordings
- `zoom_webhook_logs` - Webhook logs
- `zoom_sync_logs` - Sync tracking

### Step 2️⃣: Add Secrets (1 min)
```bash
# Go to Supabase Dashboard → Settings → Secrets
# Add these 2 secrets:

ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

**Get credentials from**:
- https://marketplace.zoom.us/
- Develop → Build App → OAuth
- Copy Client ID and Client Secret

### Step 3️⃣: Deploy Edge Functions (2 mins)
```bash
# Login (first time only)
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy zoom-utils
supabase functions deploy zoom-oauth-callback
supabase functions deploy zoom-meetings

# Verify
supabase functions list
```

### Step 4️⃣: Update Environment (1 min)
Add to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ZOOM_CLIENT_ID=your_zoom_client_id
```

Get values from: Supabase Dashboard → Settings → API

### Step 5️⃣: Test in Frontend (2 mins)
```bash
npm run dev
```

1. Login as instructor
2. Dashboard → Add Content → Zoom Meeting
3. Click "Connect Zoom Account"
4. Should redirect to Zoom
5. Approve and return to dashboard
6. Create test meeting

## 📊 Verify Setup

### Check Database
```sql
SELECT count(*) as table_count 
FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name LIKE 'zoom_%';
-- Should return: 6
```

### Check Secrets
```bash
supabase secrets list
# Should show ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET
```

### Check Functions
```bash
supabase functions list
# Should show 3 functions:
# - zoom-utils
# - zoom-oauth-callback  
# - zoom-meetings
```

### Check Frontend
1. Open browser console (F12)
2. Check for Zoom connection errors
3. Should see meeting creation response

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Function not found" | Run `supabase functions deploy` again |
| "Invalid credentials" | Check ZOOM_CLIENT_ID and CLIENT_SECRET in Secrets |
| "Token refresh failed" | Check function logs: `supabase functions logs zoom-meetings --tail` |
| "Database error" | Verify RLS policies enabled for all tables |
| OAuth redirect fails | Check redirect URI matches Zoom app settings |

## 📁 Files Created/Modified

**New files**:
- ✅ `supabase-zoom-schema.sql` - Database schema
- ✅ `supabase/functions/zoom-utils/index.ts` - Core functions
- ✅ `supabase/functions/zoom-oauth-callback/index.ts` - OAuth handler
- ✅ `supabase/functions/zoom-meetings/index.ts` - API router
- ✅ `SUPABASE_ZOOM_SETUP.md` - Full documentation

**Updated files**:
- ✅ `src/lib/api.js` - Updated Zoom functions to use Supabase
- ✅ `src/components/instructor/ZoomAccountConnect.jsx` - OAuth connection UI
- ✅ `src/components/instructor/ZoomMeetingDialog.jsx` - Meeting creation UI

## 🔗 Resources

- Supabase Docs: https://supabase.com/docs
- Zoom OAuth: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
- Edge Functions: https://supabase.com/docs/guides/functions
- Full Setup Guide: See `SUPABASE_ZOOM_SETUP.md`

## 💡 Next Steps (Optional)

1. **Add Webhook Handler** - Receive Zoom events
2. **Add Attendance Tracking** - Log who joined meetings
3. **Add Recording Management** - Share recordings with students
4. **Add Analytics** - Track participation data
5. **Add RLS Policies** - Proper security for production

---

**Estimated Total Time**: 10-15 minutes
**Questions?** See `SUPABASE_ZOOM_SETUP.md` for detailed guide
