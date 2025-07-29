-- Add debug functions for achievement system testing

-- Function to manually create unlocked achievements for a player
CREATE OR REPLACE FUNCTION public.debug_create_player_achievements(p_player_uuid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  created_count INTEGER := 0;
  result JSONB;
BEGIN
  -- For now, this function will just return a message
  -- It will need to be updated when we know where player stats are stored
  
  result := jsonb_build_object(
    'success', true,
    'player_uuid', p_player_uuid,
    'achievements_created', 0,
    'message', 'Debug function created. Player stats integration pending.'
  );
  
  RETURN result;
END;
$$;

-- Function to get player info for debugging
CREATE OR REPLACE FUNCTION public.debug_get_player_info(p_player_uuid TEXT)
RETURNS TABLE (
  player_uuid TEXT,
  player_name TEXT,
  level INTEGER,
  total_xp BIGINT,
  last_seen BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.uuid::TEXT as player_uuid,
    p.name as player_name,
    p.level,
    p.total_xp,
    p.last_seen
  FROM public.players p
  WHERE p.uuid::TEXT = p_player_uuid;
END;
$$;

-- Function to test achievement calculations for a specific player
CREATE OR REPLACE FUNCTION public.debug_test_achievement_calculations(p_player_uuid TEXT)
RETURNS TABLE (
  achievement_id TEXT,
  achievement_name TEXT,
  tier_name TEXT,
  stat_name TEXT,
  current_value NUMERIC,
  threshold NUMERIC,
  qualifies BOOLEAN,
  points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  stat_value NUMERIC;
  converted_value NUMERIC;
BEGIN
  -- For now, return all achievement definitions with placeholder values
  -- This will need to be updated when we know where player stats are stored
  
  FOR achievement_record IN (
    SELECT 
      ad.id as achievement_id,
      ad.name as achievement_name,
      ad.stat,
      at.name as tier_name,
      at.threshold,
      at.points
    FROM public.achievement_definitions ad
    JOIN public.achievement_tiers at ON ad.id = at.achievement_id
    ORDER BY ad.id, at.tier
  ) LOOP
    
    achievement_id := achievement_record.achievement_id;
    achievement_name := achievement_record.achievement_name;
    tier_name := achievement_record.tier_name;
    stat_name := achievement_record.stat;
    current_value := 0; -- Placeholder until we know where stats are stored
    threshold := achievement_record.threshold;
    qualifies := false; -- Placeholder until we know where stats are stored
    points := achievement_record.points;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Grant permissions for debug functions
GRANT EXECUTE ON FUNCTION public.debug_create_player_achievements(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.debug_get_player_info(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.debug_test_achievement_calculations(text) TO anon, authenticated; 