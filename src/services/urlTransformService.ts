import { URL_TRANSFORM_CONFIG } from '@/config/urlTransform';

export interface UrlTransformConfig {
  baseUrl: string;
  placeholder: string;
  fallbackUrl?: string;
}

export class UrlTransformService {
  private static readonly DEFAULT_CONFIG = {
    baseUrl: URL_TRANSFORM_CONFIG.baseUrl,
    placeholder: '%nation%',
    fallbackUrl: URL_TRANSFORM_CONFIG.fallbackUrl
  };

  /**
   * Transform an external image URL into a predictable BlueMap-compatible URL
   */
  static transformToBlueMapUrl(
    externalUrl: string,
    entityName: string,
    entityType: 'nation' | 'town'
  ): string {
    // Clean the entity name for URL usage
    const cleanName = this.cleanNameForUrl(entityName);
    
    // Create a predictable URL that BlueMap can use
    const placeholder = entityType === 'nation' ? '%nation%' : '%town%';
    const template = `${this.DEFAULT_CONFIG.baseUrl}${entityType}s/${placeholder}`;
    
    return template.replace(placeholder, cleanName);
  }

  /**
   * Get the BlueMap URL template for configuration
   */
  static getBlueMapUrlTemplate(entityType: 'nation' | 'town'): string {
    const placeholder = entityType === 'nation' ? '%nation%' : '%town%';
    return `${this.DEFAULT_CONFIG.baseUrl}${entityType}s/${placeholder}`;
  }

  /**
   * Clean a name for use in URLs
   */
  private static cleanNameForUrl(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase(); // Convert to lowercase
  }

  /**
   * Get the original external URL from the database
   */
  static async getOriginalUrl(entityName: string, entityType: 'nation' | 'town'): Promise<string | null> {
    // This would fetch the original external URL from your database
    // For now, we'll return null and let the frontend handle it
    return null;
  }

  /**
   * Generate a proxy URL that serves the external image
   */
  static generateProxyUrl(
    externalUrl: string,
    entityName: string,
    entityType: 'nation' | 'town'
  ): string {
    const cleanName = this.cleanNameForUrl(entityName);
    const encodedExternalUrl = encodeURIComponent(externalUrl);
    
    return `${this.DEFAULT_CONFIG.baseUrl}${entityType}s/${cleanName}?url=${encodedExternalUrl}`;
  }
} 