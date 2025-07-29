
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validatePassword } from '@/utils/passwordValidator';
import { validateEmail } from '@/utils/inputValidator';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

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

      // Log security event
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: 'password_change',
          resource_type: 'user',
          resource_id: user.user.id,
          success: true
        }
      });

      toast.success('Password updated successfully');
      return { success: true };
    } catch (error: any) {
      // Log failed attempt
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.functions.invoke('log-security-event', {
          body: {
            action_type: 'password_change',
            resource_type: 'user',
            resource_id: user.user.id,
            success: false,
            error_message: error.message
          }
        });
      }

      toast.error(error.message || 'Failed to update password');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async (newEmail: string, password: string) => {
    setLoading(true);
    try {
      // Validate new email
      const emailValidation = validateEmail(newEmail);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors.join(', '));
      }

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
        email: emailValidation.sanitizedValue
      });

      if (error) throw error;

      // Log security event
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: 'email_change',
          resource_type: 'user',
          resource_id: user.user.id,
          old_values: { email: user.user.email },
          new_values: { email: emailValidation.sanitizedValue },
          success: true
        }
      });

      toast.success('Email update initiated. Please check your new email for confirmation.');
      return { success: true };
    } catch (error: any) {
      // Log failed attempt
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.functions.invoke('log-security-event', {
          body: {
            action_type: 'email_change',
            resource_type: 'user',
            resource_id: user.user.id,
            success: false,
            error_message: error.message
          }
        });
      }

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

      // Get current session token for admin operation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Log security event before deletion
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: 'account_deletion',
          resource_type: 'user',
          resource_id: user.user.id,
          success: true
        }
      });

      // Call secure admin function instead of client-side admin operation
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'delete_user',
          userId: user.user.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error: any) {
      // Log failed attempt
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.functions.invoke('log-security-event', {
          body: {
            action_type: 'account_deletion',
            resource_type: 'user',
            resource_id: user.user.id,
            success: false,
            error_message: error.message
          }
        });
      }

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
