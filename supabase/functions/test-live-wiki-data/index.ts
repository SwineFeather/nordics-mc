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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing environment variables',
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseServiceKey
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
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
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test 2: Check if we can access the wiki_pages table
    const { data: wikiData, error: wikiError } = await supabase
      .from('wiki_pages')
      .select('id, title, slug, content, created_at')
      .limit(1)

    if (wikiError) {
      return new Response(
        JSON.stringify({ 
          error: 'Wiki pages access failed', 
          details: wikiError,
          message: wikiError.message,
          code: wikiError.code
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test 3: Check if we can access the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, minecraft_username, role')
      .limit(1)

    if (profileError) {
      return new Response(
        JSON.stringify({ 
          error: 'Profiles access failed', 
          details: profileError,
          message: profileError.message,
          code: profileError.code
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // All tests passed
    return new Response(
      JSON.stringify({
        success: true,
        message: 'All database connections successful',
        tests: {
          database: '✅ Connected',
          wiki_pages: '✅ Accessible',
          profiles: '✅ Accessible'
        },
        sampleData: {
          towns: testData?.length || 0,
          wikiPages: wikiData?.length || 0,
          profiles: profileData?.length || 0
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Test function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Test function failed',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' }
      }
    )
  }
}) 