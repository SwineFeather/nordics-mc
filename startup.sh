#!/bin/bash

echo "Starting Nordics MC server setup..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project if dist folder doesn't exist or is empty
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "Build failed! Exiting..."
        exit 1
    fi
    echo "Build completed successfully!"
else
    echo "Using existing build files..."
fi

# Start the server
echo "Starting server..."
npm start
