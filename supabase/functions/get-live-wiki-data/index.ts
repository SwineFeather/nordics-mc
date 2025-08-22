import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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


    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { entity_type, entity_name } = await req.json()

    if (!entity_type || !entity_name) {
      return new Response(
        JSON.stringify({ error: 'Missing entity_type or entity_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    let entityData = null

    if (entity_type === 'town') {
      // Fetch live town data using the helper function
      const { data, error } = await supabase
        .rpc('get_town_data_for_wiki', { town_name_param: entity_name })

      if (error) {
        console.error('Error fetching town data:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch town data', details: error }),
          { 
            status: 500, 
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
      }

      entityData = data && data.length > 0 ? data[0] : null
    } else if (entity_type === 'nation') {
      // Fetch live nation data using the helper function
      const { data, error } = await supabase
        .rpc('get_nation_data_for_wiki', { nation_name_param: entity_name })

      if (error) {
        console.error('Error fetching nation data:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch nation data', details: error }),
          { 
            status: 500, 
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
      }

      entityData = data && data.length > 0 ? data[0] : null
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid entity_type. Must be "town" or "nation"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!entityData) {
      return new Response(
        JSON.stringify({ error: `${entity_type} not found: ${entity_name}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate the live content
    const liveContent = generateLiveContent(entity_type, entityData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: liveContent,
        lastUpdated: new Date().toISOString(),
        entityData: entityData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in get-live-wiki-data function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateLiveContent(entityType: string, entityData: any): string {
  const now = new Date().toISOString()
  
  if (entityType === 'town') {
    return generateLiveTownContent(entityData, now)
  } else if (entityType === 'nation') {
    return generateLiveNationContent(entityData, now)
  }
  
  return ''
}

function generateLiveTownContent(town: any, timestamp: string): string {
  return `---
title: "${town.name}"
updated_at: "${timestamp}"
live_data: true
auto_generated: true
---

# ${town.name}

## 📊 Quick Stats

| **Stat** | **Value** |
|----------|-----------|
| **Mayor** | ${town.mayor_name || '[Unknown]'} |
| **Population** | ${town.residents_count || 0} |
| **Balance** | ${town.balance ? `$${town.balance.toLocaleString()}` : '$0'} |
| **Level** | ${town.level || 1} |
| **Total XP** | ${town.total_xp || 0} |
| **Nation** | ${town.nation_name || 'Independent'} |
| **Capital** | ${town.is_capital ? 'Yes' : 'No'} |
| **Founded** | ${town.created_at ? new Date(town.created_at).toLocaleDateString() : '[Unknown]'} |

## 📍 Location

| **Property** | **Value** |
|--------------|-----------|
| **World** | ${town.world_name || 'world'} |
| **Coordinates** | X: ${town.location_x || 0}, Z: ${town.location_z || 0} |
| **Spawn** | X: ${town.spawn_x || 0}, Y: ${town.spawn_y || 64}, Z: ${town.spawn_z || 0} |

## 🏛️ Town Information

| **Property** | **Value** |
|--------------|-----------|
| **Tag** | ${town.tag || '[No tag]'} |
| **Board** | ${town.board || '[No board message]'} |
| **Max Residents** | ${town.max_residents || 50} |
| **Max Plots** | ${town.max_plots || 100} |
| **Taxes** | ${town.taxes || 0}% |
| **Plot Tax** | ${town.plot_tax || 0}% |

---

## 📝 Content Sections

### Description
[Add description here]

### History
[Add history here]

### Notable Locations
[Add notable locations here]

### Economy
[Add economy information here]

### Government
[Add government information here]

### Culture
[Add culture information here]

---

*This page fetches live data from the database every time it's viewed. The information above is current as of ${new Date(timestamp).toLocaleString()}.*
`
}

function generateLiveNationContent(nation: any, timestamp: string): string {
  return `---
title: "${nation.name}"
updated_at: "${timestamp}"
live_data: true
auto_generated: true
---

# ${nation.name}

## 📊 Quick Stats

| **Stat** | **Value** |
|----------|-----------|
| **Leader** | ${nation.leader_name || '[Unknown]'} |
| **Capital** | ${nation.capital_town_name || '[Unknown]'} |
| **Balance** | ${nation.balance ? `$${nation.balance.toLocaleString()}` : '$0'} |
| **Towns Count** | ${nation.towns_count || 0} |
| **Residents Count** | ${nation.residents_count || 0} |
| **Tag** | ${nation.tag || '[No tag]'} |
| **Founded** | ${nation.created_at ? new Date(nation.created_at).toLocaleDateString() : '[Unknown]'} |

## 🏛️ Nation Information

| **Property** | **Value** |
|--------------|-----------|
| **Board** | ${nation.board || '[No board message]'} |
| **Taxes** | ${nation.taxes || 0}% |
| **Town Tax** | ${nation.town_tax || 0}% |
| **Max Towns** | ${nation.max_towns || 10} |
| **Allies** | ${nation.ally_count || 0} |
| **Enemies** | ${nation.enemy_count || 0} |
| **Activity Score** | ${nation.activity_score || 0} |

---

## 📝 Content Sections

### Description
[Add description here]

### History
[Add history here]

### Government
[Add government information here]

### Capital
${nation.capital_town_name ? `**Capital City**: ${nation.capital_town_name}` : '[Add capital information here]'}

### Economy
[Add economy information here]

### Military
[Add military information here]

### Diplomacy
[Add diplomacy information here]

### Culture
[Add culture information here]

---

*This page fetches live data from the database every time it's viewed. The information above is current as of ${new Date(timestamp).toLocaleString()}.*
`
} 