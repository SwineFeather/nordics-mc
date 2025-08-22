import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
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
  'Access-Control-Allow-Credentials': 'true',
});

  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    
    if (!isValidOrigin(origin)) {
      return new Response(null, { 
        status: 403,
        headers: corsHeaders(null)
      });
    }

    return new Response(null, { headers: corsHeaders(origin) });;
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


    const { townName } = await req.json();
    
    if (!townName) {
      return new Response(
        JSON.stringify({ error: 'Town name is required' }),
        { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to fetch from external API first
    
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
          { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }, status: 200 }
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
      { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error fetching town residents:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: 'Failed to fetch town residents' 
      }),
      { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 