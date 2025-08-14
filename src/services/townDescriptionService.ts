import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TownDescriptionUpdate {
  townId: number;
  description: string;
}

export class TownDescriptionService {
  /**
   * Update the description for a town
   * Only town mayors, co-mayors and assistants can update town descriptions
   */
  static async updateTownDescription(townId: number, description: string): Promise<boolean> {
    try {
      console.log(`Updating town description for town ${townId} with description: "${description}"`);

      // First, let's check if the town exists
      const { data: existingTown, error: fetchError } = await supabase
        .from('towns')
        .select('id, name, mayor_uuid')
        .eq('id', townId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing town data:', fetchError);
        toast.error('Failed to fetch town data');
        return false;
      }

      if (!existingTown) {
        console.error('Town not found with ID:', townId);
        toast.error('Town not found');
        return false;
      }

      console.log('Existing town data:', existingTown);

      // Update the town's description
      const { data, error } = await supabase
        .from('towns')
        .update({
          description: description
        })
        .eq('id', townId)
        .select()
        .single();

      if (error) {
        console.error('Error updating town description:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          toast.error('You do not have permission to update this town\'s description. Only town mayors, co-mayors, and assistants can update town descriptions.');
        } else {
          toast.error(`Failed to update town description: ${error.message}`);
        }
        return false;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error('Town not found');
        return false;
      }

      console.log('Town description updated successfully:', data);
      toast.success('Town description updated successfully!');
      return true;

    } catch (error) {
      console.error('Error in updateTownDescription:', error);
      toast.error('An unexpected error occurred while updating the town description');
      return false;
    }
  }

  /**
   * Get the description for a town
   */
  static async getTownDescription(townId: number): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('description')
        .eq('id', townId)
        .single();

      if (error) {
        console.error('Error fetching town description:', error);
        return null;
      }

      return data?.description || null;

    } catch (error) {
      console.error('Error in getTownDescription:', error);
      return null;
    }
  }

  /**
   * Check if the current user can update a town's description
   */
  static async canUpdateTownDescription(townId: number, userId: string): Promise<boolean> {
    try {
      // Get the town data to check permissions
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('mayor_uuid')
        .eq('id', townId)
        .single();

      if (townError || !town) {
        return false;
      }

      // Check if user is the mayor
      if (town.mayor_uuid === userId) {
        return true;
      }

      // TODO: Add checks for co-mayors and assistants
      // This would require additional database queries to check town roles

      return false;

    } catch (error) {
      console.error('Error in canUpdateTownDescription:', error);
      return false;
    }
  }
}
