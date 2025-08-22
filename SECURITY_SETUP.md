# Security Setup Guide

## 🚨 CRITICAL: Immediate Actions Required

### 1. Regenerate Exposed Credentials
The following credentials were exposed in the repository and MUST be regenerated:

- **Supabase Anon Key**: Regenerate in your Supabase dashboard
- **Supabase Service Role Key**: Regenerate in your Supabase dashboard
- **Any other API keys**: Check all services for exposed keys

### 2. Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_new_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_new_supabase_anon_key_here

# Server-side Supabase Configuration
SUPABASE_URL=your_new_supabase_url_here
SUPABASE_ANON_KEY=your_new_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here

# Security Configuration
SESSION_SECRET=your_random_session_secret_here
CSRF_SECRET=your_random_csrf_secret_here

# CORS Configuration
ALLOWED_ORIGINS=https://mc.nordics.world,https://www.mc.nordics.world

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Security
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Environment
NODE_ENV=production
```

## 🔒 Security Features Implemented

### 1. Environment Variable Management
- ✅ Removed hardcoded credentials
- ✅ Added environment variable validation
- ✅ Secure fallbacks for missing variables

### 2. CORS Protection
- ✅ Restricted CORS to specific domains
- ✅ Origin validation in Edge Functions
- ✅ Configurable allowed origins

### 3. Security Headers
- ✅ Content Security Policy (CSP)
- ✅ XSS Protection
- ✅ Frame Options
- ✅ Content Type Options
- ✅ Referrer Policy

### 4. Rate Limiting
- ✅ Server-side rate limiting
- ✅ Configurable limits
- ✅ IP-based tracking

### 5. Input Validation
- ✅ HTML sanitization with DOMPurify
- ✅ Markdown sanitization
- ✅ Input length limits
- ✅ Suspicious pattern detection

## 🛡️ Additional Security Recommendations

### 1. Database Security
- Enable Row Level Security (RLS) in Supabase
- Use parameterized queries only
- Implement proper user permissions

### 2. Authentication Security
- Enable 2FA for admin accounts
- Implement session rotation
- Add login attempt monitoring

### 3. File Upload Security
- Enable virus scanning (requires external service)
- Validate file contents, not just extensions
- Implement file size limits

### 4. Monitoring & Logging
- Enable security event logging
- Monitor for suspicious activities
- Set up alerts for security events

## 🔍 Security Testing

### 1. Automated Testing
```bash
# Run security linting
npm run lint:security

# Check for vulnerable dependencies
npm audit

# Run security tests
npm run test:security
```

### 2. Manual Testing
- Test CORS with different origins
- Verify rate limiting works
- Check input sanitization
- Test authorization bypasses

## 📋 Security Checklist

- [ ] Regenerated all exposed credentials
- [ ] Created `.env` file with proper values
- [ ] Tested CORS restrictions
- [ ] Verified security headers
- [ ] Tested rate limiting
- [ ] Validated input sanitization
- [ ] Checked authorization controls
- [ ] Enabled security logging
- [ ] Set up monitoring alerts

## 🚨 Emergency Contacts

If you suspect a security breach:

1. **Immediate**: Revoke all exposed credentials
2. **Investigate**: Check logs for unauthorized access
3. **Notify**: Contact your security team
4. **Document**: Record all findings and actions taken

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Remember**: Security is an ongoing process. Regularly review and update your security measures!
