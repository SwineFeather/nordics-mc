
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

interface PlayerData {
  name: string;
  skin: string;
  update: number;
  type: number;
}

interface StatsData {
  [playerUuid: string]: PlayerData;
}

Deno.serve(async (req) => {
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


    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
          status: 405
        }
      )
    }

    const body = await req.json()
    const { statsData } = body

    if (!statsData) {
      return new Response(
        JSON.stringify({ error: 'No stats data provided' }),
        {
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Starting stats import...')
    console.log(`Found ${Object.keys(statsData).length} players to import`)

    const players = [];
    const onlinePlayers = [];
    const playerStatistics = [];

    // Process each player
    for (const [playerUuid, playerData] of Object.entries(statsData as StatsData)) {
      
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


        // Skip invalid entries
        if (!playerData || !playerData.name || playerUuid === 'online' || playerUuid === 'playernames' || playerUuid === 'scoreboard' || playerUuid === 'units') {
          continue;
        }

        // Prepare player statistics data
        const stats = {
          skin: playerData.skin || '',
          last_update: playerData.update || 0,
          player_type: playerData.type || 0
        };

        players.push({
          uuid: playerUuid,
          username: playerData.name,
          total_xp: 0, // Will be updated when we have XP data
          level: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        playerStatistics.push({
          player_uuid: playerUuid,
          player_name: playerData.name,
          statistics: stats,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Determine if player is online based on recent update (within last hour)
        const lastUpdateTime = new Date(playerData.update);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const isOnline = lastUpdateTime > oneHourAgo;

        onlinePlayers.push({
          player_uuid: playerUuid,
          player_name: playerData.name,
          is_online: isOnline,
          last_seen: lastUpdateTime.toISOString(),
          updated_at: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error processing player ${playerUuid}:`, error);
      }
    }

    console.log(`Processed ${players.length} players for import`)

    // Insert players data
    if (players.length > 0) {
      console.log('Inserting players...')
      const { error: playersError } = await supabase
        .from('players')
        .upsert(players, {
          onConflict: 'uuid',
          ignoreDuplicates: false
        })

      if (playersError) {
        console.error('Error inserting players:', playersError)
      } else {
        console.log(`Successfully inserted ${players.length} players`)
      }
    }

    // Insert player statistics
    if (playerStatistics.length > 0) {
      console.log('Inserting player statistics...')
      const { error: statsError } = await supabase
        .from('player_statistics')
        .upsert(playerStatistics, {
          onConflict: 'player_uuid',
          ignoreDuplicates: false
        })

      if (statsError) {
        console.error('Error inserting player statistics:', statsError)
      } else {
        console.log(`Successfully inserted ${playerStatistics.length} player statistics`)
      }
    }

    // Insert online players data
    if (onlinePlayers.length > 0) {
      console.log('Inserting online players...')
      const { error: onlineError } = await supabase
        .from('online_players')
        .upsert(onlinePlayers, {
          onConflict: 'player_uuid',
          ignoreDuplicates: false
        })

      if (onlineError) {
        console.error('Error inserting online players:', onlineError)
      } else {
        console.log(`Successfully inserted ${onlinePlayers.length} online player records`)
      }
    }

    const onlineCount = onlinePlayers.filter(p => p.is_online).length;

    return new Response(
      JSON.stringify({
        success: true,
        imported: {
          players: players.length,
          statistics: playerStatistics.length,
          online_records: onlinePlayers.length,
          currently_online: onlineCount
        },
        message: `Successfully imported data for ${players.length} players`
      }),
      {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to import stats data',
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
