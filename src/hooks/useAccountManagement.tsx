import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAccountManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    try {
      setLoading(true);
      
      console.log('🔍 Checking username availability for:', username);
      
      const { data, error } = await supabase.rpc('check_username_conflict', {
        p_username: username
      });
      
      console.log('📡 Supabase RPC response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase RPC error:', error);
        throw error;
      }
      
      // Check if data is an array (SQL function returns multiple rows)
      if (Array.isArray(data) && data.length > 0) {
        // Take the first result (should be the conflict if any)
        const firstResult = data[0];
        const result = {
          available: !firstResult.has_conflict,
          message: firstResult.message,
          conflictType: firstResult.conflict_type
        };
        console.log('✅ Username check result (from array):', result);
        return result;
      }
      
      // Handle single result (fallback)
      const result = {
        available: !data.has_conflict,
        message: data.message,
        conflictType: data.conflict_type
      };
      
      console.log('✅ Username check result (single):', result);
      
      return result;
    } catch (error) {
      console.error('💥 Error checking username:', error);
      toast({
        title: "Error",
        description: "Failed to check username availability",
        variant: "destructive"
      });
      return { available: false, message: "Error checking username", conflictType: "error" };
    } finally {
      setLoading(false);
    }
  };

  // Create website account
  const createWebsiteAccount = async (email: string, username: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('create_website_account', {
        p_email: email,
        p_username: username,
        p_full_name: username // Use username as full_name
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set email for Minecraft users
  const setMinecraftUserEmail = async (profileId: string, email: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('set_minecraft_user_email', {
        p_profile_id: profileId,
        p_email: email
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast({
        title: "Success",
        description: "Email set successfully!",
      });
      
      return data;
    } catch (error) {
      console.error('Error setting email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set email",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change display name for Minecraft users
  const changeMinecraftDisplayName = async (profileId: string, newDisplayName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('change_minecraft_display_name', {
        p_profile_id: profileId,
        p_new_display_name: newDisplayName
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast({
        title: "Success",
        description: "Display name updated successfully!",
      });
      
      return data;
    } catch (error) {
      console.error('Error changing display name:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update display name",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkUsernameAvailability,
    createWebsiteAccount,
    setMinecraftUserEmail,
    changeMinecraftDisplayName
  };
};
