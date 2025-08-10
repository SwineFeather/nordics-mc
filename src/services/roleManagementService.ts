import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'editor' | 'member';

export interface RoleTransition {
  fromRole: UserRole;
  toRole: UserRole;
  allowed: boolean;
  reason?: string;
}

export interface RoleAuditLog {
  id: string;
  user_id: string;
  old_role: UserRole;
  new_role: UserRole;
  changed_by: string;
  changed_at: string;
  reason: string;
  ip_address?: string;
  user_agent?: string;
}

export interface RolePermissions {
  can_manage_users: boolean;
  can_moderate_content: boolean;
  can_edit_content: boolean;
  can_view_content: boolean;
}

class RoleManagementService {
  private static instance: RoleManagementService;
  private roleHierarchy: UserRole[] = ['member', 'editor', 'moderator', 'admin'];

  private constructor() {}

  public static getInstance(): RoleManagementService {
    if (!RoleManagementService.instance) {
      RoleManagementService.instance = new RoleManagementService();
    }
    return RoleManagementService.instance;
  }

  /**
   * Get role hierarchy for validation
   */
  getRoleHierarchy(): UserRole[] {
    return [...this.roleHierarchy];
  }

  /**
   * Check if a role can perform actions requiring a specific role level
   */
  canRolePerformAction(performingRole: UserRole, requiredRole: UserRole): boolean {
    const performingIndex = this.roleHierarchy.indexOf(performingRole);
    const requiredIndex = this.roleHierarchy.indexOf(requiredRole);
    return performingIndex >= requiredIndex;
  }

  /**
   * Validate role transition
   */
  validateRoleTransition(
    fromRole: UserRole,
    toRole: UserRole,
    performingUserRole: UserRole
  ): RoleTransition {
    // Prevent downgrading admin roles
    if (fromRole === 'admin' && toRole !== 'admin') {
      return {
        fromRole,
        toRole,
        allowed: false,
        reason: 'Cannot downgrade admin role'
      };
    }

    // Only admins can assign admin role
    if (toRole === 'admin' && performingUserRole !== 'admin') {
      return {
        fromRole,
        toRole,
        allowed: false,
        reason: 'Only admins can assign admin role'
      };
    }

    // Only admins and moderators can assign moderator role
    if (toRole === 'moderator' && !this.canRolePerformAction(performingUserRole, 'moderator')) {
      return {
        fromRole,
        toRole,
        allowed: false,
        reason: 'Insufficient permissions to assign moderator role'
      };
    }

    // Only admins, moderators, and editors can assign editor role
    if (toRole === 'editor' && !this.canRolePerformAction(performingUserRole, 'editor')) {
      return {
        fromRole,
        toRole,
        allowed: false,
        reason: 'Insufficient permissions to assign editor role'
      };
    }

    return {
      fromRole,
      toRole,
      allowed: true
    };
  }

  /**
   * Update user role with validation and auditing
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole,
    reason: string = 'Role updated',
    performingUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user's role
      const { data: performingUser, error: performingUserError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', performingUserId)
        .single();

      if (performingUserError || !performingUser) {
        return { success: false, error: 'Unable to verify performing user permissions' };
      }

      // Get target user's current role
      const { data: targetUser, error: targetUserError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (targetUserError || !targetUser) {
        return { success: false, error: 'Target user not found' };
      }

      // Validate role transition
      const transition = this.validateRoleTransition(
        targetUser.role as UserRole,
        newRole,
        performingUser.role as UserRole
      );

      if (!transition.allowed) {
        return { success: false, error: transition.reason };
      }

      // Update the role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: 'Failed to update role' };
      }

      // Log the role change (trigger will handle this automatically)
      console.log(`Role updated for user ${userId}: ${targetUser.role} -> ${newRole} by ${performingUserId}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get role permissions for a specific role
   */
  async getRolePermissions(role: UserRole): Promise<RolePermissions> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role)
        .single();

      if (error || !data) {
        // Fallback to default permissions if view doesn't exist
        return this.getDefaultPermissions(role);
      }

      return data as RolePermissions;
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return this.getDefaultPermissions(role);
    }
  }

  /**
   * Get default permissions for a role (fallback)
   */
  private getDefaultPermissions(role: UserRole): RolePermissions {
    switch (role) {
      case 'admin':
        return {
          can_manage_users: true,
          can_moderate_content: true,
          can_edit_content: true,
          can_view_content: true
        };
      case 'moderator':
        return {
          can_manage_users: false,
          can_moderate_content: true,
          can_edit_content: true,
          can_view_content: true
        };
      case 'editor':
        return {
          can_manage_users: false,
          can_moderate_content: false,
          can_edit_content: true,
          can_view_content: true
        };
      case 'member':
      default:
        return {
          can_manage_users: false,
          can_moderate_content: false,
          can_edit_content: false,
          can_view_content: true
        };
    }
  }

  /**
   * Get role audit logs for a user
   */
  async getRoleAuditLogs(
    userId: string,
    limit: number = 50
  ): Promise<RoleAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting role audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting role audit logs:', error);
      return [];
    }
  }

  /**
   * Get all role audit logs (admin only)
   */
  async getAllRoleAuditLogs(
    limit: number = 100,
    offset: number = 0
  ): Promise<RoleAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting all role audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all role audit logs:', error);
      return [];
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: keyof RolePermissions
  ): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return false;
      }

      const permissions = await this.getRolePermissions(profile.role as UserRole);
      return permissions[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics(): Promise<Record<UserRole, number>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) {
        console.error('Error getting role statistics:', error);
        return { admin: 0, moderator: 0, editor: 0, member: 0 };
      }

      const stats: Record<UserRole, number> = {
        admin: 0,
        moderator: 0,
        editor: 0,
        member: 0
      };

      data?.forEach(profile => {
        const role = profile.role as UserRole;
        if (stats.hasOwnProperty(role)) {
          stats[role]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting role statistics:', error);
      return { admin: 0, moderator: 0, editor: 0, member: 0 };
    }
  }
}

export default RoleManagementService.getInstance();
