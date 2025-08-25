export interface DynamicImageConfig {
  baseUrl: string;
  placeholder: string;
  fallbackUrl?: string;
  imageExtensions?: string[];
}

export class DynamicImageService {
  private static readonly DEFAULT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
  
  /**
   * Generate a dynamic image URL for a nation
   */
  static getNationImageUrl(nationName: string, config?: Partial<DynamicImageConfig>): string {
    const defaultConfig: DynamicImageConfig = {
      baseUrl: 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/nations/',
      placeholder: '%nation%',
      fallbackUrl: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Nation+Image',
      imageExtensions: this.DEFAULT_EXTENSIONS
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    // Clean the nation name for URL usage
    const cleanName = this.cleanNameForUrl(nationName);
    
    // Replace placeholder with clean name
    const imageUrl = finalConfig.baseUrl.replace(finalConfig.placeholder, cleanName);
    
    return imageUrl;
  }

  /**
   * Generate a dynamic image URL for a town
   */
  static getTownImageUrl(townName: string, config?: Partial<DynamicImageConfig>): string {
    const defaultConfig: DynamicImageConfig = {
      baseUrl: 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/towns/',
      placeholder: '%town%',
      fallbackUrl: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Town+Image',
      imageExtensions: this.DEFAULT_EXTENSIONS
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    // Clean the town name for URL usage
    const cleanName = this.cleanNameForUrl(townName);
    
    // Replace placeholder with clean name
    const imageUrl = finalConfig.baseUrl.replace(finalConfig.placeholder, cleanName);
    
    return imageUrl;
  }

  /**
   * Clean a name for use in URLs (remove spaces, special chars, etc.)
   */
  private static cleanNameForUrl(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      // Note: We don't convert to lowercase here to preserve case sensitivity for towns and nations
  }

  /**
   * Check if an image URL is accessible
   */
  static async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn(`Failed to check image existence for ${url}:`, error);
      return false;
    }
  }

  /**
   * Get the best available image URL with fallback
   */
  static async getBestImageUrl(
    primaryUrl: string | null,
    dynamicUrl: string,
    fallbackUrl?: string
  ): Promise<string> {
    // If primary URL exists, use it (skip existence check to avoid rate limiting)
    if (primaryUrl) {
      // Add cache-busting parameter to prevent browser caching issues
      const separator = primaryUrl.includes('?') ? '&' : '?';
      return `${primaryUrl}${separator}t=${Date.now()}`;
    }

    // Use fallback URL
    return fallbackUrl || 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Image';
  }

  /**
   * Get nation image with smart fallback logic
   */
  static async getNationImageWithFallback(
    nationName: string,
    customImageUrl?: string | null
  ): Promise<string> {
    const dynamicUrl = this.getNationImageUrl(nationName);
    const fallbackUrl = 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Nation+Image';
    
    return this.getBestImageUrl(customImageUrl, dynamicUrl, fallbackUrl);
  }

  /**
   * Get town image with smart fallback logic
   */
  static async getTownImageWithFallback(
    townName: string,
    customImageUrl?: string | null
  ): Promise<string> {
    const dynamicUrl = this.getTownImageUrl(townName);
    const fallbackUrl = 'https://via.placeholder.com/300x200/1e40af/ffffff?text=No+Town+Image';
    
    return this.getBestImageUrl(customImageUrl, dynamicUrl, fallbackUrl);
  }
} 