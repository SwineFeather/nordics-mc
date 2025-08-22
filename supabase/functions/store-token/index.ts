
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use secure defaults
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://www.nordics.world',
  'https://nordics.world',
  'http://localhost:3000',
  'http://localhost:24532',
  'http://localhost:8080'
];

// More permissive CORS handling for development and testing
function getCorsHeaders(origin: string | null, req: Request) {
  const userAgent = req.headers.get('User-Agent') || '';
  const isMinecraftRequest = userAgent.includes('Minecraft') || userAgent.includes('TokenLink') || userAgent.includes('Java');
  
  // Log request details for debugging
  console.log('Request details:', {
    origin,
    userAgent,
    isMinecraftRequest,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Allow all origins for Minecraft/TokenLink requests in development
  if (Deno.env.get('NODE_ENV') === 'development' || Deno.env.get('SUPABASE_ENV') === 'development') {
    console.log('Development mode: allowing all origins');
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Credentials': 'false',
    };
  }

  // For production, be more permissive with Minecraft requests
  if (isMinecraftRequest) {
    console.log('Minecraft/TokenLink request detected: allowing origin');
    return {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Credentials': 'false',
    };
  }

  // Standard CORS for web requests
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  // Default fallback
  return {
    'Access-Control-Allow-Origin': allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Credentials': 'false',
  };
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin, req);
    console.log('CORS preflight request handled with headers:', corsHeaders);
    
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    console.log('Store-token request received from:', origin);
    console.log('User-Agent:', req.headers.get('User-Agent'));
    console.log('Authorization header:', req.headers.get('Authorization'));
    console.log('API key header:', req.headers.get('apikey'));
    
    // Check if this is a TokenLink/Minecraft request that should bypass auth
    const userAgent = req.headers.get('User-Agent') || '';
    const isMinecraftRequest = userAgent.includes('Minecraft') || userAgent.includes('TokenLink') || userAgent.includes('Java');
    
    // For Minecraft/TokenLink requests, we'll allow them without auth
    if (isMinecraftRequest) {
      console.log('Minecraft/TokenLink request detected - bypassing auth check');
    } else {
      // For other requests, check for proper authentication
      const authHeader = req.headers.get('Authorization');
      const apiKey = req.headers.get('apikey');
      
      if (!authHeader && !apiKey) {
        console.warn('Request missing authentication headers');
        const corsHeaders = getCorsHeaders(origin, req);
        return new Response(JSON.stringify({ error: "Missing authorization header" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      const corsHeaders = getCorsHeaders(origin, req);
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
      const corsHeaders = getCorsHeaders(origin, req);
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
      const corsHeaders = getCorsHeaders(origin, req);
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Creating/updating player profile for:', player_name);
    
    // Check if player exists in our players table
    const { data: existingPlayer, error: playerCheckError } = await supabase
      .from("players")
      .select("uuid, name")
      .eq("uuid", player_uuid)
      .single();

    if (playerCheckError && playerCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing player:", playerCheckError);
      const corsHeaders = getCorsHeaders(origin, req);
      return new Response(JSON.stringify({ error: "Database error checking player" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!existingPlayer) {
      console.log('Creating new player entry for:', player_name);
      // Create new player entry in players table
      const { error: playerCreateError } = await supabase
        .from("players")
        .insert({ 
          uuid: player_uuid,
          name: player_name,
          level: 1,
          total_xp: 0,
          last_seen: Math.floor(Date.now() / 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (playerCreateError) {
        console.error("Error creating player:", playerCreateError);
        const corsHeaders = getCorsHeaders(origin, req);
        return new Response(JSON.stringify({ error: "Failed to create player profile" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log('Updating existing player:', player_name);
      // Update existing player's last seen info
      const { error: updateError } = await supabase
        .from("players")
        .update({ 
          name: player_name, // Update name in case it changed
          last_seen: Math.floor(Date.now() / 1000),
          updated_at: new Date().toISOString()
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
      .insert({ 
        player_uuid, 
        player_name, 
        token, 
        expires_at: parseInt(expires_at.toString()) // Ensure it's a number
      });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      const corsHeaders = getCorsHeaders(origin, req);
      return new Response(JSON.stringify({ error: "Failed to store login token", details: tokenError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Successfully stored token for:', player_name);
    
    const corsHeaders = getCorsHeaders(origin, req);
    return new Response(JSON.stringify({ success: true, message: "Login token stored successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Store token error:", e);
    const corsHeaders = getCorsHeaders(origin, req);
    return new Response(JSON.stringify({ error: "Internal server error", details: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
