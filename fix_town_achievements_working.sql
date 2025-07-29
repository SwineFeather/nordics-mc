-- Working fix for town achievements based on actual database schema

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.sync_all_town_achievements();

-- Create the working function based on actual column names
CREATE OR REPLACE FUNCTION public.sync_all_town_achievements()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  town_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  town_stat_value NUMERIC;
  highest_tier_id UUID;
  existing_achievement_count INTEGER;
  town_age_days INTEGER;
BEGIN
  -- Loop through all towns
  FOR town_record IN SELECT * FROM public.towns LOOP
    -- Loop through all achievement definitions
    FOR achievement_record IN SELECT * FROM public.town_achievement_definitions LOOP
      -- Calculate town-specific stats using actual column names
      CASE achievement_record.stat
        WHEN 'population' THEN
          town_stat_value := town_record.residents_count;
        WHEN 'nation_member' THEN
          town_stat_value := CASE WHEN town_record.nation_id IS NOT NULL THEN 1 ELSE 0 END;
        WHEN 'independent' THEN
          -- Independent if no nation_id
          town_stat_value := CASE WHEN town_record.nation_id IS NULL THEN 1 ELSE 0 END;
        WHEN 'capital' THEN
          -- Check if this town is a capital
          town_stat_value := CASE WHEN town_record.is_capital THEN 1 ELSE 0 END;
        WHEN 'age' THEN
          -- Calculate town age in days
          town_age_days := EXTRACT(EPOCH FROM (NOW() - town_record.created_at)) / 86400;
          town_stat_value := town_age_days;
        WHEN 'activity' THEN
          -- Use activity_score if available, otherwise assume active if residents > 0
          town_stat_value := CASE 
            WHEN town_record.activity_score IS NOT NULL THEN town_record.activity_score
            WHEN town_record.residents_count > 0 THEN 1 
            ELSE 0 
          END;
        ELSE
          town_stat_value := 0;
      END CASE;
      
      -- Find the highest tier this town qualifies for
      SELECT tat.id INTO highest_tier_id
      FROM public.town_achievement_tiers tat
      WHERE tat.achievement_id = achievement_record.id
        AND tat.threshold <= town_stat_value
      ORDER BY tat.tier DESC
      LIMIT 1;
      
      -- If town qualifies for a tier, check if they already have it
      IF highest_tier_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.town_unlocked_achievements
        WHERE town_id = town_record.id
          AND tier_id = highest_tier_id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.town_unlocked_achievements (town_id, tier_id)
          VALUES (town_record.id, highest_tier_id);
        END IF;
      END IF;
      
    END LOOP;
  END LOOP;
  
  -- Recalculate all town levels based on their total XP
  UPDATE public.towns
  SET level = (
    SELECT level 
    FROM public.calculate_town_level_from_xp(towns.total_xp) 
    LIMIT 1
  );
  
END;
$$;

-- Test the function
SELECT public.sync_all_town_achievements();

-- Check results
SELECT 'Achievement definitions' as type, COUNT(*) as count FROM public.town_achievement_definitions
UNION ALL
SELECT 'Achievement tiers' as type, COUNT(*) as count FROM public.town_achievement_tiers
UNION ALL
SELECT 'Unlocked achievements' as type, COUNT(*) as count FROM public.town_unlocked_achievements;

-- Show some sample unlocked achievements
SELECT 
  t.name as town_name,
  tad.name as achievement_name,
  tat.name as tier_name,
  tat.points as xp_points,
  tua.unlocked_at,
  tua.is_claimed
FROM public.town_unlocked_achievements tua
JOIN public.towns t ON t.id = tua.town_id
JOIN public.town_achievement_tiers tat ON tat.id = tua.tier_id
JOIN public.town_achievement_definitions tad ON tad.id = tat.achievement_id
ORDER BY tua.unlocked_at DESC
LIMIT 10; 