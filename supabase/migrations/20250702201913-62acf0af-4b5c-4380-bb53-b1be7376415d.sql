-- Update achievement definitions to use actual stat names from player_stats
UPDATE public.achievement_definitions SET stat = 'custom_minecraft_play_time' WHERE id = 'time_lord';
UPDATE public.achievement_definitions SET stat = 'use_dirt' WHERE id = 'architect';
UPDATE public.achievement_definitions SET stat = 'mine_ground' WHERE id = 'excavator';
UPDATE public.achievement_definitions SET stat = 'kill_any' WHERE id = 'slayer';
UPDATE public.achievement_definitions SET stat = 'ride_boat' WHERE id = 'boat_captain';
UPDATE public.achievement_definitions SET stat = 'mine_wood' WHERE id = 'wood_cutter';
UPDATE public.achievement_definitions SET stat = 'use_hoe' WHERE id = 'green_thumb';

-- Update the sync_all_achievements function with proper stat handling and conversions
CREATE OR REPLACE FUNCTION public.sync_all_achievements()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  player_stat_value NUMERIC;
  converted_stat_value NUMERIC;
  highest_tier_id UUID;
  existing_achievement_count INTEGER;
  processed_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting achievement sync for all players...';
  
  -- Loop through all players with stats
  FOR player_record IN (
    SELECT p.uuid, ps.stats
    FROM public.players p
    LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats IS NOT NULL AND ps.stats != '{}'
  ) LOOP
    
    processed_count := processed_count + 1;
    IF processed_count % 50 = 0 THEN
      RAISE NOTICE 'Processed % players...', processed_count;
    END IF;
    
    -- Loop through all achievement definitions
    FOR achievement_record IN (
      SELECT * FROM public.achievement_definitions
    ) LOOP
      
      -- Get the player's raw stat value
      player_stat_value := COALESCE(
        (player_record.stats ->> achievement_record.stat)::NUMERIC,
        0
      );
      
      -- Skip if player has no progress in this stat
      CONTINUE WHEN player_stat_value <= 0;
      
      -- Convert stat value based on achievement type
      converted_stat_value := player_stat_value;
      
      -- Handle stat conversions
      IF achievement_record.stat = 'custom_minecraft_play_time' THEN
        -- Convert ticks to hours (20 ticks per second, 3600 seconds per hour)
        converted_stat_value := FLOOR(player_stat_value / 72000);
      ELSIF achievement_record.stat IN ('ride_boat', 'walk', 'sprint') THEN
        -- Convert centimeters to blocks (100 cm = 1 block)
        converted_stat_value := FLOOR(player_stat_value / 100);
      END IF;
      
      -- Skip if converted value is still 0
      CONTINUE WHEN converted_stat_value <= 0;
      
      -- Find the highest tier this player qualifies for
      highest_tier_id := NULL;
      
      -- Special handling for 'death' stat (lower is better) - if we add it later
      IF achievement_record.id = 'survivor' THEN
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND converted_stat_value <= threshold
        ORDER BY tier DESC
        LIMIT 1;
      ELSE
        -- Normal achievements (higher is better)
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND converted_stat_value >= threshold
        ORDER BY tier DESC
        LIMIT 1;
      END IF;
      
      -- If player qualifies for a tier, check if they already have it
      IF highest_tier_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.unlocked_achievements
        WHERE player_uuid = player_record.uuid
          AND tier_id = highest_tier_id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.unlocked_achievements (player_uuid, tier_id)
          VALUES (player_record.uuid, highest_tier_id);
          
          RAISE NOTICE 'Awarded achievement % to player %', achievement_record.id, player_record.uuid;
        END IF;
      END IF;
      
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Processed % total players', processed_count;
  
  -- Recalculate all player levels based on their total XP
  UPDATE public.players
  SET level = (
    SELECT level 
    FROM public.calculate_level_from_xp(players.total_xp) 
    LIMIT 1
  )
  WHERE total_xp > 0;
  
  RAISE NOTICE 'Achievement sync completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in sync_all_achievements: %', SQLERRM;
END;
$$;