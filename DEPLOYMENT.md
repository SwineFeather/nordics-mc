# Deployment Guide

## Security Update: X.AI API Key Protection

**CRITICAL**: The X.AI API key has been moved to the backend for security. The frontend no longer exposes API keys.

## Backend Environment Variables

### Supabase Edge Functions

Set the following environment variables in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to Settings > Edge Functions
3. Add the following environment variable:

```bash
XAI_API_KEY=your_actual_xai_api_key_here
```

### How to Get Your X.AI API Key

1. Visit [https://x.ai/](https://x.ai/)
2. Sign up or log in to your account
3. Navigate to API settings
4. Generate a new API key
5. Copy the key and add it to your Supabase environment variables

## Frontend Configuration

**No frontend configuration required!** The API key is now handled securely on the backend.

### Removed from Frontend

- ❌ `VITE_XAI_API_KEY` environment variable
- ❌ Direct X.AI API calls from frontend
- ❌ API key exposure in client-side code

### New Secure Architecture

- ✅ API calls go through Supabase Edge Functions
- ✅ API key stored securely on backend
- ✅ User authentication required for AI features
- ✅ Rate limiting and usage monitoring

## Deployment Steps

1. **Set Backend Environment Variables**
   ```bash
   # In Supabase Dashboard > Settings > Edge Functions
   XAI_API_KEY=your_xai_api_key_here
   ```

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy ai-chat
   supabase functions deploy thor-minecraft
   ```

3. **Deploy Frontend**
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```

## Security Benefits

- **No API Key Exposure**: API keys are never sent to the client
- **Authentication Required**: Only authenticated users can use AI features
- **Rate Limiting**: Built-in protection against abuse
- **Usage Monitoring**: Track API usage in Supabase logs
- **Secure Communication**: All requests go through authenticated Supabase functions

## Troubleshooting

### "API key not configured" Error
- Ensure `XAI_API_KEY` is set in Supabase Edge Functions environment
- Check that the edge functions are deployed correctly

### "Unauthorized" Error
- User must be authenticated to use AI features
- Check that user is logged in to Supabase

### "AI service temporarily unavailable" Error
- Check X.AI API status
- Verify API key is valid and has sufficient credits
- Check Supabase function logs for detailed error messages

## Migration from Old System

If you were using the old system with `VITE_XAI_API_KEY`:

1. Remove `VITE_XAI_API_KEY` from your frontend environment
2. Add `XAI_API_KEY` to Supabase Edge Functions environment
3. Deploy the new edge functions
4. Update your frontend code (already done in this update)

The new system is backward compatible - existing functionality will continue to work, but now securely. 