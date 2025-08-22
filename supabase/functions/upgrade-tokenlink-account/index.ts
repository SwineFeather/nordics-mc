
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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

    const { profileId, email, password } = await req.json();

    if (!profileId || !email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields" 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    console.log('Upgrading TokenLink account to full auth account');

    // Get the existing profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Profile not found" 
      }), {
        status: 404,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Create the Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: profile.full_name,
        minecraft_username: profile.minecraft_username
      }
    });

    if (authError) {
      console.error('Failed to create auth user:', authError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: authError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Update the profile to use the new auth user ID and email
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        id: authUser.user.id,
        email: email 
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      // Clean up the auth user if profile update fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to update profile" 
      }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    // Update any references to the old profile ID
    await supabase
      .from('players')
      .update({ profile_id: authUser.user.id })
      .eq('profile_id', profileId);

    console.log('Successfully upgraded TokenLink account');

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Account upgraded successfully",
      userId: authUser.user.id
    }), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Upgrade tokenlink account error:", e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal server error", 
      details: e.message 
    }), {
      status: 500,
      headers: { ...corsHeaders(null), "Content-Type": "application/json" },
    });
  }
});
