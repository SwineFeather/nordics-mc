import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
})

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

    return new Response(null, { headers: corsHeaders(origin) });
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


    const { username, nation_name } = await req.json()

    if (!username || !nation_name) {
      return new Response(
        JSON.stringify({ error: 'Username and nation_name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call the Nordics API to get player data
    const response = await fetch(`https://townywebpanel.nordics.world/api/players/${username}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ canAccess: false, reason: 'Player not found' }),
          { 
            status: 200, 
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
      }
      throw new Error(`API request failed: ${response.status}`)
    }

    const playerData = await response.json()
    
    // Check if player's nation matches the forum's nation
    const canAccess = playerData.nation === nation_name

    return new Response(
      JSON.stringify({ 
        canAccess, 
        playerNation: playerData.nation,
        requestedNation: nation_name
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking nation access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )
  }
}) 