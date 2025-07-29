-- Complete Database Functions Fix
-- Run this in your Supabase SQL Editor to fix all database issues

-- 1. Fix get_player_profile function (404 Not Found error)
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
    COALESCE(p.name, p.username) as username,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    p.created_at as first_joined,
    CASE 
      WHEN p.last_seen IS NOT NULL THEN 
        CASE 
          WHEN p.last_seen > 1000000000000 THEN 
            to_timestamp(p.last_seen / 1000)
          ELSE 
            to_timestamp(p.last_seen)
        END
      ELSE p.created_at
    END as last_seen,
    false as is_online,
    p.created_at,
    COALESCE(ps.stats, '{}'::jsonb) as stats,
    '{}'::jsonb as ranks,
    '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
    COALESCE(ps.updated_at, p.updated_at) as stats_updated_at
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE p.uuid = player_uuid_param;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- 2. Create helper function for towns data (needed by edge function)
CREATE OR REPLACE FUNCTION public.get_town_data_for_wiki(town_name_param TEXT)
RETURNS TABLE (
  name TEXT,
  mayor_name TEXT,
  residents_count INTEGER,
  balance NUMERIC,
  level INTEGER,
  total_xp BIGINT,
  nation_name TEXT,
  is_capital BOOLEAN,
  world_name TEXT,
  location_x INTEGER,
  location_z INTEGER,
  spawn_x DOUBLE PRECISION,
  spawn_y DOUBLE PRECISION,
  spawn_z DOUBLE PRECISION,
  tag TEXT,
  board TEXT,
  max_residents INTEGER,
  max_plots INTEGER,
  taxes NUMERIC,
  plot_tax NUMERIC,
  created_at TIMESTAMP
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    t.name,
    t.mayor_name,
    t.residents_count,
    t.balance,
    t.level,
    t.total_xp,
    t.nation_name,
    t.is_capital,
    t.world_name,
    t.location_x,
    t.location_z,
    t.spawn_x,
    t.spawn_y,
    t.spawn_z,
    t.tag,
    t.board,
    t.max_residents,
    t.max_plots,
    t.taxes,
    t.plot_tax,
    t.created_at
  FROM public.towns t
  WHERE t.name = town_name_param;
$$;

-- 3. Create helper function for nations data (needed by edge function)
CREATE OR REPLACE FUNCTION public.get_nation_data_for_wiki(nation_name_param TEXT)
RETURNS TABLE (
  name TEXT,
  leader_name TEXT,
  capital_town_name TEXT,
  balance NUMERIC,
  towns_count INTEGER,
  residents_count INTEGER,
  tag TEXT,
  created_at TIMESTAMP,
  board TEXT,
  taxes NUMERIC,
  town_tax NUMERIC,
  max_towns INTEGER,
  ally_count INTEGER,
  enemy_count INTEGER,
  activity_score INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.name,
    n.leader_name,
    n.capital_name as capital_town_name,
    n.balance,
    n.towns_count,
    n.residents_count,
    n.tag,
    n.created_at,
    n.board,
    n.taxes,
    n.town_tax,
    n.max_towns,
    n.ally_count,
    n.enemy_count,
    n.activity_score
  FROM public.nations n
  WHERE n.name = nation_name_param;
$$;

-- Grant execute permissions for helper functions
GRANT EXECUTE ON FUNCTION public.get_town_data_for_wiki(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_town_data_for_wiki(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_nation_data_for_wiki(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nation_data_for_wiki(TEXT) TO anon;

-- 4. Create player_profiles_view
CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  COALESCE(p.name, p.username) as username,
  COALESCE(p.level, 1) as level,
  COALESCE(p.total_xp, 0) as total_xp,
  p.created_at as first_joined,
  CASE 
    WHEN p.last_seen IS NOT NULL THEN 
      CASE 
        WHEN p.last_seen > 1000000000000 THEN 
          to_timestamp(p.last_seen / 1000)
        ELSE 
          to_timestamp(p.last_seen)
      END
    ELSE p.created_at
  END as last_seen,
  false as is_online,
  p.created_at,
  COALESCE(ps.stats, '{}'::jsonb) as stats,
  '{}'::jsonb as ranks,
  '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
  COALESCE(ps.updated_at, p.updated_at) as stats_updated_at
FROM public.players p
LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid;

-- Grant permissions for the view
GRANT SELECT ON public.player_profiles_view TO authenticated;
GRANT SELECT ON public.player_profiles_view TO anon;

-- 5. Fix notification_settings table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_settings TO authenticated;

-- 6. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  forum_notifications BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(COALESCE(name, username));
CREATE INDEX IF NOT EXISTS idx_players_uuid ON public.players(uuid);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_uuid ON public.player_stats(player_uuid);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- 8. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Create RLS policies for notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- 11. Create helper functions for player data
CREATE OR REPLACE FUNCTION public.get_player_badges(p_player_uuid TEXT)
RETURNS TABLE (
  id UUID,
  player_uuid TEXT,
  badge_type TEXT,
  badge_color TEXT,
  is_verified BOOLEAN,
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID,
  icon TEXT,
  icon_only BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    pb.id,
    pb.player_uuid,
    pb.badge_type,
    pb.badge_color,
    pb.is_verified,
    pb.assigned_at,
    pb.assigned_by,
    pb.icon,
    pb.icon_only
  FROM public.player_badges pb
  WHERE pb.player_uuid = p_player_uuid
  ORDER BY pb.assigned_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_badges(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_badges(TEXT) TO anon;

-- 12. Create function to calculate player achievements
CREATE OR REPLACE FUNCTION public.calculate_player_achievements(
  p_player_uuid TEXT,
  p_player_stats JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function - you can implement achievement logic here
  -- For now, just log that it was called
  RAISE NOTICE 'Calculating achievements for player % with stats %', p_player_uuid, p_player_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_player_achievements(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_player_achievements(TEXT, JSONB) TO anon;

-- 13. Create function to get player verification status
CREATE OR REPLACE FUNCTION public.get_player_verification_status(p_player_uuid TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'verified', EXISTS(SELECT 1 FROM public.player_badges WHERE player_uuid = p_player_uuid AND is_verified = true),
    'badge_count', (SELECT COUNT(*) FROM public.player_badges WHERE player_uuid = p_player_uuid),
    'verified_badges', (SELECT COUNT(*) FROM public.player_badges WHERE player_uuid = p_player_uuid AND is_verified = true)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_player_verification_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_verification_status(TEXT) TO anon;

-- 14. Create function to get player stats by category
CREATE OR REPLACE FUNCTION public.get_player_stats_by_category(
  p_player_uuid TEXT,
  p_category TEXT
)
RETURNS TABLE (
  stat_name TEXT,
  stat_value NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    key::TEXT as stat_name,
    value::NUMERIC as stat_value
  FROM public.player_stats ps,
  jsonb_each(ps.stats) as stats(key, value)
  WHERE ps.player_uuid = p_player_uuid
  AND key LIKE p_category || '%';
$$;

GRANT EXECUTE ON FUNCTION public.get_player_stats_by_category(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_stats_by_category(TEXT, TEXT) TO anon;

-- 15. Create function to get top players by stat
CREATE OR REPLACE FUNCTION public.get_top_players_by_stat(
  p_stat_name TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  player_name TEXT,
  stat_value NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(p.name, p.username) as player_name,
    (ps.stats->>p_stat_name)::NUMERIC as stat_value
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE ps.stats ? p_stat_name
  ORDER BY (ps.stats->>p_stat_name)::NUMERIC DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_players_by_stat(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_players_by_stat(TEXT, INTEGER) TO anon;

-- 16. Create function to get points leaderboard
CREATE OR REPLACE FUNCTION public.get_points_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  player_name TEXT,
  total_points INTEGER,
  bronze_count INTEGER,
  silver_count INTEGER,
  gold_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(p.name, p.username) as player_name,
    COALESCE((ps.stats->>'medalPoints')::INTEGER, 0) as total_points,
    COALESCE((ps.stats->>'bronzeMedals')::INTEGER, 0) as bronze_count,
    COALESCE((ps.stats->>'silverMedals')::INTEGER, 0) as silver_count,
    COALESCE((ps.stats->>'goldMedals')::INTEGER, 0) as gold_count
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  ORDER BY COALESCE((ps.stats->>'medalPoints')::INTEGER, 0) DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_points_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_points_leaderboard(INTEGER) TO anon;

-- 17. Create function to get medal leaderboard
CREATE OR REPLACE FUNCTION public.get_medal_leaderboard(
  p_medal_type TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  player_name TEXT,
  medal_count INTEGER,
  total_points INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(p.name, p.username) as player_name,
    COALESCE((ps.stats->>(p_medal_type || 'Medals'))::INTEGER, 0) as medal_count,
    COALESCE((ps.stats->>'medalPoints')::INTEGER, 0) as total_points
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  ORDER BY COALESCE((ps.stats->>(p_medal_type || 'Medals'))::INTEGER, 0) DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_medal_leaderboard(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_medal_leaderboard(TEXT, INTEGER) TO anon;

-- 18. Create function to update player medals
CREATE OR REPLACE FUNCTION public.update_player_medals(p_player_uuid TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function - you can implement medal update logic here
  RAISE NOTICE 'Updating medals for player %', p_player_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_player_medals(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_player_medals(TEXT) TO anon;

-- 19. Create function to update player points
CREATE OR REPLACE FUNCTION public.update_player_points(p_player_uuid TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function - you can implement points update logic here
  RAISE NOTICE 'Updating points for player %', p_player_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_player_points(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_player_points(TEXT) TO anon;

-- 20. Create function to sync all achievements
CREATE OR REPLACE FUNCTION public.sync_all_achievements()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder function - you can implement achievement sync logic here
  RAISE NOTICE 'Syncing all achievements';
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_all_achievements() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_all_achievements() TO anon;

-- 21. Create function to check if user has role or higher
CREATE OR REPLACE FUNCTION public.has_role_or_higher(p_required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role >= p_required_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role_or_higher(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_or_higher(TEXT) TO anon;

-- 22. Test the setup
SELECT 'Database functions setup complete!' as status;
SELECT COUNT(*) as functions_count FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT COUNT(*) as views_count FROM pg_views WHERE schemaname = 'public';
SELECT COUNT(*) as tables_count FROM pg_tables WHERE schemaname = 'public'; 