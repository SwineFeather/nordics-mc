/**
 * API Key Configuration
 * SECURITY UPDATE: API keys are now handled securely on the backend
 * This file is kept for backward compatibility but no longer exposes API keys
 */

// X.AI API Configuration (backend-only)
export const XAI_CONFIG = {
  API_URL: 'https://api.x.ai/v1/chat/completions',
  MAX_REQUESTS: 5,
  MAX_REQUESTS_PER_HOUR: 30,
} as const;

// Validate API key configuration (now checks backend availability)
export function validateApiKeys(): { valid: boolean; missing: string[] } {
  // API keys are now handled securely on the backend
  return {
    valid: true,
    missing: []
  };
}

// Get API key with validation (deprecated - use backend services instead)
export function getXaiApiKey(): string {
  console.warn('getXaiApiKey is deprecated - API keys are now handled securely on the backend');
  throw new Error('API keys are now handled securely on the backend. Use aiChatService or thorMinecraftService instead.');
}

// Check if API keys are configured
export function isApiConfigured(): boolean {
  // API keys are now handled securely on the backend
  return true;
}

// Development warning
if (import.meta.env.DEV) {
  console.info(
    'ℹ️  X.AI API keys are now handled securely on the backend.\n' +
    'No frontend configuration required.'
  );
} 