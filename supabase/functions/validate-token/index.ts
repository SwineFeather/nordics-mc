import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use secure defaults
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://www.nordics.world',
  'https://nordics.world'
];

// Validate origin function with additional security checks
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) return true;
  
  // Additional security: check for localhost only in development
  if (Deno.env.get('NODE_ENV') === 'development') {
    return origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:');
  }
  
  return false;
}

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    
    if (!isValidOrigin(origin)) {
      return new Response(null, { 
        status: 403,
        headers: corsHeaders(null)
      });
    }

    return new Response(null, { 
      status: 200,
      headers: corsHeaders(origin)
    });
  }

  try {
    // Validate origin for all requests
    const origin = req.headers.get('Origin');
    if (!isValidOrigin(origin)) {
      console.warn(`Blocked request from unauthorized origin: ${origin}`);
      return new Response(
        JSON.stringify({ error: 'Origin not allowed' }),
        {
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders(null)
          },
        }
      )
    }

    console.log('Validate-token request received');
    
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const createSession = url.searchParams.get("create_session") === "true";
    
    console.log('Token validation requested:', { 
      token: token ? 'token present' : 'no token',
      createSession 
    });
    
    if (!token) {
      console.error('No token provided in request');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "No token provided" 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Configuration error",
        details: "Missing Supabase environment variables"
      }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('Looking up token in database for token:', token);
    
    // Simple test query first
    const { data: testData, error: testError } = await supabase
      .from("login_tokens")
      .select("count")
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Database connection failed",
        details: testError.message,
        code: testError.code
      }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }
    
    console.log('Database connection test successful');
    
    // Now try the actual token lookup
    const { data, error } = await supabase
      .from("login_tokens")
      .select("player_uuid, player_name, expires_at, used")
      .eq("token", token)
      .single();

    if (error) {
      console.error('Token lookup failed:', error);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Token lookup failed",
        details: error.message,
        code: error.code
      }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    if (!data) {
      console.error('No data returned from token lookup');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid token" 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    console.log('Token found for player:', data.player_name);

    const now = Math.floor(Date.now() / 1000);
    if (data.used) {
      console.error('Token already used');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Token already used" 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    if (data.expires_at < now) {
      console.error('Token expired:', {
        expires_at: data.expires_at,
        current_time: now,
        difference: now - data.expires_at
      });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Token expired" 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Mark token as used
    const { error: updateError } = await supabase
      .from("login_tokens")
      .update({ used: true })
      .eq("token", token);

    if (updateError) {
      console.error('Failed to mark token as used:', updateError);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Failed to process token",
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    console.log('Token validation successful for:', data.player_name);
    
    // Prepare response data
    const responseData: any = {
      valid: true,
      player_uuid: data.player_uuid, 
      player_name: data.player_name
    };

    // If create_session is requested, try to get or create a profile
    if (createSession) {
      try {
        // Check if profile exists - this might fail due to RLS policies
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, bio, minecraft_username")
          .eq("minecraft_username", data.player_name)
          .single();

        if (profileData && !profileError) {
          responseData.profile = profileData;
          responseData.profile_id = profileData.id;
        } else {
          console.log('Profile not found or access denied, skipping profile creation');
          // Don't try to create profile if we can't access profiles table
          // This is expected behavior when running with anon key
        }
      } catch (profileErr) {
        console.log('Profile handling skipped due to access restrictions:', profileErr);
        // Continue without profile data - this is expected
      }
    }
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Validate token error:", e);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Server error", 
      details: e.message 
    }), {
      status: 500,
      headers: { ...corsHeaders(null), "Content-Type": "application/json" },
    });
  }
});
