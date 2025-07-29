import { supabase } from '@/integrations/supabase/client';

export interface TownPhoto {
  id: string;
  town_name: string;
  title: string;
  description?: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  width?: number;
  height?: number;
  tags: string[];
  uploaded_by?: string;
  uploaded_by_username: string;
  uploaded_at: string;
  is_approved: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface UploadPhotoData {
  town_name: string;
  title: string;
  description?: string;
  tags?: string[];
  file: File;
}

export interface TownGalleryPermissions {
  canUpload: boolean;
  canDelete: boolean;
  canManage: boolean;
  reason?: string;
}

// Simple in-memory storage for development
const photoStorage = new Map<string, TownPhoto[]>();
const photoMetadata = new Map<string, TownPhoto>();

export class TownGalleryService {
  /**
   * Get all photos for a town
   */
  static async getTownPhotos(townName: string): Promise<TownPhoto[]> {
    try {
      console.log('Getting photos for town:', townName);
      
      // Return photos from memory storage
      const photos = photoStorage.get(townName) || [];
      console.log(`Found ${photos.length} photos for ${townName}`);
      return photos;
    } catch (error) {
      console.error('Error in getTownPhotos:', error);
      return [];
    }
  }

  /**
   * Get a single photo by ID
   */
  static async getPhoto(photoId: string): Promise<TownPhoto | null> {
    try {
      return photoMetadata.get(photoId) || null;
    } catch (error) {
      console.error('Error in getPhoto:', error);
      return null;
    }
  }

  /**
   * Check user permissions for town gallery
   */
  static async checkGalleryPermissions(townName: string, userId: string): Promise<TownGalleryPermissions> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('minecraft_username')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return {
          canUpload: false,
          canDelete: false,
          canManage: false,
          reason: 'User profile not found'
        };
      }

      // For now, allow all authenticated users to upload/manage
      // In production, you'd check town membership, mayor status, etc.
      return {
        canUpload: true,
        canDelete: true,
        canManage: true
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        canUpload: false,
        canDelete: false,
        canManage: false,
        reason: 'Error checking permissions'
      };
    }
  }

  /**
   * Upload a photo to town gallery
   */
  static async uploadPhoto(uploadData: UploadPhotoData, userId: string): Promise<TownPhoto> {
    try {
      console.log('Starting photo upload for town:', uploadData.town_name);
      
      // Check permissions first
      const permissions = await this.checkGalleryPermissions(uploadData.town_name, userId);
      if (!permissions.canUpload) {
        throw new Error(permissions.reason || 'Not authorized to upload photos');
      }

      // Check photo limit (max 10 photos per town)
      const existingPhotos = photoStorage.get(uploadData.town_name) || [];
      if (existingPhotos.length >= 10) {
        throw new Error('This town has reached the maximum limit of 10 photos. Please delete some existing photos before uploading new ones.');
      }

      // Get user profile for username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('minecraft_username')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Generate unique filename and ID
      const timestamp = Date.now();
      const fileExtension = uploadData.file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}.${fileExtension}`;
      const photoId = `photo_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      const filePath = `towns/${uploadData.town_name.toLowerCase()}/${fileName}`;

      console.log('Processing file:', fileName);

      // Convert file to base64 for storage
      const base64Data = await this.fileToBase64(uploadData.file);
      const dataUrl = `data:${uploadData.file.type};base64,${base64Data}`;

      // Get image dimensions
      const dimensions = await this.getImageDimensions(dataUrl);

      // Create photo object
      const photo: TownPhoto = {
        id: photoId,
        town_name: uploadData.town_name,
        title: uploadData.title,
        description: uploadData.description || null,
        file_path: filePath,
        file_url: dataUrl,
        file_size: uploadData.file.size,
        file_type: uploadData.file.type,
        width: dimensions.width,
        height: dimensions.height,
        tags: uploadData.tags || [],
        uploaded_by: userId,
        uploaded_by_username: profile.minecraft_username || 'Unknown',
        is_approved: true,
        view_count: 0,
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in memory
      const townPhotos = photoStorage.get(uploadData.town_name) || [];
      townPhotos.push(photo);
      photoStorage.set(uploadData.town_name, townPhotos);
      photoMetadata.set(photoId, photo);

      console.log('Photo uploaded successfully:', photo);
      return photo;

    } catch (error) {
      console.error('Error in uploadPhoto:', error);
      throw error;
    }
  }

  /**
   * Delete a photo from town gallery
   */
  static async deletePhoto(photoId: string, userId: string): Promise<void> {
    try {
      // Get photo data first
      const photo = await this.getPhoto(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Check permissions
      const permissions = await this.checkGalleryPermissions(photo.town_name, userId);
      if (!permissions.canDelete) {
        throw new Error(permissions.reason || 'Not authorized to delete photos');
      }

      // Remove from memory storage
      const townPhotos = photoStorage.get(photo.town_name) || [];
      const updatedPhotos = townPhotos.filter(p => p.id !== photoId);
      photoStorage.set(photo.town_name, updatedPhotos);
      photoMetadata.delete(photoId);

      console.log('Photo deleted successfully:', photoId);

    } catch (error) {
      console.error('Error in deletePhoto:', error);
      throw error;
    }
  }

  /**
   * Update photo metadata
   */
  static async updatePhoto(photoId: string, updates: Partial<Pick<TownPhoto, 'title' | 'description' | 'tags'>>, userId: string): Promise<TownPhoto> {
    try {
      // Get photo data first
      const photo = await this.getPhoto(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Check permissions
      const permissions = await this.checkGalleryPermissions(photo.town_name, userId);
      if (!permissions.canManage) {
        throw new Error(permissions.reason || 'Not authorized to edit photos');
      }

      // Update photo in memory
      const updatedPhoto = { ...photo, ...updates, updated_at: new Date().toISOString() };
      photoMetadata.set(photoId, updatedPhoto);

      // Update in town storage
      const townPhotos = photoStorage.get(photo.town_name) || [];
      const updatedTownPhotos = townPhotos.map(p => p.id === photoId ? updatedPhoto : p);
      photoStorage.set(photo.town_name, updatedTownPhotos);

      console.log('Photo updated successfully:', updatedPhoto);
      return updatedPhoto;

    } catch (error) {
      console.error('Error in updatePhoto:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a photo
   */
  static async incrementViewCount(photoId: string): Promise<void> {
    try {
      const photo = photoMetadata.get(photoId);
      if (photo) {
        photo.view_count += 1;
        photoMetadata.set(photoId, photo);
        
        // Update in town storage
        const townPhotos = photoStorage.get(photo.town_name) || [];
        const updatedTownPhotos = townPhotos.map(p => p.id === photoId ? photo : p);
        photoStorage.set(photo.town_name, updatedTownPhotos);
      }
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
    }
  }

  /**
   * Search photos by tags or title
   */
  static async searchPhotos(townName: string, query: string): Promise<TownPhoto[]> {
    try {
      const photos = photoStorage.get(townName) || [];
      const lowerQuery = query.toLowerCase();
      
      return photos.filter(photo => 
        photo.title.toLowerCase().includes(lowerQuery) ||
        (photo.description && photo.description.toLowerCase().includes(lowerQuery)) ||
        photo.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error in searchPhotos:', error);
      return [];
    }
  }

  /**
   * Get photos by user
   */
  static async getUserPhotos(userId: string): Promise<TownPhoto[]> {
    try {
      const allPhotos: TownPhoto[] = [];
      photoStorage.forEach(photos => {
        allPhotos.push(...photos.filter(photo => photo.uploaded_by === userId));
      });
      return allPhotos;
    } catch (error) {
      console.error('Error in getUserPhotos:', error);
      return [];
    }
  }

  /**
   * Helper function to convert file to base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Helper function to get image dimensions
   */
  private static getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 }); // fallback dimensions
      };
      img.src = dataUrl;
    });
  }

  /**
   * Test function to check if service is working
   */
  static async testService(): Promise<any> {
    try {
      console.log('Testing town gallery service...');
      
      // Test 1: Check if user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('minecraft_username')
        .limit(1)
        .single();

      console.log('Profile check:', { profile, error: profileError });

      // Test 2: Check memory storage
      console.log('Memory storage check:', {
        photoStorageSize: photoStorage.size,
        photoMetadataSize: photoMetadata.size
      });

      return { 
        success: true, 
        message: 'Service is working',
        profile: profile?.minecraft_username || 'No profile found',
        storage: {
          photoStorageSize: photoStorage.size,
          photoMetadataSize: photoMetadata.size
        }
      };

    } catch (error) {
      console.error('Service test failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Clear all stored data (for testing)
   */
  static clearAllData(): void {
    photoStorage.clear();
    photoMetadata.clear();
    console.log('All gallery data cleared');
  }
} 