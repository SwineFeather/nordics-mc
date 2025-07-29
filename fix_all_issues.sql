-- Comprehensive Fix for All Current Issues
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

-- 4. Fix wiki storage RLS policies (400 Bad Request errors)
-- Drop any existing policies for the wiki bucket
DROP POLICY IF EXISTS "Public read access for wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from wiki" ON storage.objects;

-- Create new policies for the wiki bucket
CREATE POLICY "Public read access for wiki" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

CREATE POLICY "Authenticated users can upload to wiki" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update wiki" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete from wiki" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- 5. Ensure the wiki bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  10485760, -- 10MB limit
  ARRAY['text/markdown', 'text/plain', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Fix notification_settings table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_settings TO authenticated;

-- 7. Create player_profiles_view if it doesn't exist
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

-- 8. Fix wiki_edit_sessions table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON wiki_edit_sessions TO authenticated;

-- 9. Test the fixes
SELECT 'Database fixes applied successfully!' as status;

-- Test the get_player_profile function
SELECT 'Testing get_player_profile function...' as test_status;
SELECT COUNT(*) as player_count FROM public.players LIMIT 1;

-- Test wiki storage access
SELECT 'Testing wiki storage policies...' as test_status;
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%wiki%';

-- Test helper functions
SELECT 'Testing helper functions...' as test_status;
SELECT COUNT(*) as town_count FROM public.towns LIMIT 1;
SELECT COUNT(*) as nation_count FROM public.nations LIMIT 1; 