import { supabase } from '@/integrations/supabase/client';
import { IMAGE_STORAGE_CONFIG } from '@/config/imageStorage';

export interface ImageStorageConfig {
  baseUrl: string;
  uploadPath: string;
  allowedDomains: string[];
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  storageBucket: string;
}

export class ImageStorageService {
  private static readonly DEFAULT_CONFIG: ImageStorageConfig = {
    baseUrl: IMAGE_STORAGE_CONFIG.baseUrl,
    uploadPath: IMAGE_STORAGE_CONFIG.uploadPath,
    allowedDomains: IMAGE_STORAGE_CONFIG.allowedDomains,
    maxFileSize: IMAGE_STORAGE_CONFIG.maxFileSize,
    allowedFormats: IMAGE_STORAGE_CONFIG.allowedFormats,
    storageBucket: IMAGE_STORAGE_CONFIG.storageBucket
  };

  /**
   * Generate a custom domain URL for a storage path
   */
  static generateCustomUrl(storagePath: string): string {
    // Always use the default Supabase URL for now to fix image loading issues
    // TODO: Re-enable custom domain support once the fallback system is properly implemented
    
    // Fallback to Supabase URL
    const { data } = supabase.storage
      .from(IMAGE_STORAGE_CONFIG.storageBucket)
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
    
    /* Original custom domain logic - commented out for now
    const customDomain = import.meta.env.VITE_STORAGE_DOMAIN;
    const cdnDomain = import.meta.env.VITE_CDN_DOMAIN;
    
    // If clean CDN domain is configured, use it without Supabase path
    if (cdnDomain) {
      return `${cdnDomain}/${IMAGE_STORAGE_CONFIG.storageBucket}/${storagePath}`;
    }
    
    // If custom domain is configured, use it with full Supabase path
    if (customDomain) {
      return `${customDomain}${IMAGE_STORAGE_CONFIG.uploadPath}/${IMAGE_STORAGE_CONFIG.storageBucket}/${storagePath}`;
    }
    
    // Fallback to Supabase URL
    const { data } = supabase.storage
      .from(IMAGE_STORAGE_CONFIG.storageBucket)
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
    */
  }

  /**
   * Download and store an image from an external URL
   */
  static async storeImageFromUrl(
    externalUrl: string,
    entityName: string,
    entityType: 'nation' | 'town' | 'company',
    config?: Partial<ImageStorageConfig>
  ): Promise<string> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    try {
      // Validate the external URL
      this.validateExternalUrl(externalUrl, finalConfig);

      // Download the image
      const imageBuffer = await this.downloadImage(externalUrl);

      // Validate file size
      if (imageBuffer.byteLength > finalConfig.maxFileSize) {
        throw new Error(`Image too large. Maximum size is ${finalConfig.maxFileSize / 1024 / 1024}MB`);
      }

      // Generate filename
      const filename = this.generateFilename(entityName, entityType);
      
      // Store in Supabase Storage
      const storagePath = `${entityType}s/${filename}`;
      const { data, error } = await supabase.storage
        .from(IMAGE_STORAGE_CONFIG.storageBucket)
        .upload(storagePath, imageBuffer, {
          contentType: this.getContentType(externalUrl),
          upsert: true
        });

      if (error) {
        throw new Error(`Failed to store image: ${error.message}`);
      }

      // Generate custom domain URL
      const publicUrl = this.generateCustomUrl(storagePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error storing image:', error);
      throw error;
    }
  }

  /**
   * Upload a file directly to storage
   */
  static async uploadFile(
    file: File,
    entityName: string,
    entityType: 'nation' | 'town' | 'company',
    config?: Partial<ImageStorageConfig>
  ): Promise<string> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    try {
      // Validate file
      this.validateFile(file, finalConfig);

      // Generate filename using just the entity name (no timestamp)
      const filename = this.generateFilename(entityName, entityType);
      
      // Store in Supabase Storage
      const storagePath = `${entityType}s/${filename}`;
      const { data, error } = await supabase.storage
        .from(IMAGE_STORAGE_CONFIG.storageBucket)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Generate custom domain URL
      const publicUrl = this.generateCustomUrl(storagePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Generate a predictable URL for BlueMap
   */
  static generateBlueMapUrl(entityName: string, entityType: 'nation' | 'town' | 'company'): string {
    const config = this.DEFAULT_CONFIG;
    const filename = this.generateFilename(entityName, entityType);
    const storagePath = `${entityType}s/${filename}`;
    
    return this.generateCustomUrl(storagePath);
  }

  /**
   * Get the current stored image URL for an entity
   */
  static async getStoredImageUrl(entityName: string, entityType: 'nation' | 'town' | 'company'): Promise<string | null> {
    try {
      const filename = this.generateFilename(entityName, entityType);
      const storagePath = `${entityType}s/${filename}`;
      
      const { data } = supabase.storage
        .from(IMAGE_STORAGE_CONFIG.storageBucket)
        .getPublicUrl(storagePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting stored image URL:', error);
      return null;
    }
  }

  /**
   * Check if an image exists for an entity
   */
  static async imageExists(entityName: string, entityType: 'nation' | 'town' | 'company'): Promise<boolean> {
    try {
      const filename = this.generateFilename(entityName, entityType);
      const storagePath = `${entityType}s/${filename}`;
      
      const { data, error } = await supabase.storage
        .from(IMAGE_STORAGE_CONFIG.storageBucket)
        .list(`${entityType}s`, {
          search: filename
        });

      if (error) {
        console.error('Error checking image existence:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking image existence:', error);
      return false;
    }
  }

  /**
   * Delete a stored image
   */
  static async deleteImage(entityName: string, entityType: 'nation' | 'town' | 'company'): Promise<boolean> {
    try {
      const filename = this.generateFilename(entityName, entityType);
      const storagePath = `${entityType}s/${filename}`;
      
      const { error } = await supabase.storage
        .from(IMAGE_STORAGE_CONFIG.storageBucket)
        .remove([storagePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Validate external URL
   */
  private static validateExternalUrl(url: string, config: ImageStorageConfig): void {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    if (!config.allowedDomains.some(allowed => domain.includes(allowed))) {
      throw new Error(`Domain ${domain} is not allowed. Allowed domains: ${config.allowedDomains.join(', ')}`);
    }

    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension || !config.allowedFormats.includes(extension)) {
      throw new Error(`File format not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`);
    }
  }

  /**
   * Validate file
   */
  private static validateFile(file: File, config: ImageStorageConfig): void {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      throw new Error(`File size must be less than ${config.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!config.allowedFormats.includes(fileExtension.substring(1))) {
      throw new Error(`File format not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`);
    }
  }

  /**
   * Download image from external URL
   */
  private static async downloadImage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Generate filename for entity
   */
  private static generateFilename(entityName: string, entityType: 'nation' | 'town' | 'company'): string {
    // Use case-preserving normalization for towns and nations to maintain their original case
    // Companies can still use lowercase for consistency
    if (entityType === 'town' || entityType === 'nation') {
      const cleanName = this.casePreservingNormalizeEntityName(entityName);
      return `${cleanName}.png`;
    } else {
      const cleanName = this.normalizeEntityName(entityName);
      return `${cleanName}.png`;
    }
  }

  /**
   * Normalize entity name for safe filename generation
   * Handles Nordic characters and other special characters
   */
  private static normalizeEntityName(name: string): string {
    // First, normalize Unicode characters (decomposes characters like å, ö, ä)
    const normalized = name.normalize('NFD');
    
    // Create a mapping for Nordic and other special characters
    const charMap: { [key: string]: string } = {
      // Nordic characters
      'å': 'a',
      'ä': 'a', 
      'ö': 'o',
      'Å': 'A',
      'Ä': 'A',
      'Ö': 'O',
      // Other common special characters
      'é': 'e',
      'è': 'e',
      'ê': 'e',
      'ë': 'e',
      'á': 'a',
      'à': 'a',
      'â': 'a',
      'ã': 'a',
      'í': 'i',
      'ì': 'i',
      'î': 'i',
      'ï': 'i',
      'ó': 'o',
      'ò': 'o',
      'ô': 'o',
      'õ': 'o',
      'ú': 'u',
      'ù': 'u',
      'û': 'u',
      'ü': 'u',
      'ý': 'y',
      'ÿ': 'y',
      'ñ': 'n',
      'ç': 'c',
      'ß': 'ss',
      // Remove diacritics (combining marks)
      '\u0300': '', // grave accent
      '\u0301': '', // acute accent
      '\u0302': '', // circumflex
      '\u0303': '', // tilde
      '\u0304': '', // macron
      '\u0306': '', // breve
      '\u0307': '', // dot above
      '\u0308': '', // diaeresis
      '\u0309': '', // hook above
      '\u030A': '', // ring above
      '\u030B': '', // double acute
      '\u030C': '', // caron
      '\u0327': '', // cedilla
      '\u0328': '', // ogonek
    };

    // Replace special characters
    let result = normalized;
    for (const [char, replacement] of Object.entries(charMap)) {
      result = result.replace(new RegExp(char, 'g'), replacement);
    }

    // Remove any remaining non-alphanumeric characters except spaces and underscores
    result = result
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    // Ensure the result is not empty
    if (!result) {
      result = 'unnamed';
    }

    return result;
  }

  /**
   * Normalize entity name for safe filename generation while preserving case
   * Handles Nordic characters and other special characters
   */
  private static casePreservingNormalizeEntityName(name: string): string {
    // First, normalize Unicode characters (decomposes characters like å, ö, ä)
    const normalized = name.normalize('NFD');
    
    // Create a mapping for Nordic and other special characters
    const charMap: { [key: string]: string } = {
      // Nordic characters
      'å': 'a',
      'ä': 'a', 
      'ö': 'o',
      'Å': 'A',
      'Ä': 'A',
      'Ö': 'O',
      // Other common special characters
      'é': 'e',
      'è': 'e',
      'ê': 'e',
      'ë': 'e',
      'á': 'a',
      'à': 'a',
      'â': 'a',
      'ã': 'a',
      'í': 'i',
      'ì': 'i',
      'î': 'i',
      'ï': 'i',
      'ó': 'o',
      'ò': 'o',
      'ô': 'o',
      'õ': 'o',
      'ú': 'u',
      'ù': 'u',
      'û': 'u',
      'ü': 'u',
      'ý': 'y',
      'ÿ': 'y',
      'ñ': 'n',
      'ç': 'c',
      'ß': 'ss',
      // Remove diacritics (combining marks)
      '\u0300': '', // grave accent
      '\u0301': '', // acute accent
      '\u0302': '', // circumflex
      '\u0303': '', // tilde
      '\u0304': '', // macron
      '\u0306': '', // breve
      '\u0307': '', // dot above
      '\u0308': '', // diaeresis
      '\u0309': '', // hook above
      '\u030A': '', // ring above
      '\u030B': '', // double acute
      '\u030C': '', // caron
      '\u0327': '', // cedilla
      '\u0328': '', // ogonek
    };

    // Replace special characters
    let result = normalized;
    for (const [char, replacement] of Object.entries(charMap)) {
      result = result.replace(new RegExp(char, 'g'), replacement);
    }

    // Remove any remaining non-alphanumeric characters except spaces and underscores
    result = result
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/\s+/g, '_');

    // Ensure the result is not empty
    if (!result) {
      result = 'unnamed';
    }

    return result;
  }

  /**
   * Generate public URL for stored image
   */
  private static generatePublicUrl(storagePath: string, config: ImageStorageConfig): string {
    return `${config.baseUrl}/storage/v1/object/public/${IMAGE_STORAGE_CONFIG.storageBucket}/${storagePath}`;
  }

  /**
   * Get content type from URL
   */
  private static getContentType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/png';
    }
  }

  /**
   * Get BlueMap URL template for configuration
   */
  static getBlueMapUrlTemplate(entityType: 'nation' | 'town'): string {
    const config = this.DEFAULT_CONFIG;
    const placeholder = entityType === 'nation' ? '%nation%' : '%town%';
    const filename = `${placeholder}.png`;
    const storagePath = `${entityType}s/${filename}`;
    
    return this.generateCustomUrl(storagePath);
  }
} 