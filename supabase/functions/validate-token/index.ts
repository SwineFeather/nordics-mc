
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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
    console.log('Validate-token request received');
    
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const createSession = url.searchParams.get("create_session") === "true";
    
    console.log('Token validation requested:', token ? 'token present' : 'no token', 'create_session:', createSession);
    
    if (!token) {
      console.error('No token provided in request');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "No token provided" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Looking up token in database');
    
    const { data, error } = await supabase
      .from("login_tokens")
      .select("player_uuid, player_name, expires_at, used")
      .eq("token", token)
      .single();

    if (error || !data) {
      console.error('Token lookup failed:', error?.message || 'No data returned');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid token" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Token found for player:', data.player_name);

    const now = Math.floor(Date.now() / 1000);
    if (data.used || data.expires_at < now) {
      console.error('Token is expired or already used:', {
        used: data.used,
        expired: data.expires_at < now,
        expires_at: data.expires_at,
        current_time: now
      });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Token expired or already used" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        error: "Failed to process token" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if there's already a website account with this minecraft username
    console.log('Checking for existing accounts with username:', data.player_name);
    
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, minecraft_username')
      .eq('minecraft_username', data.player_name)
      .single();

    let profileId;
    let needsAccountMerge = false;

    if (existingProfile) {
      // Account already exists - use existing profile
      profileId = existingProfile.id;
      console.log('Found existing profile for', data.player_name, '- using existing account');
      
      // Verify the minecraft username
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_minecraft_username', {
          p_player_uuid: data.player_uuid,
          p_minecraft_username: data.player_name,
          p_profile_id: profileId
        });

      if (verifyError) {
        console.error('Failed to verify username:', verifyError);
      } else {
        console.log('Username verification result:', verifyResult);
        needsAccountMerge = verifyResult?.merge_needed || false;
      }
    } else {
      // Create new TokenLink profile
      console.log('Creating new TokenLink profile for:', data.player_name);
      
      const { data: profileResult, error: profileCreateError } = await supabase
        .rpc('create_tokenlink_user', {
          p_player_uuid: data.player_uuid,
          p_player_name: data.player_name,
          p_email: null // Will use default @tokenlink.local email
        });

      if (profileCreateError) {
        console.error('Failed to create profile:', profileCreateError);
        return new Response(JSON.stringify({ 
          valid: false, 
          error: "Failed to create profile" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      profileId = profileResult;
      
      // Verify the minecraft username for new profile
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_minecraft_username', {
          p_player_uuid: data.player_uuid,
          p_minecraft_username: data.player_name,
          p_profile_id: profileId
        });

      if (verifyError) {
        console.error('Failed to verify username:', verifyError);
      } else {
        console.log('Username verification result:', verifyResult);
      }
    }

    // Get the full profile data
    const { data: profileData, error: getProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (getProfileError || !profileData) {
      console.error('Failed to get profile data:', getProfileError);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Failed to get profile data" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sessionData = null;

    // Create Supabase auth session if requested
    if (createSession) {
      console.log('Creating Supabase session for TokenLink user');
      
      try {
        // Create a temporary auth user session using admin privileges
        const { data: sessionResult, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: profileData.email,
          options: {
            redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/dashboard`
          }
        });

        if (sessionError) {
          console.error('Failed to generate session:', sessionError);
        } else {
          sessionData = {
            access_token: sessionResult.properties?.action_link || null,
            refresh_token: null,
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: profileId,
              email: profileData.email,
              user_metadata: {
                full_name: profileData.full_name,
                minecraft_username: profileData.minecraft_username
              }
            }
          };
          console.log('Session created successfully');
        }
      } catch (sessionErr) {
        console.error('Error creating session:', sessionErr);
      }
    }

    console.log('Token validation successful for:', data.player_name);
    
    return new Response(JSON.stringify({ 
      valid: true,
      player_uuid: data.player_uuid, 
      player_name: data.player_name,
      profile_id: profileId,
      profile: profileData,
      session: sessionData,
      account_merge_needed: needsAccountMerge
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Validate token error:", e);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Server error", 
      details: e.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
