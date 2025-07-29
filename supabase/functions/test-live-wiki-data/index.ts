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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing environment variables',
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseServiceKey
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('towns')
      .select('name')
      .limit(1)

    if (testError) {
      return new Response(
        JSON.stringify({ 
          error: 'Database connection failed', 
          details: testError,
          message: testError.message,
          code: testError.code
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test 2: Check towns table structure
    const { data: townsData, error: townsError } = await supabase
      .from('towns')
      .select('name, mayor_name, residents_count, balance, nation_name')
      .limit(3)

    // Test 3: Check nations table structure
    const { data: nationsData, error: nationsError } = await supabase
      .from('nations')
      .select('name, leader_name, capital_name, towns_count, balance')
      .limit(3)

    return new Response(
      JSON.stringify({ 
        success: true,
        databaseConnection: 'OK',
        towns: {
          data: townsData,
          error: townsError,
          count: townsData?.length || 0
        },
        nations: {
          data: nationsData,
          error: nationsError,
          count: nationsData?.length || 0
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Function execution failed', 
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 