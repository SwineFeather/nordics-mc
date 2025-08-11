// Configuration file for Nordics MC
// Edit these values with your actual Supabase credentials

const config = {
  supabase: {
    url: 'https://erdconvorgecupvavlwv.supabase.co', // Replace with your actual Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZGNvbnZvcmdlY3VwdmF2bHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODM4ODcsImV4cCI6MjA2NTE1OTg4N30.1JAp47oJDpiNmnKjpYB_tS9__0Sytk18o8dL-Dfnrdg', // Replace with your actual anon key
  },
  storage: {
    wiki: 'wiki',
    nation_town_images: 'nation_town_images',
    minecraft: 'minecraft',
    ai-docs: 'ai-docs',
  },
  server: {
    port: process.env.PORT || 3000
  }
};

module.exports = config;
