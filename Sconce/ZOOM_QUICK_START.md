# Zoom Integration - Quick Start

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Create Zoom App (5 minutes)
1. Go to https://marketplace.zoom.us/
2. Develop → Build App → Server-to-Server OAuth
3. Copy: Account ID, Client ID, Client Secret

### 2️⃣ Configure Supabase Secrets (2 minutes)
```bash
supabase secrets set ZOOM_ACCOUNT_ID=your_account_id
supabase secrets set ZOOM_CLIENT_ID=your_client_id
supabase secrets set ZOOM_CLIENT_SECRET=your_client_secret
```

### 3️⃣ Deploy Edge Function (1 minute)
```bash
cd "d:\Graduation Project\Sconce"
supabase functions deploy create-zoom-meeting
```

## ✅ Test It

1. Run: `npm run dev`
2. Instructor Dashboard → Course → Week → "+ Add Content" → "Zoom Meeting"
3. Fill form → Click "Create Meeting"

## 🔧 Files Created

- `supabase/functions/create-zoom-meeting/index.ts` - API handler
- `src/components/instructor/ZoomMeetingDialog.jsx` - Updated with API calls
- `ZOOM_INTEGRATION_GUIDE.md` - Full documentation

## 📝 Commands Cheat Sheet

```bash
# Deploy function
supabase functions deploy create-zoom-meeting

# View logs
supabase functions logs create-zoom-meeting --tail

# List secrets
supabase secrets list

# Test locally (requires Deno)
supabase functions serve create-zoom-meeting
```

## 🎯 What's Next?

The integration is ready to use! Just need to:
1. Set up your Zoom app (Step 1 above)
2. Add secrets to Supabase (Step 2 above)
3. Deploy the function (Step 3 above)

See `ZOOM_INTEGRATION_GUIDE.md` for detailed troubleshooting and production setup.
