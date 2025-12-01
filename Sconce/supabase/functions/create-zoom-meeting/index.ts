import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ZoomMeetingRequest {
  topic: string
  startTime: string
  duration: number
  timezone?: string
  password?: string
  waitingRoom?: boolean
  joinBeforeHost?: boolean
  muteUponEntry?: boolean
  description?: string
}

interface ZoomTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface ZoomMeetingResponse {
  id: number
  topic: string
  start_time: string
  duration: number
  timezone: string
  join_url: string
  password?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Zoom credentials from environment
    const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID')
    const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID')
    const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET')

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      throw new Error('Zoom API credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in your Supabase Edge Function secrets.')
    }

    // Parse request body
    const meetingData: ZoomMeetingRequest = await req.json()

    if (!meetingData.topic || !meetingData.startTime || !meetingData.duration) {
      throw new Error('Missing required fields: topic, startTime, duration')
    }

    console.log('Creating Zoom meeting:', meetingData.topic)

    // Step 1: Get OAuth access token using Server-to-Server OAuth
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`
    const authHeader = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Zoom OAuth error:', errorText)
      throw new Error(`Failed to get Zoom access token: ${tokenResponse.status}`)
    }

    const tokenData: ZoomTokenResponse = await tokenResponse.json()
    console.log('Successfully obtained Zoom access token')

    // Step 2: Create meeting using the access token
    // Note: You'll need to get the user ID from Zoom API or use 'me' if creating as the OAuth app owner
    const createMeetingUrl = 'https://api.zoom.us/v2/users/me/meetings'

    const meetingPayload = {
      topic: meetingData.topic,
      type: 2, // Scheduled meeting
      start_time: meetingData.startTime,
      duration: meetingData.duration,
      timezone: meetingData.timezone || 'UTC',
      agenda: meetingData.description || '',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: meetingData.joinBeforeHost || false,
        mute_upon_entry: meetingData.muteUponEntry !== false, // Default true
        waiting_room: meetingData.waitingRoom !== false, // Default true
        approval_type: 2, // No registration required
        audio: 'both',
        auto_recording: 'none',
      },
      password: meetingData.password || undefined,
    }

    const createResponse = await fetch(createMeetingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingPayload),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Zoom meeting creation error:', errorText)
      throw new Error(`Failed to create Zoom meeting: ${createResponse.status} ${errorText}`)
    }

    const meeting: ZoomMeetingResponse = await createResponse.json()
    console.log('Successfully created Zoom meeting:', meeting.id)

    // Return meeting details
    return new Response(
      JSON.stringify({
        success: true,
        meeting: {
          id: meeting.id,
          topic: meeting.topic,
          startTime: meeting.start_time,
          duration: meeting.duration,
          timezone: meeting.timezone,
          joinUrl: meeting.join_url,
          meetingId: meeting.id.toString(),
          password: meeting.password || meetingData.password,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-zoom-meeting function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
