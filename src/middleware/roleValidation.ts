/**
 * Secure Role Validation Middleware
 * 
 * This middleware provides server-side role validation to prevent
 * frontend role manipulation attacks.
 */

import { supabase } from '@/integrations/supabase/client';

export interface RoleValidationResult {
  isValid: boolean;
  userRole: string | null;
  hasPermission: boolean;
  error?: string;
}

export interface PermissionConfig {
  requiredRole: string;
  allowOwnResource?: boolean;
  resourceOwnerId?: string;
}

/**
 * Validate user role and permissions server-side
 */
export async function validateUserRole(
  userId: string,
  requiredRole: string,
  options?: { allowOwnResource?: boolean; resourceOwnerId?: string }
): Promise<RoleValidationResult> {
  try {
    // Get user profile from database (server-side)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name, minecraft_username')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return {
        isValid: false,
        userRole: null,
        hasPermission: false,
        error: 'User profile not found'
      };
    }

    const userRole = profile.role;
    
    // Check if user has the required role
    const hasRequiredRole = hasRolePermission(userRole, requiredRole);
    
    // Check if user can access their own resource
    const canAccessOwnResource = options?.allowOwnResource && 
      options?.resourceOwnerId && 
      userId === options.resourceOwnerId;

    const hasPermission = hasRequiredRole || canAccessOwnResource;

    return {
      isValid: true,
      userRole,
      hasPermission,
      error: hasPermission ? undefined : 'Insufficient permissions'
    };

  } catch (error) {
    console.error('Role validation error:', error);
    return {
      isValid: false,
      userRole: null,
      hasPermission: false,
      error: 'Role validation failed'
    };
  }
}

/**
 * Check if user role has permission for required role
 */
function hasRolePermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'admin': 100,
    'moderator': 80,
    'helper': 60,
    'editor': 40,
    'member': 20,
    'vip': 15,
    'kala': 10,
    'fancy_kala': 8,
    'golden_kala': 5
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Secure role check for admin operations
 */
export async function requireAdminRole(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'admin');
}

/**
 * Secure role check for moderator operations
 */
export async function requireModeratorRole(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'moderator');
}

/**
 * Secure role check for staff operations
 */
export async function requireStaffRole(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'helper');
}

/**
 * Secure role check for editor operations
 */
export async function requireEditorRole(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'editor');
}

/**
 * Check if user can edit their own content or has staff permissions
 */
export async function canEditContent(
  userId: string, 
  contentOwnerId: string
): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'editor', {
    allowOwnResource: true,
    resourceOwnerId: contentOwnerId
  });
}

/**
 * Check if user can delete content
 */
export async function canDeleteContent(
  userId: string, 
  contentOwnerId: string
): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'moderator', {
    allowOwnResource: true,
    resourceOwnerId: contentOwnerId
  });
}

/**
 * Check if user can manage other users
 */
export async function canManageUsers(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'admin');
}

/**
 * Check if user can access admin panel
 */
export async function canAccessAdminPanel(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'admin');
}

/**
 * Check if user can moderate forum
 */
export async function canModerateForum(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'moderator');
}

/**
 * Check if user can edit wiki pages
 */
export async function canEditWiki(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'editor');
}

/**
 * Check if user can upload files
 */
export async function canUploadFiles(userId: string): Promise<RoleValidationResult> {
  return validateUserRole(userId, 'member');
}

/**
 * Validate user session and get role information
 */
export async function validateUserSession(sessionToken: string): Promise<{
  userId: string | null;
  userRole: string | null;
  isValid: boolean;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    
    if (error || !user) {
      return { userId: null, userRole: null, isValid: false };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      userId: user.id,
      userRole: profile?.role || null,
      isValid: true
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return { userId: null, userRole: null, isValid: false };
  }
}

/**
 * Log security events for audit purposes
 */
export function logSecurityEvent(
  event: string,
  userId: string,
  action: string,
  resource: string,
  success: boolean,
  details?: any
) {
  console.log(`🔒 SECURITY EVENT: ${event}`, {
    userId,
    action,
    resource,
    success,
    timestamp: new Date().toISOString(),
    details
  });

  // TODO: Implement proper security logging to database
  // This should log all security-related events for audit purposes
}
