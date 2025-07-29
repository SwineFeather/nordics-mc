import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { townName } = await req.json();
    
    if (!townName) {
      return new Response(
        JSON.stringify({ error: 'Town name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to fetch from external API first
    try {
      const apiResponse = await fetch(`https://townywebpanel.nordics.world/api/towns/${encodeURIComponent(townName)}/residents`);
      
      if (apiResponse.ok) {
        const residents = await apiResponse.json();
        console.log(`Successfully fetched residents from API for ${townName}:`, residents);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: residents, 
            source: 'api' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } catch (apiError) {
      console.warn(`API fetch failed for ${townName}, falling back to Supabase:`, apiError);
    }

    // Fallback to Supabase data if API fails
    const { data: residents, error } = await supabase
      .from('players')
      .select('name, uuid, last_online, created_at')
      .eq('town', townName)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform Supabase data to match API format
    const transformedResidents = (residents || []).map(player => ({
      is_mayor: false, // Would need additional logic to determine mayor
      is_king: false,  // Would need additional logic to determine king
      joined: new Date(player.created_at || Date.now()).getTime(),
      name: player.name,
      last_online: new Date(player.last_online || Date.now()).getTime(),
      uuid: player.uuid
    }));

    console.log(`Fetched residents from Supabase for ${townName}:`, transformedResidents);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedResidents, 
        source: 'supabase' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error fetching town residents:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: 'Failed to fetch town residents' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 