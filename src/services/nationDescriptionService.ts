import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NationCollaborationService } from './nationCollaborationService';

export interface NationDescriptionUpdate {
  nationId: string;
  description: string;
}

export interface NationLoreUpdate {
  nationId: string;
  lore: string;
}

export interface NationMottoUpdate {
  nationId: string;
  motto: string;
}

export interface NationGeneralUpdate {
  nationId: string;
  field: string;
  value: string | number | boolean | string[];
}

export class NationDescriptionService {
  /**
   * Check if a user can edit nation properties
   */
  static async canEditNationProperties(nationName: string, userId: string): Promise<boolean> {
    try {
      const permissions = await NationCollaborationService.checkCollaborationPermissions(nationName, userId);
      return permissions.canEditDescription;
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return false;
    }
  }

  /**
   * Update the description for a nation
   * Only nation leaders, collaborators, and admins/moderators can update nation descriptions
   */
  static async updateNationDescription(nationId: string, description: string): Promise<boolean> {
    try {
      console.log(`Updating nation description for nation ${nationId} with description: "${description}"`);

      // First, let's check if the nation exists
      const { data: existingNation, error: fetchError } = await supabase
        .from('nations')
        .select('id, name, leader_name')
        .eq('id', nationId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing nation data:', fetchError);
        toast.error('Failed to fetch nation data');
        return false;
      }

      if (!existingNation) {
        console.error('Nation not found with ID:', nationId);
        toast.error('Nation not found');
        return false;
      }

      console.log('Existing nation data:', existingNation);

      // Update the nation's description (stored in the 'description' field)
      const { data, error } = await supabase
        .from('nations')
        .update({
          description: description
        })
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation description:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this nation\'s description. Only nation leaders and staff can update nation descriptions.');
        } else {
          toast.error(`Failed to update nation description: ${error.message}`);
        }
        return false;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error('Nation not found');
        return false;
      }

      console.log('Nation description updated successfully:', data);
      toast.success('Nation description updated successfully!');
      return true;

    } catch (error) {
      console.error('Error in updateNationDescription:', error);
      toast.error('An unexpected error occurred while updating the nation description');
      return false;
    }
  }

  /**
   * Update the lore for a nation
   * Only nation leaders and admins/moderators can update nation lore
   */
  static async updateNationLore(nationId: string, lore: string): Promise<boolean> {
    try {
      console.log(`Updating nation lore for nation ${nationId} with lore: "${lore}"`);

      // Update the nation's lore (stored in the 'lore' field)
      const { data, error } = await supabase
        .from('nations')
        .update({
          lore: lore
        })
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation lore:', error);
        toast.error(`Failed to update nation lore: ${error.message}`);
        return false;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error('Nation not found');
        return false;
      }

      console.log('Nation lore updated successfully:', data);
      toast.success('Nation lore updated successfully!');
      return true;

    } catch (error) {
      console.error('Error in updateNationLore:', error);
      toast.error('An unexpected error occurred while updating the nation lore');
      return false;
    }
  }

  /**
   * Update the motto for a nation
   * Only nation leaders and admins/moderators can update nation motto
   */
  static async updateNationMotto(nationId: string, motto: string): Promise<boolean> {
    try {
      console.log(`Updating nation motto for nation ${nationId} with motto: "${motto}"`);

      // Update the nation's motto (stored in the 'tag' field)
      const { data, error } = await supabase
        .from('nations')
        .update({
          tag: motto
        })
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation motto:', error);
        toast.error(`Failed to update nation motto: ${error.message}`);
        return false;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error('Nation not found');
        return false;
      }

      console.log('Nation motto updated successfully:', data);
      toast.success('Nation motto updated successfully!');
      return true;

    } catch (error) {
      console.error('Error in updateNationMotto:', error);
      toast.error('An unexpected error occurred while updating the nation motto');
      return false;
    }
  }

  /**
   * Update general nation properties
   * Only nation leaders and admins/moderators can update nation properties
   */
  static async updateNationProperty(nationId: string, field: string, value: string | number | boolean | string[]): Promise<boolean> {
    try {
      console.log(`Updating nation property ${field} for nation ${nationId} with value:`, value);

      const updateData: any = {};
      updateData[field] = value;

      const { data, error } = await supabase
        .from('nations')
        .update(updateData)
        .eq('id', nationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating nation property:', error);
        toast.error(`Failed to update nation ${field}: ${error.message}`);
        return false;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error('Nation not found');
        return false;
      }

      console.log(`Nation ${field} updated successfully:`, data);
      toast.success(`Nation ${field} updated successfully!`);
      return true;

    } catch (error) {
      console.error('Error in updateNationProperty:', error);
      toast.error(`An unexpected error occurred while updating the nation ${field}`);
      return false;
    }
  }

  /**
   * Get the description for a nation
   */
  static async getNationDescription(nationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('nations')
        .select('description')
        .eq('id', nationId)
        .single();

      if (error) {
        console.error('Error fetching nation description:', error);
        return null;
      }

      return data?.description || null;

    } catch (error) {
      console.error('Error in getNationDescription:', error);
      return null;
    }
  }

  /**
   * Get the motto for a nation
   */
  static async getNationMotto(nationId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('nations')
        .select('tag')
        .eq('id', nationId)
        .single();

      if (error) {
        console.error('Error fetching nation motto:', error);
        return null;
      }

      return data?.tag || null;

    } catch (error) {
      console.error('Error in getNationMotto:', error);
      return null;
    }
  }

  /**
   * Check if the current user can update a nation's properties
   */
  static async canUpdateNationProperties(nationId: string, userId: string): Promise<boolean> {
    try {
      // For now, we'll assume admins and moderators can update any nation
      // In the future, this could check if the user is the nation leader
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'moderator') {
        return true;
      }

      // Check if user is the nation leader
      const { data: nation } = await supabase
        .from('nations')
        .select('leader_name')
        .eq('id', nationId)
        .single();

      if (nation?.leader_name === userId) {
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error checking nation update permissions:', error);
      return false;
    }
  }
}

