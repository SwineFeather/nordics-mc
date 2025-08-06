# Security Configuration Guide

## Critical Security Fixes Applied

### 1. API Key Security
**Issue**: Hardcoded X.AI API keys were exposed in multiple files
**Fix**: All API keys are now managed through environment variables

**Files Fixed**:
- `src/components/chat/FloatingAIChat.tsx`
- `src/hooks/useMinecraftWebSocket.tsx`
- `src/services/thorMinecraftService.ts`

### 2. XSS Vulnerability Prevention
**Issue**: Unprotected `dangerouslySetInnerHTML` usage in multiple components
**Fix**: Implemented comprehensive HTML sanitization

**Files Fixed**:
- `src/components/MarkdownRenderer.tsx`
- `src/components/SimpleMarkdownRenderer.tsx`
- `src/components/forum/AdvancedPostDetail.tsx`
- `src/components/forum/CodeBlock.tsx`

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# X.AI API Configuration
# Get your API key from https://x.ai/
VITE_XAI_API_KEY=your_xai_api_key_here
```

### Security Features Implemented

1. **HTML Sanitization**: All user-generated content is sanitized using a whitelist approach
2. **API Key Management**: Centralized API key configuration with validation
3. **URL Validation**: All links are validated for safe protocols
4. **CSS Class Whitelisting**: Only allowed CSS classes are permitted
5. **Attribute Filtering**: Only safe HTML attributes are allowed

### HTML Sanitization Details

The sanitization utility (`src/utils/htmlSanitizer.ts`) provides:

- **Allowed Tags**: Whitelist of safe HTML tags (p, h1-h6, strong, em, code, pre, etc.)
- **Allowed Attributes**: Only safe attributes like `class`, `href`, `target`, `rel`
- **URL Validation**: Prevents javascript: and data: URLs
- **CSS Class Filtering**: Only Tailwind and custom classes are allowed
- **Security Headers**: External links automatically get `rel="noopener noreferrer"`

### API Key Security

- API keys are loaded from environment variables only
- Validation ensures keys are present before use
- Development warnings when keys are missing
- No hardcoded keys in source code

## Development Setup

1. Copy the environment variables to your `.env` file
2. Ensure your API keys are valid and have appropriate permissions
3. Test the application to verify all functionality works
4. Never commit `.env` files to version control

## Production Deployment

1. Set environment variables in your production environment
2. Ensure `.env` files are not included in deployment packages
3. Use secure secret management systems (AWS Secrets Manager, Azure Key Vault, etc.)
4. Regularly rotate API keys
5. Monitor API usage for unusual patterns

## Security Best Practices

1. **Never hardcode secrets** in source code
2. **Use environment variables** for all configuration
3. **Sanitize all user input** before rendering
4. **Validate URLs** and prevent dangerous protocols
5. **Implement rate limiting** for API calls
6. **Monitor for security issues** regularly
7. **Keep dependencies updated** to patch vulnerabilities

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the development team. Do not create public issues for security concerns. 