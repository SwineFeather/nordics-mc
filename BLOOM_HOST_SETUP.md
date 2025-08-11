# Bloom.host Deployment Guide

This guide will help you deploy your Nordics MC website on bloom.host.

## Prerequisites

- A bloom.host account
- Your Supabase project credentials
- GitHub repository access

## Step 1: Configure Bloom.host Server

### Server Settings
- **Install Repo**: `https://github.com/SwineFeather/nordics-mc`
- **Username**: `SwineFeather` (if private repo)
- **Password**: `Fabel1337!` (if private repo)
- **Install Branch**: `main`
- **User Uploaded Files**: `0` (false)
- **Auto Update**: `1` (true)
- **Startup File**: `index.js`
- **Additional Node packages**: Leave empty (will be installed automatically)

### Startup Command
The startup command should be:
```bash
if [[ -d .git ]] && [[ ${AUTO_UPDATE} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install --production; fi; /usr/local/bin/node /home/container/index.js
```

## Step 2: Environment Variables

You need to set these environment variables in your bloom.host server:

### Required Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_SUPABASE_S3_SECRET_KEY` - Your Supabase S3 secret key
- `VITE_STORAGE_DOMAIN` - Your storage domain
- `VITE_CDN_DOMAIN` - Your CDN domain (optional)

### How to Set Environment Variables
1. Go to your bloom.host server dashboard
2. Navigate to the "Startup" tab
3. Add each variable in the "Environment Variables" section
4. Make sure to prefix them with `VITE_` as shown above

## Step 3: Server Startup Process

When the server starts, it will:
1. Pull the latest code from GitHub
2. Install Node.js dependencies (including Express)
3. Build the project if the `dist` folder is missing
4. Start the Express server on port 3000
5. Serve your static website files

## Step 4: Verify Deployment

After the server starts successfully:
1. Check the server logs for any errors
2. Visit your server URL to see the website
3. Test the main functionality to ensure everything works

## Troubleshooting

### Common Issues

1. **"Cannot find module '/home/container/index.js'"**
   - Make sure the startup file is set to `index.js`
   - Verify the file exists in your repository

2. **Build Errors**
   - Check that all dependencies are properly installed
   - Verify environment variables are set correctly

3. **Port Issues**
   - The server runs on port 3000 by default
   - Bloom.host will automatically handle port forwarding

4. **Environment Variable Issues**
   - Ensure all required Vite environment variables are set
   - Check that they start with `VITE_` prefix

### Server Logs
Monitor your server logs in the bloom.host dashboard to identify any issues during startup or runtime.

## File Structure

The deployment uses these key files:
- `index.js` - Express server that serves your static files
- `package.json` - Dependencies and scripts
- `dist/` - Built static files (created during build process)
- `startup.sh` - Optional startup script for additional control

## Support

If you encounter issues:
1. Check the server logs in bloom.host dashboard
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Contact bloom.host support if server-related issues persist
