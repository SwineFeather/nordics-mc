/**
 * Security Configuration for Nordics MC
 * 
 * This file contains security-related configuration and constants.
 * All sensitive values should be loaded from environment variables.
 */

export interface SecurityConfig {
  // CORS Configuration
  allowedOrigins: string[];
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Session Security
  sessionTimeoutMs: number;
  csrfTokenExpiryMs: number;
  
  // File Upload Security
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Security Headers
  enableHSTS: boolean;
  enableCSP: boolean;
  enableRateLimiting: boolean;
  
  // Authentication
  requireCSRF: boolean;
  requireOriginValidation: boolean;
}

/**
 * Get security configuration from environment variables
 */
export function getSecurityConfig(): SecurityConfig {
  return {
    // CORS Configuration
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://www.nordics.world',
      'https://nordics.world'
    ],
    
    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    
    // Session Security
    sessionTimeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS || '3600000'), // 1 hour
    csrfTokenExpiryMs: parseInt(process.env.CSRF_TOKEN_EXPIRY_MS || '1800000'), // 30 minutes
    
    // File Upload Security
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    
    // Security Headers
    enableHSTS: process.env.ENABLE_HSTS === 'true',
    enableCSP: process.env.ENABLE_CSP !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    
    // Authentication
    requireCSRF: process.env.REQUIRE_CSRF !== 'false',
    requireOriginValidation: process.env.REQUIRE_ORIGIN_VALIDATION !== 'false',
  };
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const errors: string[] = [];
  
  if (config.allowedOrigins.length === 0) {
    errors.push('At least one allowed origin must be specified');
  }
  
  if (config.rateLimitWindowMs < 1000) {
    errors.push('Rate limit window must be at least 1000ms');
  }
  
  if (config.rateLimitMaxRequests < 1) {
    errors.push('Rate limit max requests must be at least 1');
  }
  
  if (config.sessionTimeoutMs < 60000) {
    errors.push('Session timeout must be at least 60000ms (1 minute)');
  }
  
  if (config.csrfTokenExpiryMs < 300000) {
    errors.push('CSRF token expiry must be at least 300000ms (5 minutes)');
  }
  
  if (config.maxFileSize < 1024) {
    errors.push('Max file size must be at least 1024 bytes');
  }
  
  if (config.allowedFileTypes.length === 0) {
    errors.push('At least one allowed file type must be specified');
  }
  
  return errors;
}

/**
 * Get security headers configuration
 */
export function getSecurityHeaders(): Record<string, string> {
  const config = getSecurityConfig();
  
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
  
  if (config.enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  if (config.enableCSP) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss:",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  return headers;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const config = getSecurityConfig();
  
  // Check if origin is in allowed list
  if (config.allowedOrigins.includes(origin)) return true;
  
  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    return origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:');
  }
  
  return false;
}

/**
 * Generate secure random string
 */
export function generateSecureString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize file type for security
 */
export function isFileTypeAllowed(mimeType: string): boolean {
  const config = getSecurityConfig();
  return config.allowedFileTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function isFileSizeAllowed(size: number): boolean {
  const config = getSecurityConfig();
  return size <= config.maxFileSize;
}
