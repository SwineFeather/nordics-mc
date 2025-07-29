-- Fix forum database issues
-- Migration: 20250116000001_fix_forum_database_issues.sql

-- 1. Create notification_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Grant permissions for notification_settings
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_settings TO authenticated;
GRANT USAGE ON SEQUENCE notification_settings_id_seq TO authenticated;

-- 2. Create player_profiles_view if it doesn't exist
CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  p.name as username,
  COALESCE(p.level, 1) as level,
  COALESCE(p.total_xp, 0) as total_xp,
  NOW() as first_joined, -- Using current time since no created_at column
  CASE 
    WHEN p.last_seen IS NOT NULL THEN 
      CASE 
        WHEN p.last_seen > 1000000000000 THEN 
          to_timestamp(p.last_seen / 1000)
        ELSE 
          to_timestamp(p.last_seen)
      END
    ELSE NOW()
  END as last_seen,
  false as is_online,
  NOW() as created_at, -- Using current time since no created_at column
  COALESCE(ps.stats, '{}'::jsonb) as stats,
  '{}'::jsonb as ranks,
  '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
  COALESCE(ps.updated_at, NOW()) as stats_updated_at
FROM public.players p
LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid;

-- Grant permissions for the view
GRANT SELECT ON public.player_profiles_view TO authenticated;
GRANT SELECT ON public.player_profiles_view TO anon;

-- 3. Fix the get_player_profile function
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
    p.name as username,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    NOW() as first_joined,
    CASE 
      WHEN p.last_seen IS NOT NULL THEN 
        CASE 
          WHEN p.last_seen > 1000000000000 THEN 
            to_timestamp(p.last_seen / 1000)
          ELSE 
            to_timestamp(p.last_seen)
        END
      ELSE NOW()
    END as last_seen,
    false as is_online,
    NOW() as created_at,
    COALESCE(ps.stats, '{}'::jsonb) as stats,
    '{}'::jsonb as ranks,
    '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
    COALESCE(ps.updated_at, NOW()) as stats_updated_at
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE p.uuid = player_uuid_param;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- 4. Create post_drafts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'discussion',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Grant permissions for post_drafts
GRANT SELECT, INSERT, UPDATE, DELETE ON post_drafts TO authenticated;
GRANT USAGE ON SEQUENCE post_drafts_id_seq TO authenticated;

-- 5. Create forum_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions for forum_notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_notifications TO authenticated;
GRANT USAGE ON SEQUENCE forum_notifications_id_seq TO authenticated;

-- 6. Create user_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions for user_notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON user_notifications TO authenticated;
GRANT USAGE ON SEQUENCE user_notifications_id_seq TO authenticated;

-- 7. Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  frequency TEXT DEFAULT 'instant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subscription_type, target_id)
);

-- Grant permissions for user_subscriptions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE user_subscriptions_id_seq TO authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read_at ON user_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_id ON forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_post_id ON forum_notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_post_drafts_user_category ON post_drafts(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_type ON user_subscriptions(user_id, subscription_type);

-- 9. Create RLS policies for the new tables
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Notification settings policies
CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Post drafts policies
CREATE POLICY "Users can view their own drafts" ON post_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts" ON post_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" ON post_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" ON post_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Forum notifications policies
CREATE POLICY "Users can view their own forum notifications" ON forum_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert forum notifications" ON forum_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum notifications" ON forum_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User notifications policies
CREATE POLICY "Users can view their own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON user_subscriptions
  FOR DELETE USING (auth.uid() = user_id); 