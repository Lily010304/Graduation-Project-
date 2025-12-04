import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const zoomClientId = Deno.env.get("ZOOM_CLIENT_ID") || "";
const zoomClientSecret = Deno.env.get("ZOOM_CLIENT_SECRET") || "";

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
    // Parse query parameters from Zoom callback
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: "Missing code or state from Zoom" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get instructor ID from the state session
    const { data: stateSession, error: stateError } = await supabase
      .from("zoom_oauth_sessions")
      .select("instructor_id")
      .eq("state", state)
      .single();

    if (stateError || !stateSession) {
      console.error("State validation failed:", stateError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired state" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const instructorId = stateSession.instructor_id;

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
        redirect_uri: `${supabaseUrl}/functions/v1/zoom-oauth-callback`,
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
    const { error: saveError } = await supabase.from("instructor_zoom_auth").upsert({
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

    if (saveError) throw saveError;

    // Delete the temporary session
    await supabase
      .from("zoom_oauth_sessions")
      .delete()
      .eq("state", state);

    const result = { success: true, email: userData.email };

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
