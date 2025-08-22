
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
  console.log(`📡 get-github-token function called: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    
    if (!isValidOrigin(origin)) {
      return new Response(null, { 
        status: 403,
        headers: corsHeaders(null)
      });
    }

    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders(origin) })
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

    console.log('🔍 Attempting to retrieve GitHub token from environment...');
    
    // Get the GitHub token from Supabase secrets
    const githubToken = Deno.env.get('GITHUB_TOKEN')
    
    if (!githubToken) {
      console.error('❌ GitHub token not found in environment variables');
      throw new Error('GitHub token not configured. Please add your GitHub Personal Access Token to the project secrets.')
    }

    // Validate token format (should start with 'ghp_' or 'github_pat_')
    if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
      console.error('❌ Invalid GitHub token format');
      throw new Error('Invalid GitHub token format. Please ensure you are using a valid Personal Access Token.')
    }

    console.log('✅ GitHub token retrieved and validated successfully');
    console.log(`🔑 Token prefix: ${githubToken.substring(0, 8)}...`);

    return new Response(
      JSON.stringify({ 
        token: githubToken,
        success: true,
        message: 'Token retrieved successfully'
      }),
      { 
        headers: { 
          ...corsHeaders(origin),
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('❌ Error in get-github-token function:', error);
    const origin = req.headers.get('Origin');
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders(origin),
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
