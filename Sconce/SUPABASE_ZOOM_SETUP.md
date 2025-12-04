# Supabase Zoom Implementation Guide

## Overview

This implementation moves Zoom functionality from ASP.NET Core backend to **Supabase** using:
- **PostgreSQL Tables** for data storage (instructor auth, meetings, participants, recordings)
- **Edge Functions (Deno)** for serverless API logic (OAuth, meeting creation, webhooks)
- **Row Level Security (RLS)** for data access control

---

## Architecture

```
Frontend (React)
    ↓
Supabase Client (SDK)
    ↓
Supabase Edge Functions (Deno)
    ↓ (via REST API)
Zoom API
    ↓
Database (PostgreSQL)
```

---

## Step 1: Deploy Database Schema

### 1.1 Run SQL Migration

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `supabase-zoom-schema.sql`
4. Execute

This creates 6 tables:
- `instructor_zoom_auth` - OAuth tokens
- `zoom_meetings` - Meeting records
- `zoom_meeting_participants` - Attendance
- `zoom_meeting_recordings` - Recording metadata
- `zoom_webhook_logs` - Webhook logs
- `zoom_sync_logs` - Sync tracking

### 1.2 Verify Tables

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname='public' 
ORDER BY tablename;
```

You should see all 6 zoom tables.

---

## Step 2: Configure Supabase Secrets

Add Zoom credentials to Supabase:

1. Go to Supabase Dashboard → Settings → Secrets
2. Add these secrets:

```
ZOOM_CLIENT_ID=your_zoom_client_id_here
ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
```

**Where to get these:**
- Go to https://marketplace.zoom.us/
- Develop → Build App → OAuth (select this type)
- App name: Sconce LMS
- Copy Client ID and Client Secret from app credentials

---

## Step 3: Deploy Edge Functions

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
supabase link --project-ref your_project_ref
```

Find your project ref in Supabase Dashboard → Settings → General

### 3.4 Deploy Functions

From your Sconce project directory:

```bash
# Deploy all zoom functions
supabase functions deploy zoom-utils
supabase functions deploy zoom-oauth-callback
supabase functions deploy zoom-meetings
```

### 3.5 Verify Deployment

```bash
supabase functions list
```

You should see all three functions listed.

---

## Step 4: Update Environment Variables

Add to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ZOOM_CLIENT_ID=your_zoom_client_id
```

Get these from Supabase Dashboard → Settings → API

---

## Step 5: Test in Frontend

### 5.1 Connect Zoom Account

1. Start frontend: `npm run dev`
2. Login as instructor
3. Dashboard → Add Content → Zoom Meeting
4. Click "Connect Zoom Account"
5. Should redirect to Zoom OAuth page
6. Approve and return to dashboard

### 5.2 Create Meeting

After connecting:

1. Click "Add Content" → Zoom Meeting
2. Fill form:
   - Topic: "Test Meeting"
   - Start Time: Tomorrow at 2 PM
   - Duration: 60 min
   - Password: test123
3. Click "Create Meeting"
4. Should create in your Zoom account

### 5.3 View in Database

Check Supabase:

```sql
SELECT * FROM zoom_meetings ORDER BY created_at DESC LIMIT 1;
```

---

## Database Schema Details

### instructor_zoom_auth

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| instructor_id | TEXT | Unique per instructor |
| zoom_user_id | TEXT | Zoom's user ID |
| zoom_email | VARCHAR | Instructor's Zoom email |
| access_token | TEXT | OAuth access token |
| refresh_token | TEXT | OAuth refresh token |
| token_expiry | TIMESTAMP | When token expires |
| connection_status | VARCHAR | 'active', 'disconnected', 'expired' |

### zoom_meetings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Sconce's meeting ID |
| zoom_meeting_id | BIGINT | Zoom's meeting ID |
| course_id | TEXT | Link to course |
| instructor_id | TEXT | Who created it |
| topic | VARCHAR | Meeting title |
| start_time | TIMESTAMP | When it starts |
| duration | INTEGER | In minutes |
| join_url | TEXT | Link to join |
| password | VARCHAR | Meeting password |
| status | VARCHAR | 'scheduled', 'in_progress', 'ended', 'cancelled' |

### zoom_meeting_participants

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| meeting_id | UUID | References zoom_meetings |
| user_id | TEXT | Student or instructor |
| join_time | TIMESTAMP | When they joined |
| leave_time | TIMESTAMP | When they left |
| duration_minutes | INTEGER | Time spent |

### zoom_meeting_recordings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| meeting_id | UUID | References zoom_meetings |
| zoom_recording_id | TEXT | Zoom's recording ID |
| download_url | TEXT | Download recording |
| play_url | TEXT | Watch recording |
| is_shared | BOOLEAN | Share with students |

---

## API Endpoints (Edge Functions)

### Create Meeting

**Function**: `zoom-meetings`

```javascript
POST /functions/v1/zoom-meetings
Content-Type: application/json
Authorization: Bearer {token}

{
  "action": "create",
  "instructorId": "instructor-123",
  "topic": "Week 1: Introduction",
  "startTime": "2025-12-10T14:00:00Z",
  "duration": 60,
  "timezone": "UTC",
  "password": "test123",
  "waitingRoom": true,
  "joinBeforeHost": false,
  "muteUponEntry": true,
  "courseId": "course-1",
  "weekId": "week-1"
}
```

**Response**:
```json
{
  "success": true,
  "meeting": {
    "id": "uuid-123",
    "meetingId": 123456789,
    "topic": "Week 1: Introduction",
    "joinUrl": "https://zoom.us/j/123456789?pwd=...",
    "startTime": "2025-12-10T14:00:00Z",
    "duration": 60
  }
}
```

### Get Connection Status

```javascript
POST /functions/v1/zoom-meetings
{
  "action": "status",
  "instructorId": "instructor-123"
}
```

**Response**:
```json
{
  "connected": true,
  "email": "instructor@example.com",
  "connectedAt": "2025-12-04T10:00:00Z"
}
```

### Delete Meeting

```javascript
POST /functions/v1/zoom-meetings
{
  "action": "delete",
  "instructorId": "instructor-123",
  "meetingId": "uuid-123"
}
```

### Disconnect Zoom

```javascript
POST /functions/v1/zoom-meetings
{
  "action": "disconnect",
  "instructorId": "instructor-123"
}
```

---

## Security

### Token Encryption

In production, encrypt OAuth tokens:

```sql
-- Example: Install pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted token
UPDATE instructor_zoom_auth 
SET access_token = pgp_sym_encrypt(access_token, 'your-secret-key')
WHERE id = 'uuid';
```

### Row Level Security

Current RLS allows all (for development). In production:

```sql
-- Only instructor can access their own auth
CREATE POLICY "Instructors see own Zoom auth" ON instructor_zoom_auth
  FOR SELECT USING (
    auth.uid()::text = instructor_id
  );

-- Only instructor can access their meetings
CREATE POLICY "Instructors see own meetings" ON zoom_meetings
  FOR SELECT USING (
    auth.uid()::text = instructor_id OR
    course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid()::text)
  );
```

### CSRF Protection

The OAuth callback validates state parameter to prevent CSRF attacks.

---

## Troubleshooting

### Issue: "Function not found"

**Solution**: Verify deployment

```bash
supabase functions list
supabase functions describe zoom-meetings
```

### Issue: "Invalid Zoom credentials"

**Solution**: Check secrets

```bash
supabase secrets list
```

Ensure ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET are set.

### Issue: "Token refresh failed"

**Solution**: Check logs

```bash
supabase functions logs zoom-meetings --tail
```

### Issue: "Database connection error"

**Solution**: Verify RLS policies

```sql
SELECT * FROM pg_policies WHERE tablename='zoom_meetings';
```

---

## Next Steps

### 1. Add Webhook Handler

Create function to receive meeting events from Zoom:

```bash
supabase functions deploy zoom-webhooks
```

This can update meeting status, track recordings, log participants.

### 2. Add Attendance Tracking

When students join a meeting, log in `zoom_meeting_participants`:

```javascript
// In webhook handler
INSERT INTO zoom_meeting_participants (
  meeting_id, user_id, user_email, join_time
) VALUES (...);
```

### 3. Add Recording Management

When recording completes, Zoom webhook triggers:

```javascript
INSERT INTO zoom_meeting_recordings (
  meeting_id, zoom_recording_id, play_url, download_url
) VALUES (...);

// Share with students
UPDATE zoom_meeting_recordings 
SET share_with_students = true
WHERE meeting_id = $1;
```

### 4. Add Analytics

Query attendance and participation:

```sql
SELECT 
  m.topic,
  COUNT(p.id) as participants,
  AVG(p.duration_minutes) as avg_duration
FROM zoom_meetings m
LEFT JOIN zoom_meeting_participants p ON m.id = p.meeting_id
GROUP BY m.id;
```

---

## Deployment Checklist

- [ ] Run `supabase-zoom-schema.sql` in SQL Editor
- [ ] Set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in Secrets
- [ ] Deploy Edge Functions with `supabase functions deploy`
- [ ] Update `.env` with VITE_ variables
- [ ] Test OAuth flow in frontend
- [ ] Test meeting creation
- [ ] Verify database records created
- [ ] Check function logs for errors
- [ ] Update RLS policies for production
- [ ] Add webhook handler for Zoom events

---

**Last Updated**: December 4, 2025

**Questions?** Check Supabase docs: https://supabase.com/docs
