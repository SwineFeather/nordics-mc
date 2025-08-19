-- Fix login_tokens RLS policies for TokenLink authentication
-- Migration: 20250131000001-fix_login_tokens_rls.sql

-- Drop the existing broken policies that reference non-existent user_id field
DROP POLICY IF EXISTS "Users can view their login tokens" ON public.login_tokens;
DROP POLICY IF EXISTS "System can manage login tokens" ON public.login_tokens;

-- Drop any existing policies with similar names to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to login tokens" ON public.login_tokens;
DROP POLICY IF EXISTS "Allow public access to login tokens" ON public.login_tokens;
DROP POLICY IF EXISTS "Allow public access to login tokens" ON public.login_tokens;
DROP POLICY IF EXISTS "Allow public access to login tokens" ON public.login_tokens;

-- Create new policies that allow public access for TokenLink authentication
CREATE POLICY "login_tokens_select_policy" ON public.login_tokens FOR SELECT USING (true);
CREATE POLICY "login_tokens_insert_policy" ON public.login_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "login_tokens_update_policy" ON public.login_tokens FOR UPDATE USING (true);
CREATE POLICY "login_tokens_delete_policy" ON public.login_tokens FOR DELETE USING (true);
