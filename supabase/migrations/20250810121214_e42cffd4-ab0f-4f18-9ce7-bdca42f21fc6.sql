-- CRITICAL SECURITY FIXES - Phase 1B: Remaining Database Security Issues
-- This migration addresses remaining security issues while avoiding conflicts

-- =====================================================
-- PART 1: Continue Fixing Function Search Path Vulnerabilities
-- Add SET search_path = 'public' to remaining functions
-- =====================================================

-- Fix more critical functions with search path issues
CREATE OR REPLACE FUNCTION public.calculate_page_depth()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    page RECORD;
    parent_depth INTEGER;
BEGIN
    FOR page IN SELECT id, parent_page_id FROM wiki_pages WHERE parent_page_id IS NOT NULL LOOP
        SELECT depth INTO parent_depth FROM wiki_pages WHERE id = page.parent_page_id;
        UPDATE wiki_pages SET depth = parent_depth + 1 WHERE id = page.id;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_company_hierarchy(company_uuid uuid)
 RETURNS TABLE(id uuid, name text, slug text, level integer, path text)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH RECURSIVE company_tree AS (
        -- Base case: the parent company
        SELECT 
            c.id,
            c.name,
            c.slug,
            0 as level,
            ARRAY[c.name] as path
        FROM companies c
        WHERE c.id = company_uuid
        
        UNION ALL
        
        -- Recursive case: child companies
        SELECT 
            child.id,
            child.name,
            child.slug,
            ct.level + 1,
            ct.path || child.name
        FROM companies child
        INNER JOIN company_tree ct ON child.parent_company_id = ct.id
    )
    SELECT 
        ct.id,
        ct.name,
        ct.slug,
        ct.level,
        array_to_string(ct.path, ' > ') as path
    FROM company_tree ct
    ORDER BY ct.level, ct.name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_child_companies(parent_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM companies
        WHERE parent_company_id = parent_uuid
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_parent_hierarchy(company_uuid uuid)
 RETURNS TABLE(id uuid, name text, slug text, level integer)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH RECURSIVE parent_tree AS (
        -- Base case: the current company
        SELECT 
            c.id,
            c.name,
            c.slug,
            0 as level
        FROM companies c
        WHERE c.id = company_uuid
        
        UNION ALL
        
        -- Recursive case: parent companies
        SELECT 
            parent.id,
            parent.name,
            parent.slug,
            pt.level + 1
        FROM companies parent
        INNER JOIN parent_tree pt ON parent.id = pt.parent_company_id
    )
    SELECT 
        pt.id,
        pt.name,
        pt.slug,
        pt.level
    FROM parent_tree pt
    ORDER BY pt.level DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_player_verification_status(p_player_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  badge_info RECORD;
  reservation_info RECORD;
BEGIN
  -- Get badge information
  SELECT * INTO badge_info 
  FROM public.player_badges 
  WHERE player_uuid = p_player_uuid 
  ORDER BY is_verified DESC, assigned_at DESC 
  LIMIT 1;
  
  -- Get reservation information
  SELECT * INTO reservation_info 
  FROM public.username_reservations ur
  JOIN public.players p ON p.uuid = p_player_uuid
  WHERE ur.minecraft_username = p.username;
  
  RETURN jsonb_build_object(
    'badge_type', COALESCE(badge_info.badge_type, 'Player'),
    'badge_color', COALESCE(badge_info.badge_color, '#6b7280'),
    'is_verified', COALESCE(badge_info.is_verified, false),
    'is_reserved', reservation_info.id IS NOT NULL,
    'verified_at', reservation_info.verified_at
  );
END;
$function$;

-- =====================================================
-- PART 2: Add Missing RLS Policies (Only for tables that don't have them)
-- Using IF NOT EXISTS to avoid conflicts
-- =====================================================

-- Check and add policies for specific tables that need them
DO $$
BEGIN
    -- Only add policies if they don't exist

    -- For api_usage table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_usage' 
        AND policyname = 'Admins can read API usage data'
    ) THEN
        CREATE POLICY "Admins can read API usage data" 
        ON public.api_usage 
        FOR SELECT 
        USING (EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'moderator'::app_role])
        ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_usage' 
        AND policyname = 'System can insert API usage data'
    ) THEN
        CREATE POLICY "System can insert API usage data" 
        ON public.api_usage 
        FOR INSERT 
        WITH CHECK (true);
    END IF;

    -- For tables that need basic read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'central_fund_investments' 
        AND policyname = 'Allow public read access to central fund investments'
    ) THEN
        CREATE POLICY "Allow public read access to central fund investments" 
        ON public.central_fund_investments 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'forex_central_fund_trades' 
        AND policyname = 'Allow public read access to forex central trades'
    ) THEN
        CREATE POLICY "Allow public read access to forex central trades" 
        ON public.forex_central_fund_trades 
        FOR SELECT 
        USING (true);
    END IF;

END $$;

-- =====================================================
-- PART 3: Create Security Audit Log Table if Missing
-- Using IF NOT EXISTS to avoid conflicts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  success boolean DEFAULT true,
  error_message text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit log if not already enabled
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for security audit log (with conflict check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'security_audit_log' 
        AND policyname = 'Admins can view security audit logs'
    ) THEN
        CREATE POLICY "Admins can view security audit logs" 
        ON public.security_audit_log 
        FOR SELECT 
        USING (EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'moderator'::app_role])
        ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'security_audit_log' 
        AND policyname = 'System can insert security audit logs'
    ) THEN
        CREATE POLICY "System can insert security audit logs" 
        ON public.security_audit_log 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- =====================================================
-- PART 4: Add Indexes for Performance (with conflict check)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON public.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Log the completion
INSERT INTO public.security_audit_log (
  action_type, 
  resource_type, 
  success, 
  old_values
) VALUES (
  'security_migration_phase_1b_completed',
  'database',
  true,
  jsonb_build_object(
    'migration', 'critical_security_fixes_phase_1b',
    'additional_functions_fixed', 5,
    'rls_policies_checked_and_added', true,
    'security_audit_table_ensured', true
  )
);