# Simple Configuration Setup

Since you can't set environment variables on bloom.host, follow these steps:

## Step 1: Edit the config.js file

1. Open the `config.js` file in your repository
2. Replace the placeholder values with your actual credentials:

```javascript
const config = {
  supabase: {
    url: 'https://your-project.supabase.co', // Your actual Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Your actual anon key
    s3SecretKey: 'your_actual_s3_secret_key_here' // Your actual S3 secret key
  },
  storage: {
    domain: 'https://your-storage-domain.com', // Your storage domain
    cdnDomain: 'https://your-cdn-domain.com' // Your CDN domain (optional)
  },
  server: {
    port: 3000
  }
};
```

## Step 2: Where to find your credentials

### Supabase URL and Keys:
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "anon public" key
4. For S3 secret key, go to "Storage" → "Settings" → "API Keys"

### Storage Domain:
- This is usually your Supabase storage URL: `https://your-project.supabase.co/storage/v1`

## Step 3: Test locally first (optional)

1. Edit the config.js file with your real credentials
2. Run `npm start` locally to make sure it works
3. Commit and push the changes
4. Deploy on bloom.host

## Step 4: Deploy

Once you've updated the config.js file:
1. Commit and push your changes to GitHub
2. Set up your bloom.host server with the settings from BLOOM_HOST_SETUP.md
3. The server will pull your updated config and work properly

## Security Note

⚠️ **Important**: The config.js file will contain your secret keys. Make sure:
- Your GitHub repository is private, OR
- You're comfortable with the keys being public
- You can regenerate the keys if needed

## Need Help?

If you don't have access to your Supabase credentials:
1. Check if you're the owner of the Supabase project
2. Ask the project owner for the credentials
3. Or create a new Supabase project for testing
