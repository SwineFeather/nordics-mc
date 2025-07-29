
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from '@/utils/securityMonitor';
import { toast } from 'sonner';

export const useSecurity = () => {
  // Monitor authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          securityMonitor.logEvent({
            action_type: 'login_success',
            resource_type: 'auth',
            resource_id: session?.user?.email || 'unknown',
            success: true
          });
          break;
        case 'SIGNED_OUT':
          securityMonitor.logEvent({
            action_type: 'logout',
            resource_type: 'auth',
            success: true
          });
          break;
        case 'TOKEN_REFRESHED':
          securityMonitor.logEvent({
            action_type: 'token_refresh',
            resource_type: 'auth',
            success: true
          });
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor page visibility for session security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden - could implement session pause
        console.log('Page hidden - monitoring session security');
      } else {
        // Page is now visible - could implement session validation
        console.log('Page visible - validating session');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Detect potential XSS attempts
  const sanitizeAndValidateInput = useCallback((input: string): string => {
    const suspiciousPatterns = [
      /<script.*?>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));
    
    if (hasSuspiciousContent) {
      securityMonitor.logEvent({
        action_type: 'xss_attempt_detected',
        resource_type: 'input',
        success: false,
        error_message: 'Potentially malicious input detected'
      });
      
      toast.error('Invalid input detected. Please check your content.');
      return '';
    }

    return input;
  }, []);

  // Check if user has required permissions
  const hasPermission = useCallback(async (requiredRole: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      if (!profile) return false;

      const roleHierarchy: Record<string, number> = {
        'admin': 100,
        'moderator': 80,
        'helper': 60,
        'editor': 40,
        'member': 20
      };

      const userLevel = roleHierarchy[profile.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      const hasAccess = userLevel >= requiredLevel;

      if (!hasAccess) {
        securityMonitor.logEvent({
          action_type: 'unauthorized_access_attempt',
          resource_type: 'permission',
          resource_id: requiredRole,
          success: false,
          error_message: `User with role ${profile.role} attempted to access ${requiredRole} resource`
        });
      }

      return hasAccess;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, []);

  // Cleanup security monitor
  useEffect(() => {
    return () => {
      securityMonitor.cleanup();
    };
  }, []);

  return {
    sanitizeAndValidateInput,
    hasPermission,
    securityMonitor
  };
};
