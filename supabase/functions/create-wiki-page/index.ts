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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    return new Response('ok', { headers: corsHeaders(origin) })
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
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { entity_type, entity_id, entity_name, table_name } = await req.json()

    console.log(`🔄 Creating wiki page for ${entity_type}: ${entity_name} (ID: ${entity_id})`)

    // Fetch the entity data from the database
    let entityData: any = null
    let error: any = null

    if (entity_type === 'town') {
      const { data, error: fetchError } = await supabase
        .from('towns')
        .select('*')
        .eq('id', entity_id)
        .single()
      
      entityData = data
      error = fetchError
    } else if (entity_type === 'nation') {
      const { data, error: fetchError } = await supabase
        .from('nations')
        .select('*')
        .eq('id', entity_id)
        .single()
      
      entityData = data
      error = fetchError
    }

    if (error || !entityData) {
      console.error(`❌ Failed to fetch ${entity_type} data:`, error)
      return new Response(
        JSON.stringify({ error: `Failed to fetch ${entity_type} data`, details: error }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate the wiki page content
    const wikiContent = generateWikiContent(entity_type, entityData)
    
    // Create the file path
    const sanitizedName = entity_name.replace(/[^a-zA-Z0-9]/g, '_')
    const folderPath = entity_type === 'town' ? 'Nordics/towns' : 'Nordics/nations'
    const filePath = `${folderPath}/${sanitizedName}.md`

    // Upload the wiki page to the storage bucket
    const { error: uploadError } = await supabase.storage
      .from('wiki')
      .upload(filePath, wikiContent, {
        contentType: 'text/markdown',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ Failed to upload wiki page for ${entity_name}:`, uploadError)
      return new Response(
        JSON.stringify({ error: `Failed to upload wiki page`, details: uploadError }),
        { 
          status: 500, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Successfully created wiki page for ${entity_name} at ${filePath}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Wiki page created for ${entity_name}`,
        filePath: filePath
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in create-wiki-page function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateWikiContent(entityType: string, entityData: any): string {
  const now = new Date().toISOString()
  
  if (entityType === 'town') {
    return generateTownContent(entityData, now)
  } else if (entityType === 'nation') {
    return generateNationContent(entityData, now)
  }
  
  return ''
}

function generateTownContent(town: any, timestamp: string): string {
  const frontmatter = `---
title: "${town.name}"
updated_at: "${timestamp}"
auto_generated: true
---

# ${town.name}

## Quick Stats
- **Mayor**: ${town.mayor_name || '[Unknown]'}
- **Population**: ${town.residents_count || 0}
- **Balance**: ${town.balance ? `$${town.balance.toLocaleString()}` : '$0'}
- **Level**: ${town.level || 1}
- **Total XP**: ${town.total_xp || 0}
- **Nation**: ${town.nation_name || 'Independent'}
- **Capital**: ${town.is_capital ? 'Yes' : 'No'}
- **Founded**: ${town.created_at ? new Date(town.created_at).toLocaleDateString() : '[Unknown]'}

## Location
- **World**: ${town.world_name || 'world'}
- **Coordinates**: X: ${town.location_x || 0}, Z: ${town.location_z || 0}
- **Spawn**: X: ${town.spawn_x || 0}, Y: ${town.spawn_y || 64}, Z: ${town.spawn_z || 0}

## Town Information
- **Tag**: ${town.tag || '[No tag]'}
- **Board**: ${town.board || '[No board message]'}
- **Max Residents**: ${town.max_residents || 50}
- **Max Plots**: ${town.max_plots || 100}
- **Taxes**: ${town.taxes || 0}%
- **Plot Tax**: ${town.plot_tax || 0}%

## Description
[Add description here]

## History
[Add history here]

## Notable Locations
[Add notable locations here]

## Economy
[Add economy information here]

## Government
[Add government information here]

## Culture
[Add culture information here]

---
*This page was automatically generated from the database. You can edit it to add more information.*
`
  return frontmatter
}

function generateNationContent(nation: any, timestamp: string): string {
  const frontmatter = `---
title: "${nation.name}"
updated_at: "${timestamp}"
auto_generated: true
---

# ${nation.name}

## Quick Stats
- **Leader**: ${nation.leader_name || '[Unknown]'}
- **Capital**: ${nation.capital_town_name || '[Unknown]'}
- **Balance**: ${nation.balance ? `$${nation.balance.toLocaleString()}` : '$0'}
- **Towns Count**: ${nation.towns_count || 0}
- **Residents Count**: ${nation.residents_count || 0}
- **Tag**: ${nation.tag || '[No tag]'}
- **Founded**: ${nation.created_at ? new Date(nation.created_at).toLocaleDateString() : '[Unknown]'}

## Nation Information
- **Board**: ${nation.board || '[No board message]'}
- **Taxes**: ${nation.taxes || 0}%
- **Town Tax**: ${nation.town_tax || 0}%
- **Max Towns**: ${nation.max_towns || 10}
- **Allies**: ${nation.ally_count || 0}
- **Enemies**: ${nation.enemy_count || 0}
- **Activity Score**: ${nation.activity_score || 0}
## Description
[Add description here]

## History
[Add history here]

## Government
[Add government information here]

## Capital
${nation.capital_town_name ? `**Capital City**: ${nation.capital_town_name}` : '[Add capital information here]'}

## Economy
[Add economy information here]

## Military
[Add military information here]

## Diplomacy
[Add diplomacy information here]

## Culture
[Add culture information here]

---
*This page was automatically generated from the database. You can edit it to add more information.*
`
  return frontmatter
} 