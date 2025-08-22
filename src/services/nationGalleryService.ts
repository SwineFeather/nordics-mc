import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageStorageService } from './imageStorageService';
import { NationCollaborationService } from './nationCollaborationService';

export interface NationPhoto {
  id: string;
  nation_name: string;
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
  nation_name: string;
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

export class NationGalleryService {
  /**
   * Convert old custom domain URLs to Supabase URLs
   */
  private static convertToSupabaseUrl(oldUrl: string): string {
    // If the URL contains the old custom domain, convert it to Supabase URL
    if (oldUrl.includes('storage.nordics.world')) {
      const pathMatch = oldUrl.match(/\/nation-town-images\/(.+)$/);
      if (pathMatch) {
        const storagePath = pathMatch[1];
        const { data } = supabase.storage
          .from('nation-town-images')
          .getPublicUrl(storagePath);
        return data.publicUrl;
      }
    }
    return oldUrl;
  }

  /**
   * Check if a user has permissions to manage the nation gallery
   */
  static async checkGalleryPermissions(nationName: string, userId: string): Promise<GalleryPermissions> {
    try {
      // Use the collaboration service to check permissions
      const permissions = await NationCollaborationService.checkCollaborationPermissions(nationName, userId);
      
      return {
        canUpload: permissions.canUpload,
        canDelete: permissions.canDelete,
        canApprove: permissions.canApprove
      };

    } catch (error) {
      console.error('Error checking gallery permissions:', error);
      return {
        canUpload: false,
        canDelete: false,
        canApprove: false,
        reason: 'Error checking permissions'
      };
    }
  }

  /**
   * Upload a photo to nation gallery
   */
  static async uploadPhoto(uploadData: UploadPhotoData, userId: string): Promise<NationPhoto> {
    try {
      console.log('Starting photo upload for nation:', uploadData.nation_name);
      
      // Check permissions first
      const permissions = await this.checkGalleryPermissions(uploadData.nation_name, userId);
      if (!permissions.canUpload) {
        throw new Error(permissions.reason || 'Not authorized to upload photos');
      }

      // Check photo limit (max 10 photos per nation)
      const existingPhotos = await this.getNationPhotos(uploadData.nation_name);
      if (existingPhotos.length >= 10) {
        throw new Error('This nation has reached the maximum limit of 10 photos. Please delete some existing photos before uploading new ones.');
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
      const storagePath = `nations/${uploadData.nation_name.toLowerCase()}/gallery/${fileName}`;

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

      // Insert photo record into database
      const { data: photo, error: insertError } = await supabase
        .from('nation_gallery')
        .insert({
          nation_name: uploadData.nation_name,
          title: uploadData.title,
          description: uploadData.description,
          file_path: storagePath,
          file_url: publicUrl,
          file_size: uploadData.file.size,
          file_type: uploadData.file.type,
          width: dimensions.width,
          height: dimensions.height,
          tags: uploadData.tags || [],
          uploaded_by: userId,
          uploaded_by_username: profile.minecraft_username
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('nation-town-images')
          .remove([storagePath]);
        throw new Error(`Failed to save photo record: ${insertError.message}`);
      }

      console.log('Photo uploaded successfully:', photo);
      toast.success('Photo uploaded successfully!');
      return photo;

    } catch (error) {
      console.error('Error in uploadPhoto:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
      throw error;
    }
  }

  /**
   * Get all photos for a nation
   */
  static async getNationPhotos(nationName: string): Promise<NationPhoto[]> {
    try {
      console.log('Getting photos for nation:', nationName);
      
      const { data: photos, error } = await supabase
        .from('nation_gallery')
        .select('*')
        .eq('nation_name', nationName)
        .eq('is_approved', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching nation photos:', error);
        return [];
      }

      // Convert old URLs to Supabase URLs
      const convertedPhotos = photos?.map(photo => ({
        ...photo,
        file_url: this.convertToSupabaseUrl(photo.file_url)
      })) || [];

      console.log(`Found ${convertedPhotos.length} photos for ${nationName}`);
      return convertedPhotos;
    } catch (error) {
      console.error('Error in getNationPhotos:', error);
      return [];
    }
  }

  /**
   * Get a single photo by ID
   */
  static async getPhotoById(photoId: string): Promise<NationPhoto | null> {
    try {
      const { data: photo, error } = await supabase
        .from('nation_gallery')
        .select('*')
        .eq('id', photoId)
        .single();

      if (error) {
        console.error('Error fetching photo:', error);
        return null;
      }

      return {
        ...photo,
        file_url: this.convertToSupabaseUrl(photo.file_url)
      };
    } catch (error) {
      console.error('Error in getPhotoById:', error);
      return null;
    }
  }

  /**
   * Update a photo
   */
  static async updatePhoto(photoId: string, updates: Partial<NationPhoto>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nation_gallery')
        .update(updates)
        .eq('id', photoId);

      if (error) {
        console.error('Error updating photo:', error);
        return false;
      }

      toast.success('Photo updated successfully!');
      return true;
    } catch (error) {
      console.error('Error in updatePhoto:', error);
      toast.error('Failed to update photo');
      return false;
    }
  }

  /**
   * Delete a photo
   */
  static async deletePhoto(photoId: string): Promise<boolean> {
    try {
      // Get photo details first
      const photo = await this.getPhotoById(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('nation-town-images')
        .remove([photo.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('nation_gallery')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return false;
      }

      toast.success('Photo deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error in deletePhoto:', error);
      toast.error('Failed to delete photo');
      return false;
    }
  }

  /**
   * Search photos by title, description, or tags
   */
  static async searchPhotos(nationName: string, query: string): Promise<NationPhoto[]> {
    try {
      const { data: photos, error } = await supabase
        .from('nation_gallery')
        .select('*')
        .eq('nation_name', nationName)
        .eq('is_approved', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error searching photos:', error);
        return [];
      }

      // Convert old URLs to Supabase URLs
      const convertedPhotos = photos?.map(photo => ({
        ...photo,
        file_url: this.convertToSupabaseUrl(photo.file_url)
      })) || [];

      return convertedPhotos;
    } catch (error) {
      console.error('Error in searchPhotos:', error);
      return [];
    }
  }

  /**
   * Increment view count for a photo
   */
  static async incrementViewCount(photoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nation_gallery')
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', photoId);

      if (error) {
        console.error('Error incrementing view count:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
      return false;
    }
  }

  /**
   * Get image dimensions from a file
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 }); // Default fallback
      };
      img.src = URL.createObjectURL(file);
    });
  }
}
