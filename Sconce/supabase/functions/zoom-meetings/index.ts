import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as zoomUtils from "../zoom-utils/index.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Zoom Meeting Management API
 * Handles: create meeting, delete meeting, get status
 */
Deno.serve(async (req) => {
  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract instructor ID from JWT or session
    // For now, we'll expect it in the request body
    const body = await req.json();
    const instructorId = body.instructorId;

    if (!instructorId) {
      return new Response(
        JSON.stringify({ error: "Missing instructor ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const method = req.method;
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route handlers
    if (method === "POST" && pathname.includes("create")) {
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
        headers: { "Content-Type": "application/json" },
      });
    } else if (method === "DELETE" && pathname.includes("delete")) {
      // Delete meeting
      const meetingId = body.meetingId;
      if (!meetingId) {
        return new Response(
          JSON.stringify({ error: "Missing meeting ID" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await zoomUtils.deleteZoomMeeting(instructorId, meetingId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (method === "GET" && pathname.includes("status")) {
      // Get connection status
      const result = await zoomUtils.getZoomStatus(instructorId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (method === "DELETE" && pathname.includes("disconnect")) {
      // Disconnect Zoom account
      const result = await zoomUtils.disconnectZoom(instructorId);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
