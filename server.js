const express = require('express');
const path = require('path');
const config = require('./config');
const app = express();
const PORT = config.server.port;

console.log('Starting Nordics MC server...');
console.log('Config loaded:', {
  supabaseUrl: config.supabase.url,
  storageBuckets: config.storage,
  port: config.server.port
});

// CORS configuration - restrict to specific domains
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://www.nordics.world',
  'https://nordics.world'
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development' && origin?.startsWith('http://localhost:')) {
    // Allow localhost in development only
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Block unauthorized origins
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy - more restrictive
  const cspDirectives = [
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
  ];
  
  // Add nonce-based CSP in production
  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push("script-src 'nonce-${nonce}'");
  }
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  next();
});

// Rate limiting middleware (improved implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// Clean up expired rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const record = requestCounts.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      record.count++;
    }
    
    if (record.count > RATE_LIMIT_MAX) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
        limit: RATE_LIMIT_MAX,
        window: RATE_LIMIT_WINDOW / 1000
      });
    }
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - requestCounts.get(ip).count));
  res.setHeader('X-RateLimit-Reset', requestCounts.get(ip).resetTime);
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    config: {
      supabaseUrl: config.supabase.url,
      storageBuckets: Object.keys(config.storage)
    },
    security: {
      corsEnabled: true,
      rateLimiting: true,
      securityHeaders: true
    }
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve stats directory
app.use('/stats', express.static(path.join(__dirname, 'stats')));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔍 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Supabase URL: ${config.supabase.url}`);
  console.log(`📦 Storage buckets: ${Object.keys(config.storage).join(', ')}`);
  console.log(`🔒 Security features enabled:`);
  console.log(`   - CORS restricted to: ${allowedOrigins.join(', ')}`);
  console.log(`   - Rate limiting: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW/1000}s`);
  console.log(`   - Security headers: enabled`);
  console.log(`   - Content Security Policy: enabled`);
});
