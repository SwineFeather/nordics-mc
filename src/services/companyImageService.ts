import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageStorageService } from './imageStorageService';

export interface CompanyImageUpdate {
  companyId: string;
  imageUrl: string;
}

export class CompanyImageService {
  /**
   * Update the logo URL for a company
   * Only company owners and admins/moderators can update company logos
   */
  static async updateCompanyLogo(companyId: string, externalImageUrl: string): Promise<boolean> {
    try {
      console.log(`Updating company logo for company ${companyId} with URL: ${externalImageUrl}`);

      // Validate the image URL
      if (!this.isValidImageUrl(externalImageUrl)) {
        toast.error('Please provide a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp)');
        return false;
      }

      // Get the company data to get the name
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        toast.error('Company not found');
        return false;
      }

      // Update the company's logo_url with the direct external URL
      const { data, error } = await supabase
        .from('companies')
        .update({
          logo_url: externalImageUrl
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating company logo:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this company\'s logo. Only company owners and staff can update company logos.');
        } else {
          toast.error('Failed to update company logo. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Company not found');
        return false;
      }

      toast.success('Company logo updated successfully!');
      console.log('Company logo updated successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in updateCompanyLogo:', error);
      toast.error('An unexpected error occurred while updating the company logo');
      return false;
    }
  }

  /**
   * Upload a file and update the company's logo
   * Only company owners and admins/moderators can update company logos
   */
  static async uploadCompanyLogoFile(companyId: string, file: File): Promise<boolean> {
    try {
      console.log(`Uploading logo file for company ${companyId}`);

      // Get the company data to get the name
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        toast.error('Company not found');
        return false;
      }

      // Upload file to storage and get direct Supabase URL
      const imageUrl = await ImageStorageService.uploadFile(file, company.name, 'company');

      // Update the company's logo_url with the direct Supabase storage URL
      const { data, error } = await supabase
        .from('companies')
        .update({
          logo_url: imageUrl
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating company logo:', error);
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this company\'s logo. Only company owners and staff can update company logos.');
        } else {
          toast.error('Failed to update company logo. Please try again.');
        }
        return false;
      }

      if (!data) {
        toast.error('Company not found');
        return false;
      }

      toast.success('Company logo uploaded successfully!');
      console.log('Company logo uploaded successfully:', data);
      return true;

    } catch (error) {
      console.error('Error in uploadCompanyLogoFile:', error);
      toast.error('An unexpected error occurred while uploading the company logo');
      return false;
    }
  }

  /**
   * Get the logo URL for a company
   */
  static async getCompanyLogo(companyId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('logo_url')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Error fetching company logo:', error);
        return null;
      }

      return data?.logo_url || null;

    } catch (error) {
      console.error('Error in getCompanyLogo:', error);
      return null;
    }
  }

  /**
   * Check if a user can update a company's logo
   */
  static async canUpdateCompanyLogo(companyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user is admin/moderator
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'moderator') {
        return true;
      }

      // Check if user is the company owner
      const { data: company } = await supabase
        .from('companies')
        .select('owner_uuid')
        .eq('id', companyId)
        .single();

      return company?.owner_uuid === user.id;

    } catch (error) {
      console.error('Error checking company logo update permissions:', error);
      return false;
    }
  }

  /**
   * Validate if a URL is a valid image URL
   */
  private static isValidImageUrl(url: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUrl = url.toLowerCase();
    return validExtensions.some(ext => lowerUrl.endsWith(ext));
  }
} 