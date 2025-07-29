
export const SECURITY_CONFIG = {
  // WebSocket Security
  websocket: {
    enforceWSS: true,
    connectionTimeout: 10000,
    maxRetries: 3,
    retryDelay: 5000,
    requireAuth: true
  },

  // Authentication Security
  auth: {
    sessionTimeout: 3600, // 1 hour
    requireEmailVerification: true,
    passwordMinLength: 12, // Increased from 8
    enforcePasswordComplexity: true,
    maxLoginAttempts: 5,
    lockoutDuration: 900, // 15 minutes
    requireTwoFactor: false, // Can be enabled later
    sessionRotation: true
  },

  // Role-based Access Control
  rbac: {
    adminRoles: ['admin'],
    moderatorRoles: ['admin', 'moderator'],
    staffRoles: ['admin', 'moderator', 'helper'],
    requiredRoleForUserManagement: 'admin',
    auditAllRoleChanges: true,
    roleHierarchyEnforcement: true
  },

  // API Security
  api: {
    rateLimitRequests: 100,
    rateLimitWindow: 60000, // 1 minute
    requireAuthForAllEndpoints: true,
    validateInputs: true,
    sanitizeOutputs: true,
    enableCORS: true,
    allowedOrigins: ['https://your-domain.com'], // Update with actual domain
    maxRequestSize: '10mb'
  },

  // Input Validation
  validation: {
    enableXSSProtection: true,
    enableSQLInjectionProtection: true,
    enableCSRFProtection: true,
    sanitizeHTML: true,
    validateFileTypes: true,
    maxInputLength: {
      username: 20,
      email: 255,
      content: 10000,
      title: 200
    }
  },

  // Storage Security
  storage: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/markdown',
      'text/plain',
      'application/json'
    ],
    requireAuthForUploads: true,
    scanUploadsForMalware: false, // Would require external service
    virusScanEnabled: false,
    encryptSensitiveFiles: true
  },

  // Environment Security
  environment: {
    hideSecretsInLogs: true,
    useSeparateSecretsStore: true,
    rotateSecretsRegularly: true,
    auditSecretAccess: true,
    requireSSL: true,
    secureHeaders: true
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "wss:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true
  },

  // Monitoring & Logging
  monitoring: {
    enableSecurityLogging: true,
    logFailedLogins: true,
    logPrivilegeEscalation: true,
    logSensitiveDataAccess: true,
    alertOnSuspiciousActivity: true,
    retentionPeriodDays: 90
  }
};

export const validateSecurityConfig = () => {
  const errors: string[] = [];

  // Validate WebSocket configuration
  if (SECURITY_CONFIG.websocket.connectionTimeout < 5000) {
    errors.push('WebSocket connection timeout should be at least 5 seconds');
  }

  // Validate authentication configuration
  if (SECURITY_CONFIG.auth.passwordMinLength < 12) {
    errors.push('Password minimum length should be at least 12 characters');
  }

  // Validate storage configuration
  if (SECURITY_CONFIG.storage.maxFileSize > 50 * 1024 * 1024) {
    errors.push('Maximum file size should not exceed 50MB');
  }

  // Validate rate limiting
  if (SECURITY_CONFIG.api.rateLimitRequests > 1000) {
    errors.push('Rate limit seems too high and may not provide adequate protection');
  }

  if (errors.length > 0) {
    console.warn('Security configuration issues detected:', errors);
  }

  return errors;
};

// Initialize security configuration validation
validateSecurityConfig();
