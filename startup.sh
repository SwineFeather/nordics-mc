#!/bin/bash

# Nordics MC Startup Script for Hosting Panel
# This script handles the startup process when the main command can't be changed

echo "🚀 Starting Nordics MC server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Exiting."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Start the Express server
echo "🌐 Starting Express server on port 24532..."
PORT=24532 NODE_ENV=production node server.js
