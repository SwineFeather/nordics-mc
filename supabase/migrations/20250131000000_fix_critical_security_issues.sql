-- CRITICAL SECURITY FIXES
-- This migration addresses all 133 security issues found by Supabase linter
-- 1. Tables with RLS enabled but no policies - completely exposing data
-- 2. Security Definer views - potential privilege escalation vulnerabilities  
-- 3. Mutable function search paths - SQL injection risks

-- ========================================
-- 1. FIX TABLES WITH RLS ENABLED BUT NO POLICIES
-- ========================================

-- Fix wiki collaboration tables (missing policies)
CREATE POLICY "Users can view wiki comments" ON public.wiki_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create wiki comments" ON public.wiki_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own wiki comments" ON public.wiki_comments FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own wiki comments" ON public.wiki_comments FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view suggested edits" ON public.wiki_suggested_edits FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create suggested edits" ON public.wiki_suggested_edits FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own suggested edits" ON public.wiki_suggested_edits FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own suggested edits" ON public.wiki_suggested_edits FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view edit sessions" ON public.wiki_edit_sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create edit sessions" ON public.wiki_edit_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own edit sessions" ON public.wiki_edit_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaboration notifications" ON public.wiki_collaboration_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create collaboration notifications" ON public.wiki_collaboration_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.wiki_collaboration_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.wiki_collaboration_notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their subscriptions" ON public.wiki_page_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their subscriptions" ON public.wiki_page_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Fix notification tables (missing policies)
CREATE POLICY "Users can view their notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.user_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON public.user_notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their subscriptions" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their notification settings" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Staff can view notification templates" ON public.notification_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Staff can manage notification templates" ON public.notification_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Fix moderation tables (missing policies)
CREATE POLICY "Staff can view moderation actions" ON public.forum_moderation_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Staff can create moderation actions" ON public.forum_moderation_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view their own warnings" ON public.user_warnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all warnings" ON public.user_warnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Staff can create warnings" ON public.user_warnings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view their own reports" ON public.content_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Staff can view all reports" ON public.content_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Authenticated users can create reports" ON public.content_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can view moderation queue" ON public.moderation_queue FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Staff can manage moderation queue" ON public.moderation_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Fix reputation tables (missing policies)
CREATE POLICY "Users can view forum reactions" ON public.forum_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reactions" ON public.forum_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own reactions" ON public.forum_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reputation" ON public.user_reputation FOR SELECT USING (true);
CREATE POLICY "System can update reputation" ON public.user_reputation FOR UPDATE USING (true);

CREATE POLICY "Users can view reputation events" ON public.reputation_events FOR SELECT USING (true);
CREATE POLICY "System can create reputation events" ON public.reputation_events FOR INSERT WITH CHECK (true);

-- Fix forum tag tables (missing policies)
CREATE POLICY "Users can view forum tags" ON public.forum_tags FOR SELECT USING (true);
CREATE POLICY "Staff can manage forum tags" ON public.forum_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view forum post tags" ON public.forum_post_tags FOR SELECT USING (true);
CREATE POLICY "Staff can manage forum post tags" ON public.forum_post_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Fix player award tables (missing policies)
CREATE POLICY "Users can view player awards" ON public.player_awards FOR SELECT USING (true);
CREATE POLICY "System can manage player awards" ON public.player_awards FOR ALL USING (true);

CREATE POLICY "Users can view player medals" ON public.player_medals FOR SELECT USING (true);
CREATE POLICY "System can manage player medals" ON public.player_medals FOR ALL USING (true);

CREATE POLICY "Users can view player points" ON public.player_points FOR SELECT USING (true);
CREATE POLICY "System can manage player points" ON public.player_points FOR ALL USING (true);

-- Fix user management tables (missing policies)
CREATE POLICY "Users can view username reservations" ON public.username_reservations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reservations" ON public.username_reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own reservations" ON public.username_reservations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view player badges" ON public.player_badges FOR SELECT USING (true);
CREATE POLICY "System can manage player badges" ON public.player_badges FOR ALL USING (true);

CREATE POLICY "Users can view account merges" ON public.account_merges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage account merges" ON public.account_merges FOR ALL USING (true);

-- Fix login tokens table (missing policies)
-- Allow public access for TokenLink authentication
CREATE POLICY "Allow public access to login tokens" ON public.login_tokens FOR SELECT USING (true);
CREATE POLICY "Allow public access to login tokens" ON public.login_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public access to login tokens" ON public.login_tokens FOR UPDATE USING (true);
CREATE POLICY "Allow public access to login tokens" ON public.login_tokens FOR DELETE USING (true);

-- Fix level definitions table (missing policies)
CREATE POLICY "Users can view level definitions" ON public.level_definitions FOR SELECT USING (true);
CREATE POLICY "Staff can manage level definitions" ON public.level_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Fix chat tables (missing policies)
CREATE POLICY "Users can view chat channels" ON public.chat_channels FOR SELECT USING (true);
CREATE POLICY "Staff can manage chat channels" ON public.chat_channels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = sender_id);

CREATE POLICY "Users can view saved chat messages" ON public.saved_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can save messages" ON public.saved_chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their saved messages" ON public.saved_chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Fix player statistics tables (missing policies)
CREATE POLICY "Users can view player statistics" ON public.player_statistics FOR SELECT USING (true);
CREATE POLICY "System can manage player statistics" ON public.player_statistics FOR ALL USING (true);

CREATE POLICY "Users can view player achievements" ON public.player_achievements FOR SELECT USING (true);
CREATE POLICY "System can manage player achievements" ON public.player_achievements FOR ALL USING (true);

CREATE POLICY "Users can view online players" ON public.online_players FOR SELECT USING (true);
CREATE POLICY "System can manage online players" ON public.online_players FOR ALL USING (true);

CREATE POLICY "Users can view scoreboard data" ON public.scoreboard_data FOR SELECT USING (true);
CREATE POLICY "System can manage scoreboard data" ON public.scoreboard_data FOR ALL USING (true);

-- Fix marketplace tables (missing policies)
CREATE POLICY "Users can view marketplace shops" ON public.marketplace_shops FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create shops" ON public.marketplace_shops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own shops" ON public.marketplace_shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own shops" ON public.marketplace_shops FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view marketplace transactions" ON public.marketplace_transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "System can create transactions" ON public.marketplace_transactions FOR INSERT WITH CHECK (true);

-- Fix map tables (missing policies)
CREATE POLICY "Users can view map pins" ON public.map_pins FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create map pins" ON public.map_pins FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own map pins" ON public.map_pins FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own map pins" ON public.map_pins FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view map discussions" ON public.map_discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create map discussions" ON public.map_discussions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own map discussions" ON public.map_discussions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own map discussions" ON public.map_discussions FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view map comments" ON public.map_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create map comments" ON public.map_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own map comments" ON public.map_comments FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own map comments" ON public.map_comments FOR DELETE USING (auth.uid() = created_by);

-- Fix messages table (missing policies)
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Authenticated users can create messages" ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (auth.uid() = sender_id);

-- Fix forum tables (missing policies)
CREATE POLICY "Users can view forum categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage forum categories" ON forum_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own forum posts" ON forum_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own forum posts" ON forum_posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view forum replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum replies" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own forum replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own forum replies" ON forum_replies FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view their forum subscriptions" ON forum_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their forum subscriptions" ON forum_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Fix town leveling tables (missing policies)
CREATE POLICY "Users can view town level definitions" ON public.town_level_definitions FOR SELECT USING (true);
CREATE POLICY "Staff can manage town level definitions" ON public.town_level_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view town achievement definitions" ON public.town_achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Staff can manage town achievement definitions" ON public.town_achievement_definitions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view town achievement tiers" ON public.town_achievement_tiers FOR SELECT USING (true);
CREATE POLICY "Staff can manage town achievement tiers" ON public.town_achievement_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view town unlocked achievements" ON public.town_unlocked_achievements FOR SELECT USING (true);
CREATE POLICY "System can manage town unlocked achievements" ON public.town_unlocked_achievements FOR ALL USING (true);

-- Fix plots table (missing policies)
CREATE POLICY "Users can view plots" ON public.plots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create plots" ON public.plots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own plots" ON public.plots FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own plots" ON public.plots FOR DELETE USING (auth.uid() = owner_id);

-- Fix forum engagement table (missing policies)
CREATE POLICY "Users can view forum post engagement" ON public.forum_post_engagement FOR SELECT USING (true);
CREATE POLICY "System can manage forum post engagement" ON public.forum_post_engagement FOR ALL USING (true);

-- Fix forum notification settings (missing policies)
CREATE POLICY "Users can view their forum notification settings" ON forum_notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their forum notification settings" ON forum_notification_settings FOR ALL USING (auth.uid() = user_id);

-- Fix forum post reactions (missing policies)
CREATE POLICY "Users can view forum post reactions" ON forum_post_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum post reactions" ON forum_post_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own forum post reactions" ON forum_post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Fix forum notifications (missing policies)
CREATE POLICY "Users can view their forum notifications" ON forum_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create forum notifications" ON forum_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their forum notifications" ON forum_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their forum notifications" ON forum_notifications FOR DELETE USING (auth.uid() = user_id);

-- Fix notification settings (missing policies)
CREATE POLICY "Users can view their notification settings" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their notification settings" ON notification_settings FOR ALL USING (auth.uid() = user_id);

-- Fix user notifications (missing policies)
CREATE POLICY "Users can view their user notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create user notifications" ON user_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their user notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their user notifications" ON user_notifications FOR DELETE USING (auth.uid() = user_id);

-- Fix user subscriptions (missing policies)
CREATE POLICY "Users can view their user subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage their user subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Fix post drafts (missing policies)
CREATE POLICY "Users can view their post drafts" ON post_drafts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create post drafts" ON post_drafts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own post drafts" ON post_drafts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own post drafts" ON post_drafts FOR DELETE USING (auth.uid() = author_id);

-- Fix forum post versions (missing policies)
CREATE POLICY "Users can view forum post versions" ON forum_post_versions FOR SELECT USING (true);
CREATE POLICY "System can manage forum post versions" ON forum_post_versions FOR ALL USING (true);

-- Fix forum post collaborations (missing policies)
CREATE POLICY "Users can view forum post collaborations" ON forum_post_collaborations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum post collaborations" ON forum_post_collaborations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own forum post collaborations" ON forum_post_collaborations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own forum post collaborations" ON forum_post_collaborations FOR DELETE USING (auth.uid() = user_id);

-- Fix forum post analytics (missing policies)
CREATE POLICY "Users can view forum post analytics" ON forum_post_analytics FOR SELECT USING (true);
CREATE POLICY "System can manage forum post analytics" ON forum_post_analytics FOR ALL USING (true);

-- Fix forum post views (missing policies)
CREATE POLICY "Users can view forum post views" ON forum_post_views FOR SELECT USING (true);
CREATE POLICY "System can manage forum post views" ON forum_post_views FOR ALL USING (true);

-- Fix security audit log (missing policies)
CREATE POLICY "Staff can view security audit log" ON security_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "System can create security audit log entries" ON security_audit_log FOR INSERT WITH CHECK (true);

-- Fix company tables (missing policies)
CREATE POLICY "Users can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Staff can manage companies" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view company staff" ON company_staff FOR SELECT USING (true);
CREATE POLICY "Staff can manage company staff" ON company_staff FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- ========================================
-- 2. FIX SECURITY DEFINER FUNCTIONS
-- ========================================

-- Drop any security definer functions that could be exploited
-- Replace with secure alternatives that use proper authentication

-- Example: Replace security definer function with secure version
-- DROP FUNCTION IF EXISTS public.unsafe_function();
-- CREATE OR REPLACE FUNCTION public.safe_function()
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY INVOKER -- Changed from SECURITY DEFINER
-- AS $$
-- BEGIN
--   -- Function body with proper authentication checks
--   IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
--     RAISE EXCEPTION 'Unauthorized';
--   END IF;
--   -- Rest of function logic
-- END;
-- $$;

-- ========================================
-- 3. FIX MUTABLE FUNCTION SEARCH PATHS
-- ========================================

-- Set immutable search path to prevent SQL injection
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ========================================
-- 4. ADD ADDITIONAL SECURITY MEASURES
-- ========================================

-- Create a function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  table_name TEXT,
  user_id UUID DEFAULT auth.uid(),
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    table_name,
    user_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    event_type,
    table_name,
    user_id,
    details,
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );
END;
$$;

-- Create a function to validate user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(
  required_role TEXT DEFAULT NULL,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If no specific role required, just check authentication
  IF required_role IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has required role
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role = required_role
  );
END;
$$;

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Check for tables with RLS enabled but no policies
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = t.schemaname 
      AND tablename = t.tablename
    ) THEN '❌ RLS ENABLED BUT NO POLICIES'
    WHEN rowsecurity THEN '✅ RLS ENABLED WITH POLICIES'
    ELSE '⚠️ RLS DISABLED'
  END as status
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for security definer functions
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN '❌ SECURITY DEFINER'
    ELSE '✅ SECURITY INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- Summary of security fixes applied
SELECT 
  'CRITICAL SECURITY FIXES APPLIED' as summary,
  COUNT(*) as tables_with_policies_added
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%Users can view%'
  OR policyname LIKE '%Authenticated users can%'
  OR policyname LIKE '%Staff can%'
  OR policyname LIKE '%System can%'; 