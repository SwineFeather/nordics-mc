import { supabase } from '@/integrations/supabase/client';
import { UserRole, WikiPermissions, getRolePermissions } from '@/types/wiki';

export interface WikiUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  permissions: WikiPermissions;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
  userRole?: UserRole;
}

export interface WikiAccessLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resourceType: 'page' | 'category' | 'system';
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: any;
}

class UserPermissionsService {
  private currentUser: WikiUser | null = null;
  private accessLog: WikiAccessLog[] = [];

  // Get current user with permissions
  async getCurrentUser(): Promise<WikiUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('🔐 No authenticated user found');
        return null;
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        return null;
      }

      // Determine user role
      const role = this.determineUserRole(profile);
      const permissions = getRolePermissions(role);

      const wikiUser: WikiUser = {
        id: user.id,
        username: profile.minecraft_username || profile.full_name || user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        role,
        avatar: profile.avatar_url,
        joinedAt: user.created_at,
        lastActive: new Date().toISOString(),
        permissions
      };

      this.currentUser = wikiUser;
      console.log(`👤 Current user: ${wikiUser.username} (${role})`);
      return wikiUser;

    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Determine user role based on profile data
  private determineUserRole(profile: any): UserRole {
    // Check for admin role first
    if (profile.role === 'admin' || profile.is_admin) {
      return 'admin';
    }

    // Check for moderator role
    if (profile.role === 'moderator' || profile.is_moderator) {
      return 'moderator';
    }

    // Check for editor role
    if (profile.role === 'editor' || profile.is_editor) {
      return 'editor';
    }

    // Default to member role
    return 'member';
  }

  // Check if user can perform an action
  async checkPermission(
    action: keyof WikiPermissions,
    resourceType?: 'page' | 'category' | 'system',
    resourceId?: string
  ): Promise<PermissionCheck> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        this.logAccess('check_permission', resourceType, resourceId, false, {
          action,
          reason: 'No authenticated user'
        });
        
        return {
          allowed: false,
          reason: 'Authentication required',
          requiredRole: 'member'
        };
      }

      const hasPermission = user.permissions[action];
      
      this.logAccess('check_permission', resourceType, resourceId, hasPermission, {
        action,
        userRole: user.role,
        hasPermission
      });

      return {
        allowed: hasPermission,
        reason: hasPermission ? undefined : `Insufficient permissions for ${action}`,
        requiredRole: this.getRequiredRoleForAction(action),
        userRole: user.role
      };

    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions'
      };
    }
  }

  // Get required role for a specific action
  private getRequiredRoleForAction(action: keyof WikiPermissions): UserRole {
    switch (action) {
      case 'canRead':
        return 'member';
      case 'canEdit':
        return 'editor';
      case 'canCreate':
        return 'editor';
      case 'canDelete':
        return 'moderator';
      case 'canPublish':
        return 'moderator';
      case 'canManageStructure':
        return 'moderator';
      case 'canManageUsers':
        return 'admin';
      case 'canModifyTheme':
        return 'admin';
      default:
        return 'member';
    }
  }

  // Check if user can read a specific page
  async canReadPage(pageId: string): Promise<PermissionCheck> {
    return this.checkPermission('canRead', 'page', pageId);
  }

  // Check if user can edit a specific page
  async canEditPage(pageId: string): Promise<PermissionCheck> {
    return this.checkPermission('canEdit', 'page', pageId);
  }

  // Check if user can create pages
  async canCreatePage(): Promise<PermissionCheck> {
    return this.checkPermission('canCreate', 'page');
  }

  // Check if user can delete a specific page
  async canDeletePage(pageId: string): Promise<PermissionCheck> {
    return this.checkPermission('canDelete', 'page', pageId);
  }

  // Check if user can manage wiki structure
  async canManageStructure(): Promise<PermissionCheck> {
    return this.checkPermission('canManageStructure', 'system');
  }

  // Check if user can manage users
  async canManageUsers(): Promise<PermissionCheck> {
    return this.checkPermission('canManageUsers', 'system');
  }

  // Check if user can modify theme
  async canModifyTheme(): Promise<PermissionCheck> {
    return this.checkPermission('canModifyTheme', 'system');
  }

  // Update user role
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      // Check if current user can manage users
      const canManage = await this.canManageUsers();
      if (!canManage.allowed) {
        console.error('❌ Insufficient permissions to update user role');
        return false;
      }

      // Update user role in database
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating user role:', error);
        return false;
      }

      this.logAccess('update_user_role', 'system', userId, true, {
        targetUserId: userId,
        newRole
      });

      console.log(`✅ Updated user ${userId} role to ${newRole}`);
      return true;

    } catch (error) {
      console.error('❌ Error updating user role:', error);
      return false;
    }
  }

  // Get all users with their roles
  async getAllUsers(): Promise<WikiUser[]> {
    try {
      // Check if current user can manage users
      const canManage = await this.canManageUsers();
      if (!canManage.allowed) {
        console.error('❌ Insufficient permissions to view all users');
        return [];
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');

      if (error) {
        console.error('❌ Error fetching users:', error);
        return [];
      }

      const users: WikiUser[] = profiles.map(profile => ({
        id: profile.id,
        username: profile.minecraft_username || profile.full_name || 'Unknown',
        email: profile.email || '',
        role: this.determineUserRole(profile),
        avatar: profile.avatar_url,
        joinedAt: profile.created_at,
        lastActive: profile.updated_at,
        permissions: getRolePermissions(this.determineUserRole(profile))
      }));

      this.logAccess('get_all_users', 'system', undefined, true, {
        userCount: users.length
      });

      return users;

    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }

  // Log access attempts
  private logAccess(
    action: string,
    resourceType?: 'page' | 'category' | 'system',
    resourceId?: string,
    success: boolean = true,
    details?: any
  ): void {
    const user = this.currentUser;
    
    const logEntry: WikiAccessLog = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      username: user?.username || 'anonymous',
      action,
      resourceType: resourceType || 'system',
      resourceId,
      timestamp: new Date().toISOString(),
      success,
      details
    };

    this.accessLog.unshift(logEntry);
    
    // Keep only last 1000 entries
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(0, 1000);
    }

    // Log to console for debugging
    const status = success ? '✅' : '❌';
    console.log(`${status} Access log: ${action} by ${logEntry.username} - ${success ? 'SUCCESS' : 'DENIED'}`);
  }

  // Get access logs
  async getAccessLogs(limit: number = 100): Promise<WikiAccessLog[]> {
    try {
      // Check if current user can manage users
      const canManage = await this.canManageUsers();
      if (!canManage.allowed) {
        console.error('❌ Insufficient permissions to view access logs');
        return [];
      }

      return this.accessLog.slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting access logs:', error);
      return [];
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    roleDistribution: Record<UserRole, number>;
    recentActivity: number;
  }> {
    try {
      const users = await this.getAllUsers();
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const activeUsers = users.filter(user => 
        new Date(user.lastActive) > oneDayAgo
      ).length;

      const roleDistribution = {
        admin: users.filter(u => u.role === 'admin').length,
        moderator: users.filter(u => u.role === 'moderator').length,
        editor: users.filter(u => u.role === 'editor').length,
        member: users.filter(u => u.role === 'member').length
      };

      const recentActivity = this.accessLog.filter(log => 
        new Date(log.timestamp) > oneDayAgo
      ).length;

      return {
        totalUsers: users.length,
        activeUsers,
        roleDistribution,
        recentActivity
      };

    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        roleDistribution: { admin: 0, moderator: 0, editor: 0, member: 0 },
        recentActivity: 0
      };
    }
  }

  // Clear access logs
  async clearAccessLogs(): Promise<boolean> {
    try {
      // Check if current user can manage users
      const canManage = await this.canManageUsers();
      if (!canManage.allowed) {
        console.error('❌ Insufficient permissions to clear access logs');
        return false;
      }

      this.accessLog = [];
      console.log('✅ Access logs cleared');
      return true;

    } catch (error) {
      console.error('❌ Error clearing access logs:', error);
      return false;
    }
  }

  // Get current user's permissions
  getCurrentUserPermissions(): WikiPermissions | null {
    return this.currentUser?.permissions || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user role hierarchy
  getUserRoleHierarchy(): UserRole[] {
    return ['member', 'editor', 'moderator', 'admin'];
  }

  // Check if a role can perform actions of another role
  canRolePerformAction(performingRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy = this.getUserRoleHierarchy();
    const performingIndex = hierarchy.indexOf(performingRole);
    const requiredIndex = hierarchy.indexOf(requiredRole);
    
    return performingIndex >= requiredIndex;
  }
}

export const userPermissionsService = new UserPermissionsService();
export default userPermissionsService; 