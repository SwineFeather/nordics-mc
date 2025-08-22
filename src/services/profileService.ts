
import { supabase } from '@/integrations/supabase/client';

export interface ProfileAuthData {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  minecraft_username?: string;
  can_login_with_username: boolean;
}

export interface CreateProfileData {
  player_uuid: string;
  player_name: string;
  email?: string;
}

export class ProfileService {
  /**
   * Create a profile for a TokenLink user
   */
  static async createTokenLinkProfile(data: CreateProfileData): Promise<ProfileAuthData | null> {
    try {
      console.log('ProfileService: Creating TokenLink profile for:', data);
      
      // Use any type for RPC calls that aren't in the generated types
      const { data: profile, error } = await supabase
        .rpc('create_tokenlink_profile' as any, {
          p_player_uuid: data.player_uuid,
          p_player_name: data.player_name,
          p_email: data.email || null
        });

      console.log('ProfileService: RPC response:', { profile, error });

      if (error) {
        console.error('ProfileService: Error creating TokenLink profile:', error);
        return null;
      }

      if (profile && Array.isArray(profile) && profile.length > 0) {
        console.log('ProfileService: Successfully created profile:', profile[0]);
        const profileData = profile[0] as any;
        return {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          username: profileData.username,
          role: profileData.role,
          avatar_url: null,
          bio: null,
          minecraft_username: profileData.minecraft_username,
          can_login_with_username: false,
        };
      }

      console.log('ProfileService: No profile returned from RPC');
      return null;
    } catch (error) {
      console.error('ProfileService: Exception creating TokenLink profile:', error);
      return null;
    }
  }

  /**
   * Authenticate user by username and password
   */
  static async authenticateByUsername(username: string, password: string): Promise<ProfileAuthData | null> {
    try {
      const { data: profile, error } = await supabase
        .rpc('authenticate_user_by_username' as any, {
          username,
          password
        });

      if (error) {
        console.error('Error authenticating by username:', error);
        return null;
      }

      if (profile && Array.isArray(profile) && profile.length > 0) {
        const profileData = profile[0] as any;
        return {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          username: profileData.username,
          role: profileData.role,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          minecraft_username: profileData.minecraft_username,
          can_login_with_username: true,
        };
      }

      return null;
    } catch (error) {
      console.error('Error authenticating by username:', error);
      return null;
    }
  }

  /**
   * Set or update user password
   */
  static async setPassword(userId: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('set_user_password' as any, {
          user_id: userId,
          new_password: password
        });

      if (error) {
        console.error('Error setting password:', error);
        return false;
      }

      return Boolean(data);
    } catch (error) {
      console.error('Error setting password:', error);
      return false;
    }
  }

  /**
   * Check if a profile exists for a TokenLink user
   */
  static async getProfileByPlayerUuid(playerUuid: string): Promise<ProfileAuthData | null> {
    try {
      // First check if player exists and has a profile_id
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('uuid', playerUuid)
        .single();

      if (playerError || !player) {
        console.log('No player found for UUID:', playerUuid);
        return null;
      }

      // Check if player has a profile_id (this might not exist in the current schema)
      const profileId = (player as any).profile_id;
      if (profileId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (profileError || !profile) {
          return null;
        }

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          username: profile.username,
          role: profile.role,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          minecraft_username: profile.minecraft_username,
          can_login_with_username: (profile as any).can_login_with_username || false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting profile by player UUID:', error);
      return null;
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<ProfileAuthData | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !profile) {
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        role: profile.role,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        minecraft_username: profile.minecraft_username,
        can_login_with_username: (profile as any).can_login_with_username || false,
      };
    } catch (error) {
      console.error('Error getting profile by username:', error);
      return null;
    }
  }

  /**
   * Update profile information
   */
  static async updateProfile(profileId: string, updates: Partial<ProfileAuthData>): Promise<ProfileAuthData | null> {
    try {
      // Convert role to proper type if it exists
      const updateData: any = { ...updates };
      if (updateData.role && typeof updateData.role === 'string') {
        updateData.role = updateData.role as any;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId)
        .select()
        .single();

      if (!error && profile) {
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          username: profile.username,
          role: profile.role,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          minecraft_username: profile.minecraft_username,
          can_login_with_username: (profile as any).can_login_with_username || false,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Send a message from one player to another
   */
  static async contactPlayer(
    senderId: string,
    receiverId: string,
    subject: string,
    content: string,
    context?: string
  ): Promise<{ success: boolean; message?: string; messageId?: string }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          subject: subject || null,
          content,
          context: context || null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return {
          success: false,
          message: 'Failed to send message'
        };
      }

      return {
        success: true,
        message: 'Message sent successfully',
        messageId: message.id
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'An error occurred while sending the message'
      };
    }
  }
}

// Export the contactPlayer function for direct import
export const contactPlayer = ProfileService.contactPlayer;
