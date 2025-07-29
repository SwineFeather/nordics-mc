
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, email, password } = await req.json();

    if (!profileId || !email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      user_id: authUser.user.id,
      email: email
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Upgrade account error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
