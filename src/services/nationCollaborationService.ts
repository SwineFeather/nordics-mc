import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NationCollaborator {
  id: string;
  nation_name: string;
  user_id: string;
  username: string;
  role: 'collaborator' | 'moderator' | 'admin';
  permissions: string[];
  invited_by: string;
  invited_by_username: string;
  invited_at: string;
  accepted_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollaborationPermissions {
  canUpload: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canModerate: boolean;
  canInvite: boolean;
  canEditDescription: boolean;
  canEditLore: boolean;
  canEditMotto: boolean;
  canManageCollaborators: boolean;
  reason?: string;
}

export class NationCollaborationService {
  /**
   * Check if a user has collaboration permissions for a nation
   */
  static async checkCollaborationPermissions(nationName: string, userId: string): Promise<CollaborationPermissions> {
    try {
      // Check if user is admin or moderator
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      // Staff have full access
      if (profile?.role === 'admin' || profile?.role === 'moderator') {
        return {
          canUpload: true,
          canDelete: true,
          canApprove: true,
          canModerate: true,
          canInvite: true,
          canEditDescription: true,
          canEditLore: true,
          canEditMotto: true,
          canManageCollaborators: true
        };
      }

      // Check if user is the nation leader (king_name)
      const { data: nation, error: nationError } = await supabase
        .from('nations')
        .select('king_name')
        .eq('name', nationName)
        .single();

      if (nationError) {
        throw new Error('Failed to fetch nation data');
      }

      // Nation leader has full access
      if (nation?.king_name && profile?.full_name === nation.king_name) {
        return {
          canUpload: true,
          canDelete: true,
          canApprove: true,
          canModerate: true,
          canInvite: true,
          canEditDescription: true,
          canEditLore: true,
          canEditMotto: true,
          canManageCollaborators: true
        };
      }

      // Check if user is a collaborator
      const { data: collaborator, error: collabError } = await supabase
        .from('nation_collaborators')
        .select('*')
        .eq('nation_name', nationName)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (collabError || !collaborator) {
        return {
          canUpload: false,
          canDelete: false,
          canApprove: false,
          canModerate: false,
          canInvite: false,
          canEditDescription: false,
          canEditLore: false,
          canEditMotto: false,
          canManageCollaborators: false,
          reason: 'Not a collaborator for this nation'
        };
      }

      // Return permissions based on collaborator role
      switch (collaborator.role) {
        case 'admin':
          return {
            canUpload: true,
            canDelete: true,
            canApprove: true,
            canModerate: true,
            canInvite: true,
            canEditDescription: true,
            canEditLore: true,
            canEditMotto: true,
            canManageCollaborators: true
          };
        case 'moderator':
          return {
            canUpload: true,
            canDelete: true,
            canApprove: true,
            canModerate: true,
            canInvite: false,
            canEditDescription: true,
            canEditLore: true,
            canEditMotto: true,
            canManageCollaborators: false
          };
        case 'collaborator':
        default:
          return {
            canUpload: true,
            canDelete: false,
            canApprove: false,
            canModerate: false,
            canInvite: false,
            canEditDescription: true,
            canEditLore: true,
            canEditMotto: true,
            canManageCollaborators: false
          };
      }

    } catch (error) {
      console.error('Error checking collaboration permissions:', error);
      return {
        canUpload: false,
        canDelete: false,
        canApprove: false,
        canModerate: false,
        canInvite: false,
        canEditDescription: false,
        canEditLore: false,
        canEditMotto: false,
        canManageCollaborators: false,
        reason: 'Error checking permissions'
      };
    }
  }

  /**
   * Invite a user to collaborate on a nation
   */
  static async inviteCollaborator(
    nationName: string, 
    userId: string, 
    username: string, 
    role: 'collaborator' | 'moderator' | 'admin',
    invitedByUserId: string,
    invitedByUsername: string
  ): Promise<boolean> {
    try {
      // Check if the inviter has permission to invite
      const permissions = await this.checkCollaborationPermissions(nationName, invitedByUserId);
      if (!permissions.canInvite) {
        throw new Error('You do not have permission to invite collaborators');
      }

      // Check if user is already a collaborator
      const { data: existingCollab } = await supabase
        .from('nation_collaborators')
        .select('id')
        .eq('nation_name', nationName)
        .eq('user_id', userId)
        .single();

      if (existingCollab) {
        throw new Error('User is already a collaborator for this nation');
      }

      // Create the collaboration invitation
      const { error } = await supabase
        .from('nation_collaborators')
        .insert({
          nation_name: nationName,
          user_id: userId,
          username,
          role,
          invited_by: invitedByUserId,
          invited_by_username: invitedByUsername,
          is_active: true
        });

      if (error) {
        console.error('Error inviting collaborator:', error);
        throw new Error('Failed to invite collaborator');
      }

      toast.success(`Successfully invited ${username} as ${role}`);
      return true;

    } catch (error) {
      console.error('Error in inviteCollaborator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to invite collaborator');
      return false;
    }
  }

  /**
   * Remove a collaborator from a nation
   */
  static async removeCollaborator(
    nationName: string, 
    collaboratorId: string, 
    removedByUserId: string
  ): Promise<boolean> {
    try {
      // Check if the remover has permission to manage collaborators
      const permissions = await this.checkCollaborationPermissions(nationName, removedByUserId);
      if (!permissions.canManageCollaborators) {
        throw new Error('You do not have permission to remove collaborators');
      }

      // Remove the collaborator
      const { error } = await supabase
        .from('nation_collaborators')
        .delete()
        .eq('id', collaboratorId)
        .eq('nation_name', nationName);

      if (error) {
        console.error('Error removing collaborator:', error);
        throw new Error('Failed to remove collaborator');
      }

      toast.success('Collaborator removed successfully');
      return true;

    } catch (error) {
      console.error('Error in removeCollaborator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove collaborator');
      return false;
    }
  }

  /**
   * Update collaborator role
   */
  static async updateCollaboratorRole(
    nationName: string, 
    collaboratorId: string, 
    newRole: 'collaborator' | 'moderator' | 'admin',
    updatedByUserId: string
  ): Promise<boolean> {
    try {
      // Check if the updater has permission to manage collaborators
      const permissions = await this.checkCollaborationPermissions(nationName, updatedByUserId);
      if (!permissions.canManageCollaborators) {
        throw new Error('You do not have permission to update collaborator roles');
      }

      // Update the collaborator role
      const { error } = await supabase
        .from('nation_collaborators')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaboratorId)
        .eq('nation_name', nationName);

      if (error) {
        console.error('Error updating collaborator role:', error);
        throw new Error('Failed to update collaborator role');
      }

      toast.success('Collaborator role updated successfully');
      return true;

    } catch (error) {
      console.error('Error in updateCollaboratorRole:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update collaborator role');
      return false;
    }
  }

  /**
   * Get all collaborators for a nation
   */
  static async getNationCollaborators(nationName: string): Promise<NationCollaborator[]> {
    try {
      const { data: collaborators, error } = await supabase
        .from('nation_collaborators')
        .select('*')
        .eq('nation_name', nationName)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching nation collaborators:', error);
        return [];
      }

      return collaborators || [];
    } catch (error) {
      console.error('Error in getNationCollaborators:', error);
      return [];
    }
  }

  /**
   * Accept collaboration invitation
   */
  static async acceptInvitation(collaboratorId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nation_collaborators')
        .update({ 
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', collaboratorId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error accepting invitation:', error);
        throw new Error('Failed to accept invitation');
      }

      toast.success('Collaboration invitation accepted!');
      return true;

    } catch (error) {
      console.error('Error in acceptInvitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      return false;
    }
  }

  /**
   * Decline collaboration invitation
   */
  static async declineInvitation(collaboratorId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nation_collaborators')
        .delete()
        .eq('id', collaboratorId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error declining invitation:', error);
        throw new Error('Failed to decline invitation');
      }

      toast.success('Collaboration invitation declined');
      return true;

    } catch (error) {
      console.error('Error in declineInvitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
      return false;
    }
  }

  /**
   * Get pending invitations for a user
   */
  static async getPendingInvitations(userId: string): Promise<NationCollaborator[]> {
    try {
      const { data: invitations, error } = await supabase
        .from('nation_collaborators')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('accepted_at', null)
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invitations:', error);
        return [];
      }

      return invitations || [];
    } catch (error) {
      console.error('Error in getPendingInvitations:', error);
      return [];
    }
  }
}
