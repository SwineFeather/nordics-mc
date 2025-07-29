-- Fix the achievement stat processing to work with the actual JSON structure

-- Update the calculate_player_achievements function to properly handle the JSON structure
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
    
    -- Get the stat value from the provided stats (direct key lookup)
    stat_value := COALESCE((p_player_stats ->> achievement_record.stat)::NUMERIC, 0);
    
    -- Apply special calculations based on stat type
    IF achievement_record.stat = 'play' THEN
      -- Playtime: convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      converted_value := FLOOR(stat_value / 72000);
    ELSIF achievement_record.stat = 'play_one_minute' THEN
      -- Playtime: convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      converted_value := FLOOR(stat_value / 72000);
    ELSIF achievement_record.stat = 'blocks_placed_total' THEN
      -- Sum all use_* stats (blocks placed)
      SELECT COALESCE(SUM((value)::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'use_%';
    ELSIF achievement_record.stat = 'blocks_broken_total' THEN
      -- Sum all mine_* stats (blocks broken)
      SELECT COALESCE(SUM((value)::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'mine_%';
    ELSIF achievement_record.stat = 'mob_kills_total' THEN
      -- Sum all kill_* stats (excluding kill_any which is a total)
      SELECT COALESCE(SUM((value)::NUMERIC), 0) INTO converted_value
      FROM jsonb_each(p_player_stats) AS stat(key, value)
      WHERE key LIKE 'kill_%' AND key != 'kill_any';
    ELSIF achievement_record.stat IN ('walk', 'walk_one_cm') THEN
      -- Convert centimeters to blocks (100 cm = 1 block)
      converted_value := FLOOR(stat_value / 100);
    ELSIF achievement_record.stat = 'sprint' THEN
      -- Convert centimeters to blocks (100 cm = 1 block)
      converted_value := FLOOR(stat_value / 100);
    ELSIF achievement_record.stat = 'jumps' THEN
      -- Standard stat lookup
      converted_value := stat_value;
    ELSIF achievement_record.stat = 'damageDealt' THEN
      -- Standard stat lookup
      converted_value := stat_value;
    ELSIF achievement_record.stat = 'balance' THEN
      -- Standard stat lookup
      converted_value := stat_value;
    ELSIF achievement_record.stat = 'monument_builds' THEN
      -- Standard stat lookup
      converted_value := stat_value;
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

-- Update the debug function to show actual stat values
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

-- Grant permissions for updated functions
GRANT EXECUTE ON FUNCTION public.calculate_player_achievements(text, jsonb) TO anon, authenticated; 