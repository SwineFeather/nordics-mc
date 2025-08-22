// Configuration file for Nordics MC
// Environment variables are now used for sensitive data

const config = {
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  },
  storage: {
    wiki: 'wiki',
    nation_town_images: 'nation_town_images',
    minecraft: 'minecraft',
    ai-docs: 'ai-docs',
  },
  server: {
    port: process.env.PORT || 24532
  }
};

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] && !process.env[`VITE_${varName}`]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please set these variables in your .env file or environment');
  process.exit(1);
}

module.exports = config;
  