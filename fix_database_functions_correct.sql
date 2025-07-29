-- Fix Database Functions - Based on Actual Table Structures
-- Run this in your Supabase SQL Editor

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
    p.uuid::text,
    p.name as username,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    NOW() as first_joined, -- Since created_at doesn't exist in players table
    CASE 
      WHEN p.last_seen IS NOT NULL AND p.last_seen > 0 THEN 
        to_timestamp(p.last_seen / 1000) AT TIME ZONE 'UTC'
      ELSE NULL
    END as last_seen,
    CASE 
      WHEN p.last_seen IS NOT NULL AND p.last_seen > 0 THEN 
        (EXTRACT(EPOCH FROM NOW()) * 1000 - p.last_seen) < 300000 -- 5 minutes
      ELSE false
    END as is_online,
    NOW() as created_at,
    COALESCE(ps.stats, '{}'::jsonb) as stats,
    '[]'::jsonb as ranks,
    '[]'::jsonb as medals,
    CASE 
      WHEN ps.last_updated IS NOT NULL AND ps.last_updated > 0 THEN 
        to_timestamp(ps.last_updated / 1000) AT TIME ZONE 'UTC'
      ELSE NULL
    END as stats_updated_at
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE p.uuid::text = player_uuid_param;
$$;

-- 2. Create helper function for town data
CREATE OR REPLACE FUNCTION public.get_town_data_for_wiki(town_name_param TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  mayor_name TEXT,
  balance NUMERIC,
  world_name TEXT,
  location_x INTEGER,
  location_z INTEGER,
  residents_count INTEGER,
  level INTEGER,
  total_xp BIGINT,
  nation_name TEXT,
  is_capital BOOLEAN,
  created_at TIMESTAMP,
  image_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.name,
    t.mayor_name,
    t.balance,
    t.world_name,
    t.location_x,
    t.location_z,
    t.residents_count,
    t.level,
    t.total_xp,
    t.nation_name,
    t.is_capital,
    t.created_at,
    t.image_url
  FROM public.towns t
  WHERE t.name = town_name_param;
$$;

-- 3. Create helper function for nation data
CREATE OR REPLACE FUNCTION public.get_nation_data_for_wiki(nation_name_param TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  leader_name TEXT,
  king_name TEXT,
  capital_town_name TEXT,
  balance NUMERIC,
  towns_count INTEGER,
  residents_count INTEGER,
  created_at TIMESTAMP,
  image_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.id,
    n.name,
    n.leader_name,
    n.king_name,
    n.capital_town_name,
    n.balance,
    n.towns_count,
    n.residents_count,
    n.created_at,
    n.image_url
  FROM public.nations n
  WHERE n.name = nation_name_param;
$$;

-- 4. Create function to get player stats
CREATE OR REPLACE FUNCTION public.get_player_stats(player_uuid_param TEXT)
RETURNS TABLE (
  player_uuid TEXT,
  stats JSONB,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ps.player_uuid::text,
    ps.stats,
    CASE 
      WHEN ps.last_updated IS NOT NULL AND ps.last_updated > 0 THEN 
        to_timestamp(ps.last_updated / 1000) AT TIME ZONE 'UTC'
      ELSE NULL
    END as last_updated
  FROM public.player_stats ps
  WHERE ps.player_uuid::text = player_uuid_param;
$$;

-- 5. Create function to get online players
CREATE OR REPLACE FUNCTION public.get_online_players()
RETURNS TABLE (
  uuid TEXT,
  name TEXT,
  level INTEGER,
  total_xp BIGINT,
  last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid::text,
    p.name,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    CASE 
      WHEN p.last_seen IS NOT NULL AND p.last_seen > 0 THEN 
        to_timestamp(p.last_seen / 1000) AT TIME ZONE 'UTC'
      ELSE NULL
    END as last_seen
  FROM public.players p
  WHERE p.last_seen IS NOT NULL 
    AND p.last_seen > 0 
    AND (EXTRACT(EPOCH FROM NOW()) * 1000 - p.last_seen) < 300000 -- 5 minutes
  ORDER BY p.last_seen DESC;
$$;

-- 6. Create function to get top players by level
CREATE OR REPLACE FUNCTION public.get_top_players_by_level(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  uuid TEXT,
  name TEXT,
  level INTEGER,
  total_xp BIGINT,
  rank INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid::text,
    p.name,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    ROW_NUMBER() OVER (ORDER BY COALESCE(p.level, 1) DESC, COALESCE(p.total_xp, 0) DESC) as rank
  FROM public.players p
  ORDER BY COALESCE(p.level, 1) DESC, COALESCE(p.total_xp, 0) DESC
  LIMIT limit_count;
$$;

-- 7. Create function to get top towns by level
CREATE OR REPLACE FUNCTION public.get_top_towns_by_level(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  level INTEGER,
  total_xp BIGINT,
  mayor_name TEXT,
  residents_count INTEGER,
  nation_name TEXT,
  rank INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.name,
    t.level,
    t.total_xp,
    t.mayor_name,
    t.residents_count,
    t.nation_name,
    ROW_NUMBER() OVER (ORDER BY t.level DESC, t.total_xp DESC) as rank
  FROM public.towns t
  ORDER BY t.level DESC, t.total_xp DESC
  LIMIT limit_count;
$$;

-- 8. Create function to get top nations by towns count
CREATE OR REPLACE FUNCTION public.get_top_nations_by_towns(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  towns_count INTEGER,
  residents_count INTEGER,
  leader_name TEXT,
  balance NUMERIC,
  rank INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.id,
    n.name,
    n.towns_count,
    n.residents_count,
    n.leader_name,
    n.balance,
    ROW_NUMBER() OVER (ORDER BY n.towns_count DESC, n.residents_count DESC) as rank
  FROM public.nations n
  ORDER BY n.towns_count DESC, n.residents_count DESC
  LIMIT limit_count;
$$;

-- 9. Create function to search players
CREATE OR REPLACE FUNCTION public.search_players(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  uuid TEXT,
  name TEXT,
  level INTEGER,
  total_xp BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid::text,
    p.name,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp
  FROM public.players p
  WHERE p.name ILIKE '%' || search_term || '%'
  ORDER BY COALESCE(p.level, 1) DESC, COALESCE(p.total_xp, 0) DESC
  LIMIT limit_count;
$$;

-- 10. Create function to search towns
CREATE OR REPLACE FUNCTION public.search_towns(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  mayor_name TEXT,
  level INTEGER,
  residents_count INTEGER,
  nation_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.name,
    t.mayor_name,
    t.level,
    t.residents_count,
    t.nation_name
  FROM public.towns t
  WHERE t.name ILIKE '%' || search_term || '%'
     OR t.mayor_name ILIKE '%' || search_term || '%'
  ORDER BY t.level DESC, t.residents_count DESC
  LIMIT limit_count;
$$;

-- 11. Create function to search nations
CREATE OR REPLACE FUNCTION public.search_nations(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  leader_name TEXT,
  towns_count INTEGER,
  residents_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.id,
    n.name,
    n.leader_name,
    n.towns_count,
    n.residents_count
  FROM public.nations n
  WHERE n.name ILIKE '%' || search_term || '%'
     OR n.leader_name ILIKE '%' || search_term || '%'
  ORDER BY n.towns_count DESC, n.residents_count DESC
  LIMIT limit_count;
$$;

-- 12. Create function to get player profile with extended info
CREATE OR REPLACE FUNCTION public.get_player_profile_extended(player_uuid_param TEXT)
RETURNS TABLE (
  uuid TEXT,
  username TEXT,
  level INTEGER,
  total_xp BIGINT,
  first_joined TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN,
  stats JSONB,
  profile_data JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid::text,
    p.name as username,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    NOW() as first_joined,
    CASE 
      WHEN p.last_seen IS NOT NULL AND p.last_seen > 0 THEN 
        to_timestamp(p.last_seen / 1000) AT TIME ZONE 'UTC'
      ELSE NULL
    END as last_seen,
    CASE 
      WHEN p.last_seen IS NOT NULL AND p.last_seen > 0 THEN 
        (EXTRACT(EPOCH FROM NOW()) * 1000 - p.last_seen) < 300000
      ELSE false
    END as is_online,
    COALESCE(ps.stats, '{}'::jsonb) as stats,
    jsonb_build_object(
      'full_name', pr.full_name,
      'bio', pr.bio,
      'minecraft_username', pr.minecraft_username,
      'avatar_url', pr.avatar_url,
      'role', pr.role,
      'is_moderator', pr.is_moderator,
      'is_admin', pr.is_admin
    ) as profile_data
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  LEFT JOIN public.profiles pr ON p.uuid::text = pr.id::text
  WHERE p.uuid::text = player_uuid_param;
$$;

-- Success message
SELECT 'Database functions fixed successfully!' as status; 