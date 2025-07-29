import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Expected path: /serve-image/nations/nation_name or /serve-image/towns/town_name
    if (pathParts.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Invalid path. Expected: /serve-image/{type}/{name}' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const [, type, name] = pathParts
    
    // Validate type
    if (!['nations', 'towns'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "nations" or "towns"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the external URL from query parameter
    const externalUrl = url.searchParams.get('url')
    
    if (!externalUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing external URL parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate the external URL
    if (!isValidImageUrl(externalUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the image from the external URL
    const response = await fetch(externalUrl)
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Image not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    // Return the image with appropriate headers
    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error serving image:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to serve image' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const allowedDomains = [
      'cdn.discordapp.com',
      'media.discordapp.net',
      'i.imgur.com',
      'imgur.com',
      'images-ext-1.discordapp.net',
      'images-ext-2.discordapp.net'
    ]
    
    const domain = urlObj.hostname.toLowerCase()
    const isValidDomain = allowedDomains.some(allowed => domain.includes(allowed))
    
    if (!isValidDomain) {
      return false
    }

    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    const pathname = urlObj.pathname.toLowerCase()
    
    return validExtensions.some(ext => pathname.endsWith(ext))
  } catch {
    return false
  }
} 