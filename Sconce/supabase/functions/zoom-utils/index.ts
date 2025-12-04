import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const zoomClientId = Deno.env.get("ZOOM_CLIENT_ID") || "";
const zoomClientSecret = Deno.env.get("ZOOM_CLIENT_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Exchange Zoom OAuth authorization code for access token
 * Called after instructor authorizes in Zoom OAuth page
 */
export async function exchangeZoomCode(code: string, instructorId: string) {
  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${zoomClientId}:${zoomClientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/zoom-oauth-callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange code: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Get Zoom user info
    const userResponse = await fetch("https://api.zoom.us/v2/users/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // Save to database
    const { error } = await supabase.from("instructor_zoom_auth").upsert({
      instructor_id: instructorId,
      zoom_user_id: userData.id,
      zoom_email: userData.email,
      zoom_first_name: userData.first_name,
      zoom_last_name: userData.last_name,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      token_scope: tokenData.scope,
      connection_status: "active",
      last_token_refresh: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true, email: userData.email };
  } catch (error) {
    console.error("Error exchanging Zoom code:", error);
    throw error;
  }
}

/**
 * Refresh instructor's Zoom access token if expired
 */
export async function refreshZoomToken(instructorId: string) {
  try {
    // Get current token
    const { data: auth, error: fetchError } = await supabase
      .from("instructor_zoom_auth")
      .select("*")
      .eq("instructor_id", instructorId)
      .single();

    if (fetchError) throw new Error("Instructor Zoom auth not found");

    // Check if token needs refresh
    if (new Date(auth.token_expiry) > new Date()) {
      return auth.access_token; // Token still valid
    }

    // Refresh token
    const refreshResponse = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${zoomClientId}:${zoomClientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: auth.refresh_token,
      }).toString(),
    });

    if (!refreshResponse.ok) {
      throw new Error(`Failed to refresh token: ${refreshResponse.statusText}`);
    }

    const tokenData = await refreshResponse.json();

    // Update database
    const { error: updateError } = await supabase
      .from("instructor_zoom_auth")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        last_token_refresh: new Date().toISOString(),
      })
      .eq("instructor_id", instructorId);

    if (updateError) throw updateError;

    return tokenData.access_token;
  } catch (error) {
    console.error("Error refreshing Zoom token:", error);
    throw error;
  }
}

/**
 * Create a Zoom meeting for an instructor
 */
export async function createZoomMeeting(
  instructorId: string,
  meetingData: {
    topic: string;
    startTime: string;
    duration: number;
    timezone: string;
    password?: string;
    waitingRoom?: boolean;
    joinBeforeHost?: boolean;
    muteUponEntry?: boolean;
    description?: string;
    courseId?: string;
    weekId?: string;
    contentItemId?: string;
  }
) {
  try {
    // Get and refresh token if needed
    const accessToken = await refreshZoomToken(instructorId);

    // Create meeting via Zoom API
    const createResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: meetingData.topic,
        type: 2, // Scheduled meeting
        start_time: meetingData.startTime,
        duration: meetingData.duration,
        timezone: meetingData.timezone,
        password: meetingData.password,
        settings: {
          waiting_room: meetingData.waitingRoom ?? true,
          join_before_host: meetingData.joinBeforeHost ?? false,
          mute_upon_entry: meetingData.muteUponEntry ?? true,
          host_video: true,
          participant_video: false,
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create meeting: ${createResponse.statusText}`);
    }

    const meeting = await createResponse.json();

    // Save to Sconce database
    const { data: savedMeeting, error: saveError } = await supabase
      .from("zoom_meetings")
      .insert({
        zoom_meeting_id: meeting.id,
        course_id: meetingData.courseId,
        instructor_id: instructorId,
        week_id: meetingData.weekId,
        content_item_id: meetingData.contentItemId,
        topic: meeting.topic,
        description: meetingData.description,
        start_time: meeting.start_time,
        duration: meeting.duration,
        timezone: meeting.timezone,
        password: meeting.password,
        join_url: meeting.join_url,
        waiting_room: meetingData.waitingRoom ?? true,
        join_before_host: meetingData.joinBeforeHost ?? false,
        mute_upon_entry: meetingData.muteUponEntry ?? true,
        status: "scheduled",
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return {
      success: true,
      meeting: {
        id: savedMeeting.id,
        meetingId: meeting.id,
        topic: meeting.topic,
        startTime: meeting.start_time,
        duration: meeting.duration,
        joinUrl: meeting.join_url,
        password: meeting.password,
      },
    };
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    throw error;
  }
}

/**
 * Cancel/delete a Zoom meeting
 */
export async function deleteZoomMeeting(instructorId: string, meetingId: string) {
  try {
    // Get meeting from database
    const { data: meeting, error: fetchError } = await supabase
      .from("zoom_meetings")
      .select("*")
      .eq("id", meetingId)
      .eq("instructor_id", instructorId)
      .single();

    if (fetchError) throw new Error("Meeting not found or unauthorized");

    // Get and refresh token
    const accessToken = await refreshZoomToken(instructorId);

    // Delete from Zoom
    const deleteResponse = await fetch(
      `https://api.zoom.us/v2/meetings/${meeting.zoom_meeting_id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete meeting: ${deleteResponse.statusText}`);
    }

    // Soft delete from database
    const { error: updateError } = await supabase
      .from("zoom_meetings")
      .update({
        status: "cancelled",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", meetingId);

    if (updateError) throw updateError;

    return { success: true, message: "Meeting cancelled" };
  } catch (error) {
    console.error("Error deleting Zoom meeting:", error);
    throw error;
  }
}

/**
 * Get instructor's Zoom connection status
 */
export async function getZoomStatus(instructorId: string) {
  try {
    const { data, error } = await supabase
      .from("instructor_zoom_auth")
      .select("zoom_email, connection_status, connected_at")
      .eq("instructor_id", instructorId)
      .single();

    if (error) {
      return { connected: false };
    }

    return {
      connected: data.connection_status === "active",
      email: data.zoom_email,
      connectedAt: data.connected_at,
    };
  } catch (error) {
    console.error("Error getting Zoom status:", error);
    return { connected: false };
  }
}

/**
 * Disconnect instructor's Zoom account
 */
export async function disconnectZoom(instructorId: string) {
  try {
    const { error } = await supabase
      .from("instructor_zoom_auth")
      .delete()
      .eq("instructor_id", instructorId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting Zoom:", error);
    throw error;
  }
}
