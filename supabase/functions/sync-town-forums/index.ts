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
              slug: `town-${town.name.toLowerCase().replace(/\s+/g, '-')}`,
              town_name: town.name,
              nation_name: town.nation_name,
              is_archived: false,
              created_at: new Date().toISOString()
            })

          if (createError) {
            console.error(`Error creating forum for ${town.name}:`, createError)
            results.errors.push(`Failed to create forum for ${town.name}: ${createError.message}`)
          } else {
            console.log(`Created forum for ${town.name}`)
            results.created++
          }
        } else {
          // Update existing forum if needed
          const needsUpdate = existingForum.nation_name !== town.nation_name || existingForum.is_archived
          
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from('forum_categories')
              .update({
                nation_name: town.nation_name,
                is_archived: false,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingForum.id)

            if (updateError) {
              console.error(`Error updating forum for ${town.name}:`, updateError)
              results.errors.push(`Failed to update forum for ${town.name}: ${updateError.message}`)
            } else {
              console.log(`Updated forum for ${town.name}`)
              results.updated++
            }
          }
        }
      } catch (error) {
        console.error(`Error processing town ${town.name}:`, error)
        results.errors.push(`Error processing ${town.name}: ${error.message}`)
      }
    }

    // Step 5: Archive forums for towns that no longer exist
    const currentTownNames = new Set(towns.map(t => t.name))
    for (const forum of existingForums) {
      if (!currentTownNames.has(forum.town_name) && !forum.is_archived) {
        try {
          const { error: archiveError } = await supabase
            .from('forum_categories')
            .update({
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', forum.id)

          if (archiveError) {
            console.error(`Error archiving forum for ${forum.town_name}:`, archiveError)
            results.errors.push(`Failed to archive forum for ${forum.town_name}: ${archiveError.message}`)
          } else {
            console.log(`Archived forum for ${forum.town_name}`)
            results.archived++
          }
        } catch (error) {
          console.error(`Error archiving forum for ${forum.town_name}:`, error)
          results.errors.push(`Error archiving ${forum.town_name}: ${error.message}`)
        }
      }
    }

    console.log('Town forum sync completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Town forum sync completed successfully',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Town forum sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Town forum sync failed',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' }
      }
    )
  }
}) 