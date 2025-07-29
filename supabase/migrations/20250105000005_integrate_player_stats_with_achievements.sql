-- Integrate achievement system with actual player stats

-- Function to get player stats from the comprehensive stats service
-- This will be called by the frontend to get actual player stats
CREATE OR REPLACE FUNCTION public.get_player_stats_for_achievements(p_player_uuid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- This function will be called by the frontend to get player stats
  -- The frontend will fetch stats from JSON files and pass them here
  -- For now, return empty object - the frontend will handle the actual stat fetching
  
  result := jsonb_build_object(
    'player_uuid', p_player_uuid,
    'stats', '{}'::jsonb,
    'message', 'Stats should be fetched by frontend from JSON files'
  );
  
  RETURN result;
END;
$$;

-- Function to calculate and create unlocked achievements based on actual player stats
CREATE OR REPLACE FUNCTION public.calculate_player_achievements(
  p_player_uuid TEXT,
  p_player_stats JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  stat_value NUMERIC;
  converted_value NUMERIC;
  is_qualified BOOLEAN;
  created_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Loop through all achievement definitions and check if player qualifies
  FOR achievement_record IN (
    SELECT 
      ad.id as achievement_id,
      ad.stat,
      at.id as tier_id,
      at.threshold,
      at.tier,
      at.name as tier_name
    FROM public.achievement_definitions ad
    JOIN public.achievement_tiers at ON ad.id = at.achievement_id
    LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
    WHERE ua.id IS NULL -- Only check achievements not already unlocked
    ORDER BY ad.id, at.tier
  ) LOOP
    
    -- Get the stat value from the provided stats
    stat_value := COALESCE((p_player_stats ->> achievement_record.stat)::NUMERIC, 0);
    
    -- Apply special calculations based on stat type
    IF achievement_record.stat = 'play' THEN
      -- Playtime: convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      converted_value := FLOOR(stat_value / 72000);
    ELSIF achievement_record.stat = 'blocks_placed_total' THEN
      -- Sum all place_* stats
      SELECT COALESCE(SUM((value::jsonb ->> 'value')::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'place_%';
    ELSIF achievement_record.stat = 'blocks_broken_total' THEN
      -- Sum all mine_* stats
      SELECT COALESCE(SUM((value::jsonb ->> 'value')::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'mine_%';
    ELSIF achievement_record.stat = 'mob_kills_total' THEN
      -- Sum all kill_* stats (excluding kill_any which is a total)
      SELECT COALESCE(SUM((value::jsonb ->> 'value')::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'kill_%' AND key != 'kill_any';
    ELSIF achievement_record.stat IN ('walk', 'sprint') THEN
      -- Convert centimeters to blocks (100 cm = 1 block)
      converted_value := FLOOR(stat_value / 100);
    ELSE
      -- Standard stat lookup
      converted_value := stat_value;
    END IF;
    
    -- Check if player qualifies
    is_qualified := converted_value >= achievement_record.threshold;
    
    -- If player qualifies, create the unlocked achievement
    IF is_qualified THEN
      INSERT INTO public.unlocked_achievements (player_uuid, tier_id, is_claimed, claimed_at)
      VALUES (p_player_uuid, achievement_record.tier_id, false, NULL)
      ON CONFLICT (player_uuid, tier_id) DO NOTHING;
      
      IF FOUND THEN
        created_count := created_count + 1;
        RAISE NOTICE 'Created achievement % for player % (value: %, threshold: %)', 
          achievement_record.tier_name, p_player_uuid, converted_value, achievement_record.threshold;
      END IF;
    END IF;
  END LOOP;
  
  -- Return result
  result := jsonb_build_object(
    'success', true,
    'player_uuid', p_player_uuid,
    'achievements_created', created_count,
    'message', 'Created ' || created_count || ' achievements for player'
  );
  
  RETURN result;
END;
$$;

-- Update the get_claimable_achievements function to work with actual stats
CREATE OR REPLACE FUNCTION public.get_claimable_achievements(p_player_uuid TEXT)
RETURNS TABLE (
  tier_id UUID,
  achievement_id TEXT,
  achievement_name TEXT,
  tier_name TEXT,
  tier_description TEXT,
  points INTEGER,
  tier_number INTEGER,
  current_value NUMERIC,
  threshold NUMERIC,
  is_claimable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return existing unlocked achievements that haven't been claimed
  -- The frontend will handle fetching actual player stats and calling calculate_player_achievements
  
  RETURN QUERY
  SELECT 
    at.id as tier_id,
    ad.id as achievement_id,
    ad.name as achievement_name,
    at.name as tier_name,
    at.description as tier_description,
    at.points,
    at.tier as tier_number,
    0 as current_value, -- Will be calculated by frontend
    at.threshold,
    -- Show achievements that are already unlocked but not claimed
    CASE 
      WHEN ua.id IS NOT NULL AND (ua.is_claimed = false OR ua.is_claimed IS NULL) THEN true
      ELSE false
    END as is_claimable
  FROM public.achievement_definitions ad
  JOIN public.achievement_tiers at ON ad.id = at.achievement_id
  LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
  WHERE ua.id IS NULL OR (ua.is_claimed = false OR ua.is_claimed IS NULL)
  ORDER BY ad.id, at.tier;
END;
$$;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.get_player_stats_for_achievements(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_player_achievements(text, jsonb) TO anon, authenticated; 