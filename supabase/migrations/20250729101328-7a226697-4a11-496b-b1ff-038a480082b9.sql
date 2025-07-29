
-- Add missing RLS policies for tables that have RLS enabled but no policies
-- This fixes the critical database security vulnerability

-- Fix admin_actions table policies
DROP POLICY IF EXISTS "admin_actions_admin_policy" ON admin_actions;
CREATE POLICY "Admins and moderators can manage admin actions"
ON admin_actions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Fix backup_log table policies  
DROP POLICY IF EXISTS "backup_log_admin_policy" ON backup_log;
CREATE POLICY "Admins can manage backup logs"
ON backup_log
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Fix api_usage table policies
DROP POLICY IF EXISTS "api_usage_read_policy" ON api_usage;
DROP POLICY IF EXISTS "api_usage_write_policy" ON api_usage;
CREATE POLICY "Admins can read API usage"
ON api_usage
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "System can write API usage"
ON api_usage
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix economic_analytics table policies
DROP POLICY IF EXISTS "economic_analytics_read_policy" ON economic_analytics;
CREATE POLICY "Authenticated users can read economic analytics"
ON economic_analytics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage economic analytics"
ON economic_analytics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add audit logging for security-critical operations
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security audit logs"
ON security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_action_type text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action_type, resource_type, resource_id,
    old_values, new_values, success, error_message
  ) VALUES (
    auth.uid(), p_action_type, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_success, p_error_message
  );
END;
$$;

-- Add trigger to log profile role changes
CREATE OR REPLACE FUNCTION audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM log_security_event(
      'role_change',
      'profile',
      NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS profile_audit_trigger ON profiles;
CREATE TRIGGER profile_audit_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_profile_changes();

-- Fix search path for security functions
ALTER FUNCTION log_security_event(text, text, text, jsonb, jsonb, boolean, text) 
SET search_path = public, auth;

ALTER FUNCTION audit_profile_changes() 
SET search_path = public, auth;
