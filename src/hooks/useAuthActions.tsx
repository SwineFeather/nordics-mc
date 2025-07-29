
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('No email found');
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async (newEmail: string, password: string) => {
    setLoading(true);
    try {
      // Verify password first
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('No current email found');
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: password,
      });

      if (verifyError) {
        throw new Error('Password is incorrect');
      }

      // Update email
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast.success('Email update initiated. Please check your new email for confirmation.');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string) => {
    setLoading(true);
    try {
      // Verify password first
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('No email found');
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: password,
      });

      if (verifyError) {
        throw new Error('Password is incorrect');
      }

      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.user.id);
      
      if (error) throw error;

      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    changePassword,
    changeEmail,
    deleteAccount,
    loading
  };
};
