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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request body
    const { message, playerId, context } = await req.json()

    if (!message || !playerId) {
      return new Response(
        JSON.stringify({ error: 'Message and playerId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get X.AI API key from environment
    const xaiApiKey = Deno.env.get('XAI_API_KEY')
    if (!xaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'X.AI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Thor system prompt for Minecraft context
    const systemPrompt = `
You are Thor, the Norse god of thunder, speaking to players in a Minecraft server called "Nordics". 

IMPORTANT RULES:
1. Always respond as Thor - use Norse mythology references, call players "traveler" or "adventurer"
2. Keep responses concise and Minecraft-appropriate (max 200 characters per message)
3. Use Minecraft color codes: &a for green, &e for yellow, &c for red, &b for aqua, &f for white
4. Split long responses into multiple messages if needed
5. Be helpful, encouraging, and in-character
6. Reference Norse mythology, hammers, thunder, Odin, etc.
7. If you don't know something, say "By Odin, that knowledge eludes me!"

CONTEXT: This is a Minecraft server with towns, nations, achievements, and a community. Players can build, trade, and interact.

${context ? `\n## AVAILABLE DATABASE INFORMATION:\n\n${context}` : ''}`

    // Call X.AI API
    const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        model: 'grok-3-mini',
        stream: false,
        temperature: 0.7
      })
    })

    if (!xaiResponse.ok) {
      const errorText = await xaiResponse.text()
      console.error('X.AI API error:', xaiResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          messages: ['By Odin, the thunder clouds are blocking my vision!'],
          totalLength: 0
        }),
        { 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    const xaiData = await xaiResponse.json()
    let thorResponse = xaiData.choices?.[0]?.message?.content || 'By Odin, I could not answer that.'
    
    // Clean any prefixes from Thor's response
    thorResponse = thorResponse.replace(/^(hail,? (traveler|adventurer|friend)[.!]?|hello|hi|greetings)[\s,\-]*/i, '')
    
    // Convert markdown to Minecraft color codes
    thorResponse = thorResponse
      .replace(/\*\*(.*?)\*\*/g, '&e$1&f') // Bold to yellow
      .replace(/\*(.*?)\*/g, '&a$1&f')     // Italic to green
      .replace(/`(.*?)`/g, '&b$1&f')       // Code to aqua
    
    // Split into multiple messages if needed (max 200 chars)
    const messages = []
    const maxLength = 200
    let currentMessage = thorResponse.trim()
    
    while (currentMessage.length > maxLength) {
      const lastSpace = currentMessage.lastIndexOf(' ', maxLength)
      if (lastSpace === -1) break
      
      messages.push(currentMessage.substring(0, lastSpace))
      currentMessage = currentMessage.substring(lastSpace + 1)
    }
    
    if (currentMessage.trim()) {
      messages.push(currentMessage.trim())
    }

    // Log usage for monitoring
    console.log(`Thor used by user ${user.id} for player ${playerId}`)

    return new Response(
      JSON.stringify({ 
        messages: messages.length > 0 ? messages : ['By Odin, my hammer slipped!'],
        totalLength: thorResponse.length
      }),
      { 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Thor function error:', error)
    return new Response(
      JSON.stringify({ 
        messages: ['By Odin, my hammer slipped!'],
        totalLength: 0
      }),
      { 
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' } 
      }
    )
  }
}) 