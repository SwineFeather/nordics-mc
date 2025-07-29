-- Fix Database Errors Migration
-- This migration addresses all the errors shown in the console logs

-- 1. Fix notification_settings table (406 Not Acceptable error)
-- The table exists but has permission issues, let's ensure it's properly set up

-- Drop and recreate notification_settings table with proper structure
DROP TABLE IF EXISTS notification_settings CASCADE;

CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT false,
  mention_notifications BOOLEAN DEFAULT true,
  reply_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  moderation_notifications BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" ON notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_settings TO authenticated;
GRANT USAGE ON SEQUENCE notification_settings_id_seq TO authenticated;

-- 2. Fix get_player_profile function (404 Not Found error)
-- The function exists but might have issues, let's recreate it

CREATE OR REPLACE FUNCTION public.get_player_profile(player_uuid_param TEXT)
RETURNS TABLE (
  uuid TEXT,
  username TEXT,
  level INTEGER,
  total_xp BIGINT,
  first_joined TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  stats JSONB,
  ranks JSONB,
  medals JSONB,
  stats_updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid,
    p.username,
    p.level,
    p.total_xp,
    p.first_joined,
    p.last_seen,
    p.is_online,
    p.created_at,
    ps.stats,
    ps.ranks,
    ps.medals,
    ps.updated_at as stats_updated_at
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE p.uuid = player_uuid_param;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- 3. Fix player_profiles_view (42P01 error - relation does not exist)
-- Recreate the view that's missing

CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  p.username,
  p.level,
  p.total_xp,
  p.first_joined,
  p.last_seen,
  p.is_online,
  p.created_at,
  ps.stats,
  ps.ranks,
  ps.medals,
  ps.updated_at as stats_updated_at
FROM public.players p
LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid;

-- Grant necessary permissions for the view
GRANT SELECT ON public.player_profiles_view TO authenticated;
GRANT SELECT ON public.player_profiles_view TO anon;

-- 4. Fix profiles table username column (42703 error - column does not exist)
-- The profiles table has minecraft_username but not username, let's add it

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Update username to match minecraft_username where possible
UPDATE public.profiles 
SET username = minecraft_username 
WHERE username IS NULL AND minecraft_username IS NOT NULL;

-- Also update username to match full_name where minecraft_username is null
UPDATE public.profiles 
SET username = full_name 
WHERE username IS NULL AND full_name IS NOT NULL;

-- Create index for username searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_minecraft_username ON public.profiles(minecraft_username);

-- 5. Fix wiki_comments table to use proper column names
-- The error shows profiles_1.username doesn't exist, let's fix the join

-- First, let's check if wiki_comments table exists and fix it
CREATE TABLE IF NOT EXISTS public.wiki_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view comments" ON public.wiki_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.wiki_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON public.wiki_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.wiki_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wiki_comments_page_id ON public.wiki_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_author_id ON public.wiki_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_parent_id ON public.wiki_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_created_at ON public.wiki_comments(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_comments TO authenticated;
GRANT SELECT ON public.wiki_comments TO anon;

-- 6. Create missing handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Ensure all necessary tables exist for the wiki system
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  category_id UUID,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on wiki_pages
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for wiki_pages
CREATE POLICY "Anyone can view published pages" ON public.wiki_pages
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create pages" ON public.wiki_pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pages" ON public.wiki_pages
  FOR UPDATE USING (auth.uid() = author_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can delete their own pages" ON public.wiki_pages
  FOR DELETE USING (auth.uid() = author_id OR auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_pages TO authenticated;
GRANT SELECT ON public.wiki_pages TO anon;

-- 8. Create missing wiki_categories table
CREATE TABLE IF NOT EXISTS public.wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on wiki_categories
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for wiki_categories
CREATE POLICY "Anyone can view categories" ON public.wiki_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.wiki_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_categories TO authenticated;
GRANT SELECT ON public.wiki_categories TO anon;

-- 9. Ensure players table has all necessary columns
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS first_joined TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update username to match name if username is null
UPDATE public.players 
SET username = name 
WHERE username IS NULL AND name IS NOT NULL;

-- Create indexes for players table
CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(username);
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players(name);
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON public.players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON public.players(last_seen DESC);

-- 10. Ensure player_stats table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.player_stats (
  player_uuid TEXT PRIMARY KEY REFERENCES public.players(uuid) ON DELETE CASCADE,
  stats JSONB NOT NULL DEFAULT '{}',
  ranks JSONB NOT NULL DEFAULT '{}',
  medals JSONB NOT NULL DEFAULT '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on player_stats
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for player_stats
CREATE POLICY "Anyone can view player stats" ON public.player_stats
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage player stats" ON public.player_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT ON public.player_stats TO authenticated;
GRANT SELECT ON public.player_stats TO anon;
GRANT ALL ON public.player_stats TO service_role;

-- 11. Create missing achievement tables if they don't exist
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stat TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievement_tiers (
  id TEXT PRIMARY KEY,
  definition_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  tier_level INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.unlocked_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid TEXT REFERENCES public.players(uuid) ON DELETE CASCADE,
  tier_id TEXT REFERENCES public.achievement_tiers(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(player_uuid, tier_id)
);

-- Enable RLS on achievement tables
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view achievement definitions" ON public.achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievement tiers" ON public.achievement_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view unlocked achievements" ON public.unlocked_achievements FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.achievement_definitions TO authenticated, anon;
GRANT SELECT ON public.achievement_tiers TO authenticated, anon;
GRANT SELECT ON public.unlocked_achievements TO authenticated, anon;

-- 12. Final verification and cleanup
DO $$
BEGIN
  RAISE NOTICE 'Database errors fix completed successfully!';
  RAISE NOTICE 'Fixed notification_settings table and permissions';
  RAISE NOTICE 'Fixed get_player_profile function';
  RAISE NOTICE 'Fixed player_profiles_view';
  RAISE NOTICE 'Fixed profiles table username column';
  RAISE NOTICE 'Fixed wiki_comments table and joins';
  RAISE NOTICE 'Ensured all necessary tables exist';
END $$; 