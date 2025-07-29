-- Fix database functions based on actual table structures
-- Run this in your Supabase SQL Editor

-- 1. First, let's add missing columns to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS first_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Update existing records to have proper timestamps
UPDATE public.players 
SET first_joined = created_at, last_seen = updated_at 
WHERE first_joined IS NULL;

-- 2. Create a proper player_profiles_view that works with the actual table structure
CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  p.name as username,  -- Map name to username for compatibility
  p.level,
  p.total_xp,
  p.first_joined,
  p.last_seen,
  p.is_online,
  p.created_at,
  -- Aggregate player_stats into JSONB format
  COALESCE(
    (SELECT jsonb_object_agg(ps.stat_key, ps.stat_value)
     FROM public.player_stats ps 
     WHERE ps.player_uuid = p.uuid),
    '{}'::jsonb
  ) as stats,
  -- For now, use empty JSONB for ranks and medals (can be populated later)
  '{}'::jsonb as ranks,
  '{}'::jsonb as medals,
  -- Use the most recent stat update time
  (SELECT MAX(ps.last_updated) 
   FROM public.player_stats ps 
   WHERE ps.player_uuid = p.uuid) as stats_updated_at
FROM public.players p;

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
    ppv.uuid::TEXT,
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
  WHERE ppv.uuid::TEXT = player_uuid_param;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- 4. Fix the get-live-wiki-data Edge Function by updating the towns query
-- The Edge Function needs to be updated to use the correct column names
-- Let's create a helper function for towns data
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

-- 5. Create a helper function for nations data
CREATE OR REPLACE FUNCTION public.get_nation_data_for_wiki(nation_name_param TEXT)
RETURNS TABLE (
  name TEXT,
  leader_name TEXT,
  capital_name TEXT,
  residents_count INTEGER,
  balance NUMERIC,
  towns_count INTEGER,
  ally_count INTEGER,
  enemy_count INTEGER,
  tag TEXT,
  board TEXT,
  taxes NUMERIC,
  town_tax NUMERIC,
  max_towns INTEGER,
  created_at TIMESTAMP
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.name,
    n.leader_name,
    n.capital_name,
    n.residents_count,
    n.balance,
    n.towns_count,
    n.ally_count,
    n.enemy_count,
    n.tag,
    n.board,
    n.taxes,
    n.town_tax,
    n.max_towns,
    n.created_at
  FROM public.nations n
  WHERE n.name = nation_name_param;
$$;

-- Grant permissions for helper functions
GRANT EXECUTE ON FUNCTION public.get_town_data_for_wiki(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_town_data_for_wiki(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_nation_data_for_wiki(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nation_data_for_wiki(TEXT) TO anon;

-- 6. Fix RLS policies for wiki_edit_sessions
-- First, check if RLS is enabled
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own edit sessions" ON public.wiki_edit_sessions;
DROP POLICY IF EXISTS "Users can create their own edit sessions" ON public.wiki_edit_sessions;
DROP POLICY IF EXISTS "Users can update their own edit sessions" ON public.wiki_edit_sessions;
DROP POLICY IF EXISTS "Users can delete their own edit sessions" ON public.wiki_edit_sessions;

-- Create new policies that work with the actual table structure
CREATE POLICY "Users can view their own edit sessions" ON public.wiki_edit_sessions
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can create their own edit sessions" ON public.wiki_edit_sessions
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update their own edit sessions" ON public.wiki_edit_sessions
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete their own edit sessions" ON public.wiki_edit_sessions
  FOR DELETE USING (auth.uid()::TEXT = user_id::TEXT);

-- Grant permissions
GRANT ALL ON public.wiki_edit_sessions TO authenticated;
GRANT ALL ON public.wiki_edit_sessions TO service_role;

-- 7. Test the functions
SELECT 'Testing get_player_profile function...' as test_status;
SELECT get_player_profile('test-uuid-1234');

SELECT 'Testing get_town_data_for_wiki function...' as test_status;
SELECT get_town_data_for_wiki('Garvia');

SELECT 'Testing get_nation_data_for_wiki function...' as test_status;
SELECT get_nation_data_for_wiki('Constellation');

-- 8. Show the current state
SELECT 'Current RLS policies for wiki_edit_sessions:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'wiki_edit_sessions'; 