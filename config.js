// Configuration file for Nordics MC
// Edit these values with your actual Supabase credentials

const config = {
  supabase: {
    url: 'your_supabase_url_here', // Replace with your actual Supabase URL
    anonKey: 'your_supabase_anon_key_here', // Replace with your actual anon key
    s3SecretKey: 'your_supabase_s3_secret_key_here' // Replace with your actual S3 secret key
  },
  storage: {
    domain: 'your_storage_domain_here', // Replace with your storage domain
    cdnDomain: 'your_cdn_domain_here' // Replace with your CDN domain (optional)
  },
  server: {
    port: process.env.PORT || 3000
  }
};

module.exports = config;
