# Nordics MC Server Configuration

This directory contains the server configuration for hosting your Nordics MC React website on Bloom.host.

## Files Overview

- **`nginx/`** - Nginx web server configuration
- **`webroot/`** - Directory where your built React app will be served from
- **`start.sh`** - Script to start the nginx server
- **`deploy.sh`** - Linux/Mac deployment script
- **`deploy.bat`** - Windows deployment script

## Quick Start

### 1. Deploy Your Website

**On Windows:**
```cmd
cd server
deploy.bat
```

**On Linux/Mac:**
```bash
cd server
chmod +x deploy.sh
./deploy.sh
```

### 2. Start the Server

```bash
cd server
chmod +x start.sh
./start.sh
```

## What Each Script Does

### `deploy.sh` / `deploy.bat`
- Builds your React application (`npm run build`)
- Cleans the webroot directory
- Copies built files to `webroot/`
- Sets proper permissions

### `start.sh`
- Starts PHP-FPM (if needed)
- Starts the nginx web server
- Keeps the container running

## Nginx Configuration

The nginx configuration (`nginx/conf.d/nordics-mc.conf`) includes:

- ✅ **React Router support** - handles client-side routing
- ✅ **Static file caching** - optimizes performance
- ✅ **Security headers** - protects against vulnerabilities
- ✅ **Gzip compression** - reduces bandwidth usage
- ✅ **Proper error handling** - 404s redirect to your app

## File Structure After Deployment

```
server/
├── webroot/           # Your built React app files
│   ├── index.html
│   ├── assets/
│   └── ...
├── nginx/            # Nginx configuration
├── start.sh          # Server startup script
└── deploy.sh         # Deployment script
```

## Customization

### Change Server Name
Edit `nginx/conf.d/nordics-mc.conf` and change:
```nginx
server_name _;  # Change to your domain
```

### Add API Proxy
If you need to proxy API calls, uncomment and modify:
```nginx
location /api/ {
    proxy_pass https://your-api-endpoint.com;
    proxy_set_header Host $host;
}
```

## Troubleshooting

### Build Fails
- Make sure you're running the script from the `server` directory
- Check that `package.json` exists in the parent directory
- Verify all dependencies are installed (`npm install`)

### Server Won't Start
- Check if nginx is already running
- Verify the configuration syntax: `nginx -t`
- Check the error logs in `error.log`

### Website Not Loading
- Ensure the `webroot` directory contains your built files
- Check nginx is running and listening on port 80
- Verify the nginx configuration is loaded

## Support

For Bloom.host specific issues, check their documentation or support channels.

