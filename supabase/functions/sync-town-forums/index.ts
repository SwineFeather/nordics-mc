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

    console.log('Starting town forum sync...')

    // Step 1: Get all current towns from the towns table
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('id, name, nation_name, created_at')
      .not('nation_name', 'is', null)

    if (townsError) {
      throw new Error(`Error fetching towns: ${townsError.message}`)
    }

    console.log(`Found ${towns.length} towns in nations`)

    // Step 2: Get all existing town forum categories
    const { data: existingForums, error: forumsError } = await supabase
      .from('forum_categories')
      .select('id, name, slug, town_name, nation_name, is_archived')
      .not('town_name', 'is', null)

    if (forumsError) {
      throw new Error(`Error fetching existing forums: ${forumsError.message}`)
    }

    console.log(`Found ${existingForums.length} existing town forums`)

    // Step 3: Create a map of existing forums by town name
    const existingForumsMap = new Map()
    existingForums.forEach(forum => {
      existingForumsMap.set(forum.town_name, forum)
    })

    // Step 4: Process each town
    const results = {
      created: 0,
      updated: 0,
      archived: 0,
      errors: [] as string[]
    }

    for (const town of towns) {
      try {
        const existingForum = existingForumsMap.get(town.name)
        
        if (!existingForum) {
          // Create new forum for this town
          const { error: createError } = await supabase
            .from('forum_categories')
            .insert({
              name: `${town.name} Forum`,
              description: `Private forum for ${town.name} residents`,
              slug: `town-${town.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              icon: 'image',
              color: getNationColor(town.nation_name),
              order_index: 6,
              is_moderator_only: false,
              nation_name: town.nation_name.replace(/_/g, ' '), // Standardize nation name
              town_name: town.name,
              is_archived: false
            })

          if (createError) {
            results.errors.push(`Failed to create forum for ${town.name}: ${createError.message}`)
          } else {
            results.created++
            console.log(`Created forum for town: ${town.name}`)
          }
        } else if (existingForum.is_archived) {
          // Reactivate archived forum
          const { error: updateError } = await supabase
            .from('forum_categories')
            .update({ 
              is_archived: false,
              nation_name: town.nation_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingForum.id)

          if (updateError) {
            results.errors.push(`Failed to reactivate forum for ${town.name}: ${updateError.message}`)
          } else {
            results.updated++
            console.log(`Reactivated forum for town: ${town.name}`)
          }
        } else if (existingForum.nation_name !== town.nation_name.replace(/_/g, ' ')) {
          // Update nation if it changed
          const { error: updateError } = await supabase
            .from('forum_categories')
            .update({ 
              nation_name: town.nation_name.replace(/_/g, ' '), // Standardize nation name
              color: getNationColor(town.nation_name),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingForum.id)

          if (updateError) {
            results.errors.push(`Failed to update forum for ${town.name}: ${updateError.message}`)
          } else {
            results.updated++
            console.log(`Updated forum for town: ${town.name} (nation changed to ${town.nation_name})`)
          }
        }
      } catch (error) {
        results.errors.push(`Error processing town ${town.name}: ${error.message}`)
      }
    }

    // Step 5: Archive forums for towns that no longer exist
    for (const forum of existingForums) {
      if (!forum.is_archived) {
        const townStillExists = towns.some(town => town.name === forum.town_name)
        
        if (!townStillExists) {
          const { error: archiveError } = await supabase
            .from('forum_categories')
            .update({ 
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', forum.id)

          if (archiveError) {
            results.errors.push(`Failed to archive forum for ${forum.town_name}: ${archiveError.message}`)
          } else {
            results.archived++
            console.log(`Archived forum for town: ${forum.town_name}`)
          }
        }
      }
    }

    console.log('Town forum sync completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Town forum sync completed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in town forum sync:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to get nation color
function getNationColor(nationName: string): string {
  // Standardize nation name (remove underscores, use spaces)
  const standardizedName = nationName.replace(/_/g, ' ')
  
  const nationColors: { [key: string]: string } = {
    'Skyward Sanctum': '#3b82f6',
    'North Sea League': '#059669',
    'Kesko Corporation': '#f59e0b',
    'Aqua Union': '#0ea5e9',
    'Constellation': '#8b5cf6',
  }
  return nationColors[standardizedName] || '#3b82f6'
} 