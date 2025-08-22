import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CSRFValidationRequest {
  token: string;
  user_id: string;
}

interface CSRFValidationResponse {
  valid: boolean;
  error?: string;
  token_refreshed?: boolean;
}

// Get allowed origins from environment or use secure defaults
// IMPORTANT: Only include domains that should have access to your API
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

// CSRF token storage in memory (in production, use Redis or database)
// TODO: Implement persistent storage for production use
const csrfTokens = new Map<string, { token: string; expiresAt: number; userId: string }>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    
    if (!isValidOrigin(origin)) {
      return new Response(
        null,
        {
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins[0],
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
            'Access-Control-Max-Age': '86400',
          },
        },
      )
    }

    return new Response(
      null,
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    )
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
            'Access-Control-Allow-Origin': allowedOrigins[0],
          },
        }
      )
    }

    const { token, user_id }: CSRFValidationRequest = await req.json()

    if (!token || !user_id) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Missing token or user_id'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          },
        }
      )
    }

    // Validate CSRF token
    const validationResult = await validateCSRFToken(token, user_id)
    
    return new Response(
      JSON.stringify(validationResult),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'X-CSRF-Valid': validationResult.valid.toString(),
        },
      }
    )

  } catch (error) {
    console.error('CSRF validation error:', error)
    const origin = req.headers.get('Origin');
    
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : allowedOrigins[0],
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    )
  }
})

/**
 * Validate CSRF token
 */
async function validateCSRFToken(token: string, userId: string): Promise<CSRFValidationResponse> {
  try {
    // Check if token exists and is valid
    const storedToken = csrfTokens.get(userId)
    
    if (!storedToken) {
      return {
        valid: false,
        error: 'No CSRF token found for user'
      }
    }

    // Check if token has expired
    if (Date.now() >= storedToken.expiresAt) {
      // Remove expired token
      csrfTokens.delete(userId)
      return {
        valid: false,
        error: 'CSRF token has expired'
      }
    }

    // Check if token matches
    if (storedToken.token !== token) {
      return {
        valid: false,
        error: 'Invalid CSRF token'
      }
    }

    // Token is valid
    return {
      valid: true
    }

  } catch (error) {
    console.error('Error validating CSRF token:', error)
    return {
      valid: false,
      error: 'Token validation failed'
    }
  }
}

/**
 * Store CSRF token for a user
 */
export async function storeCSRFToken(userId: string, token: string, expiresIn: number = 30 * 60 * 1000) {
  const expiresAt = Date.now() + expiresIn
  csrfTokens.set(userId, { token, expiresAt, userId })
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens()
}

/**
 * Clean up expired CSRF tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now()
  for (const [userId, tokenData] of csrfTokens.entries()) {
    if (now >= tokenData.expiresAt) {
      csrfTokens.delete(userId)
    }
  }
}

/**
 * Remove CSRF token for a user
 */
export function removeCSRFToken(userId: string) {
  csrfTokens.delete(userId)
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Middleware function for other Edge Functions to use
 */
export async function validateCSRFMiddleware(req: Request, userId: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const body = await req.json()
    const token = body.csrf_token || req.headers.get('X-CSRF-Token')
    
    if (!token) {
      return { valid: false, error: 'CSRF token missing' }
    }

    const result = await validateCSRFToken(token, userId)
    return result

  } catch (error) {
    console.error('CSRF middleware error:', error)
    return { valid: false, error: 'CSRF validation failed' }
  }
}
