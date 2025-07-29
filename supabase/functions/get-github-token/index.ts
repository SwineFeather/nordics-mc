
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`📡 get-github-token function called: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('❌ Error in get-github-token function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
