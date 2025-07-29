import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UrlTransformService } from './urlTransformService';
import { ImageStorageService } from './imageStorageService';

export interface NationImageUpdate {
  nationId: string;
  imageUrl: string;
}

export class NationImageService {
  /**
   * Update the image URL for a nation
   * Only nation leaders and admins/moderators can update nation images
   */
  static async updateNationImage(nationId: string, externalImageUrl: string): Promise<boolean> {
    try {
      console.log(`Updating nation image for nation ${nationId} with URL: ${externalImageUrl}`);

      // Validate the image URL
      if (!this.isValidImageUrl(externalImageUrl)) {
        toast.error('Please provide a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp)');
        return false;
      }

      // Get the nation data to get the name
      const { data: nation, error: nationError } = await supabase
        .from('nations')
        .select('name')
        .eq('id', nationId)
        .single();

      if (nationError || !nation) {
        toast.error('Nation not found');
        return false;
      }

      // Update the nation's image_url with the direct external URL
      const { data, error } = await supabase
        .from('nations')
        .update({
          image_url: externalImageUrl
        })
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation image:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this nation\'s image. Only nation leaders and staff can update nation images.');
        } else {
          toast.error('Failed to update nation image. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Nation not found');
        return false;
      }

      toast.success('Nation image updated successfully! The image has been stored on our server for BlueMap compatibility.');
      console.log('Nation image updated successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in updateNationImage:', error);
      toast.error('An unexpected error occurred while updating the nation image');
      return false;
    }
  }

  /**
   * Upload a file and update the nation's image
   * Only nation leaders and admins/moderators can update nation images
   */
  static async uploadNationImageFile(nationId: string, file: File): Promise<boolean> {
    try {
      console.log(`Uploading image file for nation ${nationId}`);

      // Get the nation data to get the name
      const { data: nation, error: nationError } = await supabase
        .from('nations')
        .select('name')
        .eq('id', nationId)
        .single();

      if (nationError || !nation) {
        toast.error('Nation not found');
        return false;
      }

      // Upload file to storage and get direct Supabase URL
      const imageUrl = await ImageStorageService.uploadFile(file, nation.name, 'nation');

      // Update the nation's image_url with the direct Supabase storage URL
      const { data, error } = await supabase
        .from('nations')
        .update({
          image_url: imageUrl
        })
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation image:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this nation\'s image. Only nation leaders and staff can update nation images.');
        } else {
          toast.error('Failed to update nation image. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Nation not found');
        return false;
      }

      toast.success('Nation image uploaded successfully! The image has been stored on our server for BlueMap compatibility.');
      console.log('Nation image uploaded successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in uploadNationImageFile:', error);
      toast.error('An unexpected error occurred while uploading the nation image');
      return false;
    }
  }

  /**
   * Get the image URL for a nation
   */
  static async getNationImage(nationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('nations')
        .select('image_url')
        .eq('id', nationId)
        .single();

      if (error) {
        console.error('Error fetching nation image:', error);
        return null;
      }

      return data?.image_url || null;

    } catch (error) {
      console.error('Error in getNationImage:', error);
      return null;
    }
  }

  /**
   * Check if the current user can update a nation's image
   */
  static async canUpdateNationImage(nationId: string): Promise<boolean> {
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

      // Admins and moderators can update any nation's image
      if (['admin', 'moderator'].includes(profile.role)) {
        return true;
      }

      // Check if user is the leader of this nation
      const { data: nation, error: nationError } = await supabase
        .from('nations')
        .select('leader_name')
        .eq('id', nationId)
        .single();

      if (nationError || !nation) {
        return false;
      }

      return nation.leader_name === profile.full_name;

    } catch (error) {
      console.error('Error checking nation image update permissions:', error);
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
   * Get the BlueMap-compatible URL for a nation
   */
  static async getBlueMapUrl(nationName: string): Promise<string> {
    // Return the BlueMap template URL
    return UrlTransformService.getBlueMapUrlTemplate('nation').replace('%nation%', 
      nationName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase()
    );
  }

  /**
   * Get BlueMap URL template for configuration
   */
  static getBlueMapUrlTemplate(): string {
    return UrlTransformService.getBlueMapUrlTemplate('nation');
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