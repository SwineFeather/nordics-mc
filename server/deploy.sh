#!/bin/bash

echo "🚀 Starting deployment of Nordics MC website..."

# Check if we're in the right directory
if [ ! -f "../package.json" ]; then
    echo "❌ Error: Please run this script from the server directory"
    echo "   Make sure you're in the server folder and the parent directory has package.json"
    exit 1
fi

echo "📦 Building React application..."
cd ..
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo "🧹 Cleaning webroot..."
rm -rf server/webroot/*

echo "📁 Copying built files to webroot..."
cp -r dist/* server/webroot/

echo "🔒 Setting proper permissions..."
chmod -R 755 server/webroot/

echo "✅ Deployment complete!"
echo "🌐 Your website is now ready to serve from the webroot directory"
echo "🚀 Start the server with: ./start.sh"

