/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers to protect against
 * common web vulnerabilities and attacks.
 */

export interface SecurityHeadersConfig {
  // Content Security Policy
  enableCSP: boolean;
  cspDirectives: Record<string, string[]>;
  
  // HTTP Strict Transport Security
  enableHSTS: boolean;
  hstsMaxAge: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
  
  // Other security headers
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  
  // Rate limiting
  enableRateLimiting: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityHeadersConfig = {
  enableCSP: true,
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for some components, consider removing
      "'unsafe-eval'",   // Required for some libraries, consider removing
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'media-src': [
      "'self'",
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.github.com'
    ],
    'frame-src': [
      "'self'"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': []
  },
  
  enableHSTS: true,
  hstsMaxAge: 31536000, // 1 year
  hstsIncludeSubdomains: true,
  hstsPreload: false,
  
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  
  enableRateLimiting: true,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100
};

/**
 * Generate Content Security Policy header
 */
function generateCSPHeader(config: SecurityHeadersConfig): string {
  if (!config.enableCSP) return '';
  
  const directives = Object.entries(config.cspDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
  
  return directives;
}

/**
 * Generate HTTP Strict Transport Security header
 */
function generateHSTSHeader(config: SecurityHeadersConfig): string {
  if (!config.enableHSTS) return '';
  
  let hsts = `max-age=${config.hstsMaxAge}`;
  
  if (config.hstsIncludeSubdomains) {
    hsts += '; includeSubDomains';
  }
  
  if (config.hstsPreload) {
    hsts += '; preload';
  }
  
  return hsts;
}

/**
 * Generate Permissions Policy header
 */
function generatePermissionsPolicyHeader(config: SecurityHeadersConfig): string {
  if (!config.enablePermissionsPolicy) return '';
  
  const policies = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'encrypted-media=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'serial=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ];
  
  return policies.join(', ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: Response,
  config: SecurityHeadersConfig = defaultSecurityConfig
): Response {
  const headers = new Headers(response.headers);
  
  // Content Security Policy
  if (config.enableCSP) {
    const csp = generateCSPHeader(config);
    if (csp) {
      headers.set('Content-Security-Policy', csp);
    }
  }
  
  // HTTP Strict Transport Security
  if (config.enableHSTS) {
    const hsts = generateHSTSHeader(config);
    if (hsts) {
      headers.set('Strict-Transport-Security', hsts);
    }
  }
  
  // X-Frame-Options (prevent clickjacking)
  if (config.enableXFrameOptions) {
    headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  
  // X-Content-Type-Options (prevent MIME type sniffing)
  if (config.enableXContentTypeOptions) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  // Referrer Policy
  if (config.enableReferrerPolicy) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  // Permissions Policy
  if (config.enablePermissionsPolicy) {
    const permissions = generatePermissionsPolicyHeader(config);
    if (permissions) {
      headers.set('Permissions-Policy', permissions);
    }
  }
  
  // Additional security headers
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('X-DNS-Prefetch-Control', 'off');
  headers.set('X-Download-Options', 'noopen');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Create new response with security headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Rate limiting implementation
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: SecurityHeadersConfig;
  
  constructor(config: SecurityHeadersConfig) {
    this.config = config;
  }
  
  isRateLimited(identifier: string): boolean {
    if (!this.config.enableRateLimiting) {
      return false;
    }
    
    const now = Date.now();
    const requestData = this.requests.get(identifier);
    
    if (!requestData || now > requestData.resetTime) {
      // Reset or create new rate limit entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimitWindowMs
      });
      return false;
    }
    
    if (requestData.count >= this.config.rateLimitMaxRequests) {
      return true;
    }
    
    requestData.count++;
    return false;
  }
  
  getRemainingRequests(identifier: string): number {
    const requestData = this.requests.get(identifier);
    if (!requestData) {
      return this.config.rateLimitMaxRequests;
    }
    
    return Math.max(0, this.config.rateLimitMaxRequests - requestData.count);
  }
  
  getResetTime(identifier: string): number {
    const requestData = this.requests.get(identifier);
    return requestData?.resetTime || 0;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(identifier);
      }
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(defaultSecurityConfig);

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(
  request: Request,
  identifier: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const allowed = !rateLimiter.isRateLimited(identifier);
  const remaining = rateLimiter.getRemainingRequests(identifier);
  const resetTime = rateLimiter.getResetTime(identifier);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    rateLimiter.cleanup();
  }
  
  return { allowed, remaining, resetTime };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: Request): string {
  // Use IP address if available, fallback to user agent
  const forwardedFor = request.headers.get('X-Forwarded-For');
  const realIp = request.headers.get('X-Real-IP');
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to user agent hash (less secure but better than nothing)
  return btoa(userAgent).substring(0, 16);
}

/**
 * Security middleware for Express.js
 */
export function expressSecurityMiddleware(config: SecurityHeadersConfig = defaultSecurityConfig) {
  return (req: any, res: any, next: any) => {
    // Apply security headers
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (config.enableHSTS) {
      const hsts = generateHSTSHeader(config);
      res.set('Strict-Transport-Security', hsts);
    }
    
    if (config.enableCSP) {
      const csp = generateCSPHeader(config);
      res.set('Content-Security-Policy', csp);
    }
    
    if (config.enablePermissionsPolicy) {
      const permissions = generatePermissionsPolicyHeader(config);
      res.set('Permissions-Policy', permissions);
    }
    
    // Rate limiting
    if (config.enableRateLimiting) {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimit = rateLimitMiddleware(req as any, clientId);
      
      if (!rateLimit.allowed) {
        res.set('X-RateLimit-Limit', config.rateLimitMaxRequests.toString());
        res.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
        res.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
        
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        });
      }
      
      res.set('X-RateLimit-Limit', config.rateLimitMaxRequests.toString());
      res.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      res.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    }
    
    next();
  };
}
