-- Fix get_player_profile function to work without the missing player_profiles_view
-- Run this in your Supabase SQL Editor

-- First, let's check if the view exists
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'player_profiles_view';

-- If the view doesn't exist, create it
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

-- Now fix the get_player_profile function to work with the view
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
    ppv.uuid,
    ppv.username,
    ppv.level,
    ppv.total_xp,
    ppv.first_joined,
    ppv.last_seen,
    ppv.is_online,
    ppv.created_at,
    ppv.stats,
    ppv.ranks,
    ppv.medals,
    ppv.stats_updated_at
  FROM public.player_profiles_view ppv
  WHERE ppv.uuid = player_uuid_param;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- Test the function
SELECT get_player_profile('test-uuid-1234');

-- Alternative: If the view still doesn't work, create a function that works directly with tables
CREATE OR REPLACE FUNCTION public.get_player_profile_direct(player_uuid_param TEXT)
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

-- Grant execute permissions for the direct function
GRANT EXECUTE ON FUNCTION public.get_player_profile_direct(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile_direct(TEXT) TO anon;

-- Test the direct function
SELECT get_player_profile_direct('test-uuid-1234'); 