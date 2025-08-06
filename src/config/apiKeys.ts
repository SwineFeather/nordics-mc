/**
 * API Key Configuration
 * Centralized management of API keys from environment variables
 */

// X.AI API Configuration
export const XAI_CONFIG = {
  API_KEY: import.meta.env.VITE_XAI_API_KEY || '',
  API_URL: 'https://api.x.ai/v1/chat/completions',
  MAX_REQUESTS: 5,
  MAX_REQUESTS_PER_HOUR: 30,
} as const;

// Validate API key configuration
export function validateApiKeys(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!XAI_CONFIG.API_KEY) {
    missing.push('VITE_XAI_API_KEY');
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Get API key with validation
export function getXaiApiKey(): string {
  if (!XAI_CONFIG.API_KEY) {
    console.error('X.AI API key is not configured. Please set VITE_XAI_API_KEY environment variable.');
    throw new Error('X.AI API key not configured');
  }
  return XAI_CONFIG.API_KEY;
}

// Check if API keys are configured
export function isApiConfigured(): boolean {
  return validateApiKeys().valid;
}

// Development warning
if (import.meta.env.DEV && !XAI_CONFIG.API_KEY) {
  console.warn(
    '⚠️  X.AI API key not found in environment variables.\n' +
    'Please create a .env file with:\n' +
    'VITE_XAI_API_KEY=your_api_key_here\n' +
    'This is required for AI chat functionality.'
  );
} 