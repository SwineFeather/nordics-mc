
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Store-token request received');
    
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request data received:', { 
        player_uuid: requestData?.player_uuid, 
        player_name: requestData?.player_name,
        token: requestData?.token ? 'present' : 'missing',
        expires_at: requestData?.expires_at
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { player_uuid, player_name, token, expires_at } = requestData;
    
    if (!player_uuid || !player_name || !token || !expires_at) {
      console.error('Missing required fields:', {
        player_uuid: !!player_uuid,
        player_name: !!player_name,
        token: !!token,
        expires_at: !!expires_at
      });
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Creating/updating player profile for:', player_name);
    
    // Check if player exists in our players table
    const { data: existingPlayer, error: playerCheckError } = await supabase
      .from("players")
      .select("uuid, username")
      .eq("uuid", player_uuid)
      .single();

    if (playerCheckError && playerCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing player:", playerCheckError);
      return new Response(JSON.stringify({ error: "Database error checking player" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!existingPlayer) {
      console.log('Creating new player entry for:', player_name);
      // Create new player entry
      const { error: playerCreateError } = await supabase
        .from("players")
        .insert({ 
          uuid: player_uuid, 
          username: player_name,
          first_joined: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          is_online: true
        });

      if (playerCreateError) {
        console.error("Error creating player:", playerCreateError);
        return new Response(JSON.stringify({ error: "Failed to create player profile" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log('Updating existing player:', player_name);
      // Update existing player's last seen and online status
      const { error: updateError } = await supabase
        .from("players")
        .update({ 
          last_seen: new Date().toISOString(),
          username: player_name, // Update name in case it changed
          is_online: true
        })
        .eq("uuid", player_uuid);

      if (updateError) {
        console.error("Error updating player:", updateError);
      }
    }

    console.log('Storing login token for:', player_name);
    
    // Store the login token
    const { error: tokenError } = await supabase
      .from("login_tokens")
      .insert({ player_uuid, player_name, token, expires_at });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      return new Response(JSON.stringify({ error: "Failed to store login token", details: tokenError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Successfully stored token for:', player_name);
    
    return new Response(JSON.stringify({ success: true, message: "Login token stored successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Store token error:", e);
    return new Response(JSON.stringify({ error: "Internal server error", details: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
