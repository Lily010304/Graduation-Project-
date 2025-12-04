import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as zoomUtils from "../zoom-utils/index.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Zoom Meeting Management API
 * Handles: create meeting, delete meeting, get status
 */

// CORS headers for preflight and regular requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info, prefer",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract instructor ID from JWT or session
    // For now, we'll expect it in the request body
    const body = await req.json();
    const instructorId = body.instructorId;

    if (!instructorId) {
      return new Response(
        JSON.stringify({ error: "Missing instructor ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const method = req.method;
    const action = body.action; // Route based on action in body, not pathname

    // Route handlers based on action
    if (action === "create") {
      // Create meeting
      const result = await zoomUtils.createZoomMeeting(instructorId, {
        topic: body.topic,
        startTime: body.startTime,
        duration: body.duration || 60,
        timezone: body.timezone || "UTC",
        password: body.password,
        waitingRoom: body.waitingRoom ?? true,
        joinBeforeHost: body.joinBeforeHost ?? false,
        muteUponEntry: body.muteUponEntry ?? true,
        description: body.description,
        courseId: body.courseId,
        weekId: body.weekId,
        contentItemId: body.contentItemId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (action === "delete") {
      // Delete meeting
      const meetingId = body.meetingId;
      if (!meetingId) {
        return new Response(
          JSON.stringify({ error: "Missing meeting ID" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const result = await zoomUtils.deleteZoomMeeting(instructorId, meetingId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (action === "status") {
      // Get connection status
      const result = await zoomUtils.getZoomStatus(instructorId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (action === "disconnect") {
      // Disconnect Zoom account
      const result = await zoomUtils.disconnectZoom(instructorId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
