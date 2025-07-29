import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Starting sync of all towns and nations to wiki pages')

    // Fetch all towns
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .order('name')

    if (townsError) {
      console.error('❌ Failed to fetch towns:', townsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch towns', details: townsError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch all nations
    const { data: nations, error: nationsError } = await supabase
      .from('nations')
      .select('*')
      .order('name')

    if (nationsError) {
      console.error('❌ Failed to fetch nations:', nationsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch nations', details: nationsError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const results = {
      towns: { total: towns?.length || 0, created: 0, errors: 0 },
      nations: { total: nations?.length || 0, created: 0, errors: 0 },
      errors: [] as string[]
    }

          // Create Towns folder and index
      if (towns && towns.length > 0) {
        console.log(`📚 Creating ${towns.length} town wiki pages`)
        
        // Create Towns index page
        const townsIndexContent = generateTownsIndexContent(towns)
        const townsIndexPath = 'Nordics/towns/README.md'
        
        const { error: indexError } = await supabase.storage
          .from('wiki')
          .upload(townsIndexPath, townsIndexContent, {
            contentType: 'text/markdown',
            upsert: true
          })

        if (indexError) {
          console.error('❌ Failed to create towns index:', indexError)
          results.errors.push(`Failed to create towns index: ${indexError.message}`)
        } else {
          console.log('✅ Created towns index page')
        }

        // Create individual town pages
        for (const town of towns) {
          try {
            const townContent = generateTownContent(town)
            const sanitizedName = town.name.replace(/[^a-zA-Z0-9]/g, '_')
            const townPath = `Nordics/towns/${sanitizedName}.md`
          
          const { error: uploadError } = await supabase.storage
            .from('wiki')
            .upload(townPath, townContent, {
              contentType: 'text/markdown',
              upsert: true
            })

          if (uploadError) {
            console.error(`❌ Failed to create wiki page for town ${town.name}:`, uploadError)
            results.towns.errors++
            results.errors.push(`Failed to create town ${town.name}: ${uploadError.message}`)
          } else {
            console.log(`✅ Created wiki page for town: ${town.name}`)
            results.towns.created++
          }
        } catch (error) {
          console.error(`❌ Error creating wiki page for town ${town.name}:`, error)
          results.towns.errors++
          results.errors.push(`Error creating town ${town.name}: ${error.message}`)
        }
      }
    }

          // Create Nations folder and index
      if (nations && nations.length > 0) {
        console.log(`📚 Creating ${nations.length} nation wiki pages`)
        
        // Create Nations index page
        const nationsIndexContent = generateNationsIndexContent(nations)
        const nationsIndexPath = 'Nordics/nations/README.md'
        
        const { error: indexError } = await supabase.storage
          .from('wiki')
          .upload(nationsIndexPath, nationsIndexContent, {
            contentType: 'text/markdown',
            upsert: true
          })

        if (indexError) {
          console.error('❌ Failed to create nations index:', indexError)
          results.errors.push(`Failed to create nations index: ${indexError.message}`)
        } else {
          console.log('✅ Created nations index page')
        }

        // Create individual nation pages
        for (const nation of nations) {
          try {
            const nationContent = generateNationContent(nation)
            const sanitizedName = nation.name.replace(/[^a-zA-Z0-9]/g, '_')
            const nationPath = `Nordics/nations/${sanitizedName}.md`
          
          const { error: uploadError } = await supabase.storage
            .from('wiki')
            .upload(nationPath, nationContent, {
              contentType: 'text/markdown',
              upsert: true
            })

          if (uploadError) {
            console.error(`❌ Failed to create wiki page for nation ${nation.name}:`, uploadError)
            results.nations.errors++
            results.errors.push(`Failed to create nation ${nation.name}: ${uploadError.message}`)
          } else {
            console.log(`✅ Created wiki page for nation: ${nation.name}`)
            results.nations.created++
          }
        } catch (error) {
          console.error(`❌ Error creating wiki page for nation ${nation.name}:`, error)
          results.nations.errors++
          results.errors.push(`Error creating nation ${nation.name}: ${error.message}`)
        }
      }
    }

    console.log(`✅ Sync completed: ${results.towns.created} towns, ${results.nations.created} nations created`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wiki pages sync completed',
        results: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in sync-all-wiki-pages function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateTownContent(town: any): string {
  const now = new Date().toISOString()
  
  return `---
title: "${town.name}"
updated_at: "${now}"
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
}

function generateNationContent(nation: any): string {
  const now = new Date().toISOString()
  
  return `---
title: "${nation.name}"
updated_at: "${now}"
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
}

function generateTownsIndexContent(towns: any[]): string {
  const now = new Date().toISOString()
  
  const townsList = towns.map(town => {
    const sanitizedName = town.name.replace(/[^a-zA-Z0-9]/g, '_')
    return `- [${town.name}](./${sanitizedName}.md) - Mayor: ${town.mayor_name || 'Unknown'}, Population: ${town.residents_count || 0}, Balance: $${town.balance ? town.balance.toLocaleString() : '0'}`
  }).join('\n')

  return `---
title: "Towns"
updated_at: "${now}"
auto_generated: true
---

# Towns

This page lists all towns in the Nordics server.

## Town List

${townsList}

## Statistics

- **Total Towns**: ${towns.length}
- **Total Population**: ${towns.reduce((sum, town) => sum + (town.residents_count || 0), 0)}
- **Total Balance**: $${towns.reduce((sum, town) => sum + (town.balance || 0), 0).toLocaleString()}
- **Average Population**: ${Math.round(towns.reduce((sum, town) => sum + (town.residents_count || 0), 0) / towns.length)}
- **Average Balance**: $${Math.round(towns.reduce((sum, town) => sum + (town.balance || 0), 0) / towns.length).toLocaleString()}

---
*This page was automatically generated from the database.*
`
}

function generateNationsIndexContent(nations: any[]): string {
  const now = new Date().toISOString()
  
  const nationsList = nations.map(nation => {
    const sanitizedName = nation.name.replace(/[^a-zA-Z0-9]/g, '_')
    return `- [${nation.name}](./${sanitizedName}.md) - Leader: ${nation.leader_name || 'Unknown'}, Capital: ${nation.capital_town_name || 'Unknown'}, Towns: ${nation.towns_count || 0}`
  }).join('\n')

  return `---
title: "Nations"
updated_at: "${now}"
auto_generated: true
---

# Nations

This page lists all nations in the Nordics server.

## Nation List

${nationsList}

## Statistics

- **Total Nations**: ${nations.length}
- **Total Towns**: ${nations.reduce((sum, nation) => sum + (nation.towns_count || 0), 0)}
- **Total Residents**: ${nations.reduce((sum, nation) => sum + (nation.residents_count || 0), 0)}
- **Total Balance**: $${nations.reduce((sum, nation) => sum + (nation.balance || 0), 0).toLocaleString()}
- **Average Towns per Nation**: ${Math.round(nations.reduce((sum, nation) => sum + (nation.towns_count || 0), 0) / nations.length)}

---
*This page was automatically generated from the database.*
`
} 