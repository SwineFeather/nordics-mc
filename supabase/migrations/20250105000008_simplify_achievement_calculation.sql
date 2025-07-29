-- Simplify achievement calculation since we're using direct stat names

-- Update the calculate_player_achievements function to use simpler stat lookups
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
    IF achievement_record.stat IN ('play', 'play_one_minute') THEN
      -- Playtime: convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      converted_value := FLOOR(stat_value / 72000);
    ELSIF achievement_record.stat IN ('walk', 'walk_one_cm', 'sprint') THEN
      -- Convert centimeters to blocks (100 cm = 1 block)
      converted_value := FLOOR(stat_value / 100);
    ELSE
      -- Standard stat lookup - no conversion needed
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

-- Grant permissions for updated function
GRANT EXECUTE ON FUNCTION public.calculate_player_achievements(text, jsonb) TO anon, authenticated; 