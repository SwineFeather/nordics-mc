import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, nation_name } = await req.json()

    if (!username || !nation_name) {
      return new Response(
        JSON.stringify({ error: 'Username and nation_name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking nation access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 