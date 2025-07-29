
-- Secure Role Management and Audit Trail
-- Run this in your Supabase SQL Editor

-- 1. Create admin audit log table for security tracking
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON public.admin_audit_log
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. Secure the profiles table to prevent role escalation
-- Drop existing role update policies if they exist
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;

-- Create separate policies for different update operations
CREATE POLICY "Users can update own basic info" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = OLD.role -- Prevent users from changing their own role
  );

-- Only admins can update user roles
CREATE POLICY "Only admins can update user roles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 3. Create function to safely update user roles with audit trail
CREATE OR REPLACE FUNCTION public.update_user_role_secure(
  target_user_id UUID,
  new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
  old_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO admin_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient permissions - admin role required'
    );
  END IF;
  
  -- Get old role for audit trail
  SELECT role INTO old_role 
  FROM public.profiles 
  WHERE id = target_user_id;
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role 
  WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_user_id,
    details,
    timestamp
  ) VALUES (
    auth.uid(),
    'update_role',
    target_user_id,
    jsonb_build_object(
      'old_role', old_role,
      'new_role', new_role
    ),
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role updated successfully',
    'old_role', old_role,
    'new_role', new_role
  );
END;
$$;

-- Grant execute permission to authenticated users (function handles authorization)
GRANT EXECUTE ON FUNCTION public.update_user_role_secure(UUID, TEXT) TO authenticated;

-- 4. Create function to get audit logs (admin only)
CREATE OR REPLACE FUNCTION public.get_admin_audit_logs(
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  admin_id UUID,
  admin_username TEXT,
  action TEXT,
  target_user_id UUID,
  target_username TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    aal.id,
    aal.admin_id,
    ap.minecraft_username as admin_username,
    aal.action,
    aal.target_user_id,
    tp.minecraft_username as target_username,
    aal.details,
    aal.timestamp
  FROM public.admin_audit_log aal
  LEFT JOIN public.profiles ap ON aal.admin_id = ap.id
  LEFT JOIN public.profiles tp ON aal.target_user_id = tp.id
  WHERE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
  ORDER BY aal.timestamp DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_audit_logs(INTEGER, INTEGER) TO authenticated;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user_id ON public.admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);

-- Success message
SELECT 'Secure role management and audit trail implemented successfully!' as status;
