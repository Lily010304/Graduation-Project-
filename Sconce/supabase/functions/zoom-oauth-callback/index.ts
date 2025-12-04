import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as zoomUtils from "../zoom-utils/index.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Handle Zoom OAuth callback
 * GET /functions/v1/zoom-oauth-callback?code=xxx&state=yyy
 */

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info, prefer",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const instructorId = url.searchParams.get("instructor_id");

    if (!code || !state || !instructorId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate state (CSRF protection)
    // In production, validate this against stored state in cache/database
    // For now, we'll skip this validation

    // Exchange code for token
    const result = await zoomUtils.exchangeZoomCode(code, instructorId);

    // Redirect back to frontend with success
    const frontendUrl = new URL(supabaseUrl).origin;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/#/dashboard/instructor?zoom=connected&email=${encodeURIComponent(result.email)}`,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);

    // Redirect back with error
    const frontendUrl = new URL(supabaseUrl).origin;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/#/dashboard/instructor?zoom=error&message=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`,
        ...corsHeaders,
      },
    });
  }
});
