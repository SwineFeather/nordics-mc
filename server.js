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
});
