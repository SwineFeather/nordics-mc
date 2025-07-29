export const IMAGE_STORAGE_CONFIG = {
  // Replace with your actual domain
  baseUrl: import.meta.env.VITE_SITE_URL || 'https://erdconvorgecupvavlwv.supabase.co',
  
  // Path where images are served from
  uploadPath: '/images',
  
  // Allowed domains for external image uploads
  allowedDomains: [
    'cdn.discordapp.com',
    'media.discordapp.net', 
    'i.imgur.com',
    'imgur.com',
    'images-ext-1.discordapp.net',
    'images-ext-2.discordapp.net'
  ],
  
  // Maximum file size (5MB)
  maxFileSize: 5 * 1024 * 1024,
  
  // Allowed image formats
  allowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  
  // Supabase storage bucket name
  storageBucket: 'nation-town-images' // Change this to your existing bucket name if needed
};

// BlueMap URL templates
export const BLUEMAP_URLS = {
  nations: `${IMAGE_STORAGE_CONFIG.baseUrl}${IMAGE_STORAGE_CONFIG.uploadPath}/nations/%nation%.png`,
  towns: `${IMAGE_STORAGE_CONFIG.baseUrl}${IMAGE_STORAGE_CONFIG.uploadPath}/towns/%town%.png`
}; 