export const IMAGE_STORAGE_CONFIG = {
  // Custom domain for storage (if configured)
  baseUrl: import.meta.env.VITE_STORAGE_DOMAIN || 'https://erdconvorgecupvavlwv.supabase.co',
  
  // Path where images are served from
  uploadPath: '/storage/v1/object/public',
  
  // Clean CDN domain (without Supabase path)
  cdnDomain: import.meta.env.VITE_CDN_DOMAIN || null,
  
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
  nations: `${IMAGE_STORAGE_CONFIG.baseUrl}${IMAGE_STORAGE_CONFIG.uploadPath}/${IMAGE_STORAGE_CONFIG.storageBucket}/nations/%nation%.png`,
  towns: `${IMAGE_STORAGE_CONFIG.baseUrl}${IMAGE_STORAGE_CONFIG.uploadPath}/${IMAGE_STORAGE_CONFIG.storageBucket}/towns/%town%.png`
}; 