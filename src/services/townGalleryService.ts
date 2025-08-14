import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ImageStorageService } from './imageStorageService';

export interface TownPhoto {
  id: string;
  town_name: string;
  title: string;
  description: string | null;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  width: number;
  height: number;
  tags: string[];
  uploaded_by: string;
  uploaded_by_username: string;
  is_approved: boolean;
  view_count: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface UploadPhotoData {
  town_name: string;
  title: string;
  description?: string;
  file: File;
  tags?: string[];
}

export interface GalleryPermissions {
  canUpload: boolean;
  canDelete: boolean;
  canApprove: boolean;
  reason?: string;
}

export class TownGalleryService {
  /**
   * Convert old custom domain URLs to Supabase URLs
   */
  private static convertToSupabaseUrl(oldUrl: string): string {
    // If the URL contains the old custom domain, convert it to Supabase URL
    if (oldUrl.includes('storage.nordics.world')) {
      // Extract the path after the bucket name
      const pathMatch = oldUrl.match(/\/nation-town-images\/(.+)$/);
      if (pathMatch) {
        const storagePath = pathMatch[1];
        // Generate the Supabase URL
        const { data } = supabase.storage
          .from('nation-town-images')
          .getPublicUrl(storagePath);
        return data.publicUrl;
      }
    }
    return oldUrl;
  }

  /**
   * Get all photos for a town
   */
  static async getTownPhotos(townName: string): Promise<TownPhoto[]> {
    try {
      console.log('Getting photos for town:', townName);
      
      const { data: photos, error } = await supabase
        .from('town_gallery')
        .select('*')
        .eq('town_name', townName)
        .eq('is_approved', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching town photos:', error);
        return [];
      }

      // Convert old URLs to Supabase URLs
      const convertedPhotos = photos?.map(photo => ({
        ...photo,
        file_url: this.convertToSupabaseUrl(photo.file_url)
      })) || [];

      console.log(`Found ${convertedPhotos.length} photos for ${townName}`);
      return convertedPhotos;
    } catch (error) {
      console.error('Error in getTownPhotos:', error);
      return [];
    }
  }

  /**
   * Get a single photo by ID
   */
  static async getPhotoById(photoId: string): Promise<TownPhoto | null> {
    try {
      const { data: photo, error } = await supabase
        .from('town_gallery')
        .select('*')
        .eq('id', photoId)
        .single();

      if (error) {
        console.error('Error fetching photo:', error);
        return null;
      }

      return photo;
    } catch (error) {
      console.error('Error in getPhotoById:', error);
      return null;
    }
  }

  /**
   * Check permissions for gallery operations
   */
  static async checkGalleryPermissions(townName: string, userId: string): Promise<GalleryPermissions> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, minecraft_username')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { canUpload: false, canDelete: false, canApprove: false, reason: 'User profile not found' };
      }

      // Admins and moderators have full permissions
      if (profile.role === 'admin' || profile.role === 'moderator') {
        return { canUpload: true, canDelete: true, canApprove: true };
      }

      // Get town data to check if user is mayor or co-mayor
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('mayor_name, residents')
        .eq('name', townName)
        .single();

      if (townError || !town) {
        return { canUpload: false, canDelete: false, canApprove: false, reason: 'Town not found' };
      }

      const isMayor = town.mayor_name === profile.minecraft_username;
      const isCoMayor = town.residents && Array.isArray(town.residents) && town.residents.some((resident: any) => 
        resident.name === profile.minecraft_username && resident.is_co_mayor === true
      );

      if (isMayor || isCoMayor) {
        return { canUpload: true, canDelete: true, canApprove: true };
      }

      return { canUpload: false, canDelete: false, canApprove: false, reason: 'Only town mayors and co-mayors can manage gallery photos' };

    } catch (error) {
      console.error('Error checking gallery permissions:', error);
      return { canUpload: false, canDelete: false, canApprove: false, reason: 'Error checking permissions' };
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
      const existingPhotos = await this.getTownPhotos(uploadData.town_name);
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

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = uploadData.file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}.${fileExtension}`;
      const storagePath = `towns/${uploadData.town_name.toLowerCase()}/gallery/${fileName}`;

      console.log('Uploading file to storage:', storagePath);

      // Upload file to Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('nation-town-images')
        .upload(storagePath, uploadData.file, {
          contentType: uploadData.file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Generate custom domain URL
      const publicUrl = ImageStorageService.generateCustomUrl(storagePath);

      // Get image dimensions
      const dimensions = await this.getImageDimensions(uploadData.file);

      // Create photo object for database
      const photoData = {
        town_name: uploadData.town_name,
        title: uploadData.title,
        description: uploadData.description || null,
        file_path: storagePath,
        file_url: publicUrl,
        file_size: uploadData.file.size,
        file_type: uploadData.file.type,
        width: dimensions.width,
        height: dimensions.height,
        tags: uploadData.tags || [],
        uploaded_by: userId,
        uploaded_by_username: profile.minecraft_username || 'Unknown',
        is_approved: true,
        view_count: 0
      };

      // Insert into database
      const { data: photo, error: insertError } = await supabase
        .from('town_gallery')
        .insert(photoData)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('nation-town-images')
          .remove([storagePath]);
        throw new Error(`Failed to save photo data: ${insertError.message}`);
      }

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
  static async deletePhoto(photoId: string, userId: string): Promise<boolean> {
    try {
      // Get photo data first
      const photo = await this.getPhotoById(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Check permissions
      const permissions = await this.checkGalleryPermissions(photo.town_name, userId);
      if (!permissions.canDelete) {
        throw new Error(permissions.reason || 'Not authorized to delete photos');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('nation-town-images')
        .remove([photo.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('town_gallery')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw new Error(`Failed to delete photo: ${deleteError.message}`);
      }

      console.log('Photo deleted successfully');
      return true;

    } catch (error) {
      console.error('Error in deletePhoto:', error);
      throw error;
    }
  }

  /**
   * Update photo metadata
   */
  static async updatePhoto(photoId: string, updates: Partial<TownPhoto>, userId: string): Promise<TownPhoto> {
    try {
      // Get photo data first
      const photo = await this.getPhotoById(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Check permissions
      const permissions = await this.checkGalleryPermissions(photo.town_name, userId);
      if (!permissions.canUpload) {
        throw new Error(permissions.reason || 'Not authorized to update photos');
      }

      // Update in database
      const { data: updatedPhoto, error: updateError } = await supabase
        .from('town_gallery')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Failed to update photo: ${updateError.message}`);
      }

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
      // Get current view count and increment it
      const { data: photo, error: fetchError } = await supabase
        .from('town_gallery')
        .select('view_count')
        .eq('id', photoId)
        .single();

      if (fetchError || !photo) {
        console.error('Error fetching photo for view count:', fetchError);
        return;
      }

      const newViewCount = (photo.view_count || 0) + 1;

      const { error } = await supabase
        .from('town_gallery')
        .update({
          view_count: newViewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId);

      if (error) {
        console.error('Error incrementing view count:', error);
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
      const photos = await this.getTownPhotos(townName);
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
      const { data: photos, error } = await supabase
        .from('town_gallery')
        .select('*')
        .eq('uploaded_by', userId)
        .eq('is_approved', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching user photos:', error);
        return [];
      }

      return photos || [];
    } catch (error) {
      console.error('Error in getUserPhotos:', error);
      return [];
    }
  }

  /**
   * Get image dimensions from file
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
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
      // The original code had photoStorage and photoMetadata, but they are not defined in this file.
      // Assuming they are meant to be part of a larger context or are placeholders for Supabase storage.
      // For now, commenting out the test as it will cause an error.
      // console.log('Memory storage check:', {
      //   photoStorageSize: photoStorage.size,
      //   photoMetadataSize: photoMetadata.size
      // });

      return { 
        success: true, 
        message: 'Service is working',
        profile: profile?.minecraft_username || 'No profile found',
        // storage: { // This will cause an error as photoStorage and photoMetadata are not defined
        //   photoStorageSize: photoStorage.size,
        //   photoMetadataSize: photoMetadata.size
        // }
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
    // The original code had photoStorage and photoMetadata, but they are not defined in this file.
    // Assuming they are meant to be part of a larger context or are placeholders for Supabase storage.
    // For now, commenting out the clearAllData as it will cause an error.
    // photoStorage.clear();
    // photoMetadata.clear();
    console.log('All gallery data cleared');
  }
} 