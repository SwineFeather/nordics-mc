/**
 * Secure Configuration Manager
 * Handles environment variables and configuration validation
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  security: {
    sessionSecret: string;
    csrfSecret: string;
    allowedOrigins: string[];
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = import.meta.env[key] || process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

/**
 * Get environment variable as number
 */
function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = getEnvVar(key, false);
  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? defaultValue : numValue;
}

/**
 * Get environment variable as array
 */
function getEnvVarAsArray(key: string, defaultValue: string[]): string[] {
  const value = getEnvVar(key, false);
  return value ? value.split(',').map(s => s.trim()) : defaultValue;
}

/**
 * Validate Supabase configuration
 */
function validateSupabaseConfig(config: Config): void {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Invalid Supabase configuration');
  }
  
  // Validate URL format
  try {
    new URL(config.supabase.url);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }
  
  // Validate anon key format (basic JWT format check)
  if (!config.supabase.anonKey.includes('.')) {
    throw new Error('Invalid Supabase anon key format');
  }
}

/**
 * Validate security configuration
 */
function validateSecurityConfig(config: Config): void {
  if (!config.security.sessionSecret || config.security.sessionSecret.length < 32) {
    throw new Error('Session secret must be at least 32 characters long');
  }
  
  if (!config.security.csrfSecret || config.security.csrfSecret.length < 32) {
    throw new Error('CSRF secret must be at least 32 characters long');
  }
  
  if (config.security.allowedOrigins.length === 0) {
    throw new Error('At least one allowed origin must be specified');
  }
}

/**
 * Get validated configuration
 */
export function getConfig(): Config {
  const config: Config = {
    supabase: {
      url: getEnvVar('VITE_SUPABASE_URL'),
      anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    },
    security: {
      sessionSecret: getEnvVar('SESSION_SECRET', false) || generateRandomSecret(32),
      csrfSecret: getEnvVar('CSRF_SECRET', false) || generateRandomSecret(32),
      allowedOrigins: getEnvVarAsArray('ALLOWED_ORIGINS', ['http://localhost:3000']),
      maxFileSize: getEnvVarAsNumber('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB default
      allowedFileTypes: getEnvVarAsArray('ALLOWED_FILE_TYPES', [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]),
    },
    server: {
      port: getEnvVarAsNumber('PORT', 3000),
      nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
    },
    rateLimit: {
      windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 60000),
      maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    },
  };

  // Validate configuration
  validateSupabaseConfig(config);
  validateSecurityConfig(config);

  return config;
}

/**
 * Generate a random secret string
 */
function generateRandomSecret(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getConfig().server.nodeEnv === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getConfig().server.nodeEnv === 'production';
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  return getConfig().security.allowedOrigins;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const config = getConfig();
  
  if (file.size > config.security.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.security.maxFileSize / (1024 * 1024)}MB`
    };
  }
  
  if (!config.security.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.security.allowedFileTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}
