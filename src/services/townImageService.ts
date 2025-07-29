import { supabase } from '@/integrations/supabase/client';
import { ImageStorageService } from './imageStorageService';
import { toast } from 'sonner';

export interface TownImageUpdate {
  townId: string;
  imageUrl: string;
}

export class TownImageService {
  /**
   * Update the image URL for a town
   * Only town mayors, co-mayors and admins/moderators can update town images
   */
  static async updateTownImage(townId: string, externalImageUrl: string): Promise<boolean> {
    try {
      console.log(`Updating town image for town ${townId} with URL: ${externalImageUrl}`);

      // Validate the image URL
      if (!this.isValidImageUrl(externalImageUrl)) {
        toast.error('Please provide a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp)');
        return false;
      }

      // Get the town data to get the name
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('name')
        .eq('id', townId)
        .single();

      if (townError || !town) {
        toast.error('Town not found');
        return false;
      }

      // Update the town's image_url with the direct external URL
      const { data, error } = await supabase
        .from('towns')
        .update({
          image_url: externalImageUrl
        })
        .eq('id', townId)
        .select()
        .single();

      if (error) {
        console.error('Error updating town image:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this town\'s image. Only town mayors and staff can update town images.');
        } else {
          toast.error('Failed to update town image. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Town not found');
        return false;
      }

      toast.success('Town image updated successfully!');
      console.log('Town image updated successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in updateTownImage:', error);
      toast.error('An unexpected error occurred while updating the town image');
      return false;
    }
  }

  /**
   * Upload a file and update the town's image
   * Only town mayors, co-mayors and admins/moderators can update town images
   */
  static async uploadTownImageFile(townId: string, file: File): Promise<boolean> {
    try {
      console.log(`Uploading image file for town ${townId}`);

      // Get the town data to get the name
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('name')
        .eq('id', townId)
        .single();

      if (townError || !town) {
        toast.error('Town not found');
        return false;
      }

      // Upload file to storage and get direct Supabase URL
      const imageUrl = await ImageStorageService.uploadFile(file, town.name, 'town');

      // Update the town's image_url with the direct Supabase storage URL
      const { data, error } = await supabase
        .from('towns')
        .update({
          image_url: imageUrl
        })
        .eq('id', townId)
        .select()
        .single();

      if (error) {
        console.error('Error updating town image:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this town\'s image. Only town mayors and staff can update town images.');
        } else {
          toast.error('Failed to update town image. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Town not found');
        return false;
      }

      toast.success('Town image uploaded successfully!');
      console.log('Town image uploaded successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in uploadTownImageFile:', error);
      toast.error('An unexpected error occurred while uploading the town image');
      return false;
    }
  }

  /**
   * Get the image URL for a town
   */
  static async getTownImage(townId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('image_url')
        .eq('id', townId)
        .single();

      if (error) {
        console.error('Error fetching town image:', error);
        return null;
      }

      return data?.image_url || null;

    } catch (error) {
      console.error('Error in getTownImage:', error);
      return null;
    }
  }

  /**
   * Check if the current user can update a town's image
   */
  static async canUpdateTownImage(townId: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return false;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return false;
      }

      // Admins and moderators can update any town's image
      if (['admin', 'moderator'].includes(profile.role)) {
        return true;
      }

      // Check if user is the mayor of this town (no co_mayor column exists)
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('mayor')
        .eq('id', townId)
        .single();

      if (townError || !town) {
        return false;
      }

      return town.mayor === profile.full_name;

    } catch (error) {
      console.error('Error checking town image update permissions:', error);
      return false;
    }
  }

  /**
   * Validate that the URL is a valid image URL
   */
  private static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const pathname = urlObj.pathname.toLowerCase();
      
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Get the BlueMap-compatible URL for a town
   */
  static async getBlueMapUrl(townName: string): Promise<string> {
    // Return the BlueMap template URL
    return ImageStorageService.generateBlueMapUrl(townName, 'town');
  }

  /**
   * Get BlueMap URL template for configuration
   */
  static getBlueMapUrlTemplate(): string {
    return ImageStorageService.getBlueMapUrlTemplate('town');
  }

  /**
   * Get a proxy URL for the image (if needed for CORS or other reasons)
   * This can be used to serve images through your own domain
   */
  static getImageProxyUrl(imageUrl: string): string {
    // For now, return the original URL
    // In the future, you could implement a proxy service
    return imageUrl;
  }

  /**
   * Get the raw image URL (for right-click "Open image in new tab")
   */
  static getRawImageUrl(imageUrl: string): string {
    return imageUrl;
  }
} 