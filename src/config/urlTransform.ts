export const URL_TRANSFORM_CONFIG = {
  // Use production URL for now to avoid connection issues
  baseUrl: 'https://erdconvorgecupvavlwv.supabase.co/functions/v1/serve-image/',
  
  // Allowed domains for external image uploads
  allowedDomains: [
    'cdn.discordapp.com',
    'media.discordapp.net', 
    'i.imgur.com',
    'imgur.com',
    'images-ext-1.discordapp.net',
    'images-ext-2.discordapp.net'
  ],
  
  // Allowed image formats
  allowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  
  // Fallback image URL
  fallbackUrl: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Image'
};

// BlueMap URL templates
export const BLUEMAP_URLS = {
  nations: `${URL_TRANSFORM_CONFIG.baseUrl}nations/%nation%`,
  towns: `${URL_TRANSFORM_CONFIG.baseUrl}towns/%town%`
}; 