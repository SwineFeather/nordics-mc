-- Final comprehensive fix for town achievement system
-- Resolves function overloading and ensures everything works

-- First, ensure all required database structures exist
ALTER TABLE public.town_unlocked_achievements 
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.towns 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_xp BIGINT DEFAULT 0;

-- Update any towns with NULL values
UPDATE public.towns 
SET level = COALESCE(level, 1), 
    total_xp = COALESCE(total_xp, 0)
WHERE level IS NULL OR total_xp IS NULL;

-- Clear existing achievements to start fresh
DELETE FROM public.town_unlocked_achievements;

-- Ensure all achievement definitions exist
INSERT INTO public.town_achievement_definitions (id, name, description, stat) VALUES
('population', 'Population Growth', 'Grow your town population', 'population'),
('nation_member', 'Nation Member', 'Join a nation and become part of something greater', 'nation_member'),
('independent', 'Independent Spirit', 'Maintain independence as a sovereign town', 'independent'),
('capital', 'Capital Status', 'Become the capital of your nation', 'capital'),
('age', 'Town Age', 'Survive and thrive over time', 'age'),
('activity', 'Town Activity', 'Maintain active status', 'activity'),
('wealth', 'Town Wealth', 'Accumulate wealth and prosperity', 'wealth'),
('plots', 'Town Development', 'Develop your town with plots', 'plots')
ON CONFLICT (id) DO NOTHING;

-- Update/add achievement tiers
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
-- Population Growth achievements
('population', 1, 'Small Settlement', 'Reach 2 residents', 2, 50, 'trophy', 'from-green-500 to-emerald-600'),
('population', 2, 'Growing Community', 'Reach 3 residents', 3, 100, 'trophy', 'from-green-500 to-emerald-600'),
('population', 3, 'Thriving Town', 'Reach 5 residents', 5, 200, 'trophy', 'from-green-500 to-emerald-600'),
('population', 4, 'Bustling City', 'Reach 8 residents', 8, 350, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 5, 'Major Metropolis', 'Reach 10 residents', 10, 500, 'trophy', 'from-blue-500 to-cyan-600'),

-- Nation Member achievements
('nation_member', 1, 'Alliance Forged', 'Join a nation', 1, 200, 'trophy', 'from-blue-500 to-indigo-600'),

-- Independent Spirit achievements
('independent', 1, 'Independent Spirit', 'Remain independent', 1, 150, 'trophy', 'from-gray-500 to-slate-600'),

-- Capital Status achievements
('capital', 1, 'Capital City', 'Become a nation capital', 1, 500, 'trophy', 'from-yellow-500 to-amber-600'),

-- Town Age achievements
('age', 1, 'Established', 'Town exists for 7 days', 7, 100, 'trophy', 'from-green-500 to-emerald-600'),
('age', 2, 'Veteran', 'Town exists for 30 days', 30, 250, 'trophy', 'from-blue-500 to-cyan-600'),
('age', 3, 'Ancient', 'Town exists for 90 days', 90, 500, 'trophy', 'from-purple-500 to-violet-600'),

-- Town Activity achievements
('activity', 1, 'Active Community', 'Maintain activity for 3 days', 3, 50, 'trophy', 'from-green-500 to-emerald-600'),
('activity', 2, 'Thriving Hub', 'Maintain activity for 7 days', 7, 150, 'trophy', 'from-blue-500 to-cyan-600'),

-- Town Wealth achievements
('wealth', 1, 'Prosperous', 'Accumulate $1000', 1000, 100, 'trophy', 'from-yellow-500 to-amber-600'),
('wealth', 2, 'Wealthy', 'Accumulate $5000', 5000, 250, 'trophy', 'from-orange-500 to-amber-600'),

-- Town Development achievements
('plots', 1, 'Planned', 'Develop 5 plots', 5, 50, 'trophy', 'from-green-500 to-emerald-600'),
('plots', 2, 'Expanding', 'Develop 15 plots', 15, 150, 'trophy', 'from-blue-500 to-cyan-600'),
('plots', 3, 'Developed', 'Develop 50 plots', 50, 300, 'trophy', 'from-purple-500 to-violet-600')
ON CONFLICT (achievement_id, tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  threshold = EXCLUDED.threshold,
  points = EXCLUDED.points,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Drop ALL existing claim functions to resolve overloading
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, TEXT);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, TEXT);

-- Create a single, properly typed claim function
CREATE OR REPLACE FUNCTION public.claim_town_achievement(
  p_town_id TEXT,
  p_tier_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  xp_amount INTEGER;
  new_total_xp BIGINT;
  calculated_level INTEGER;
  achievement_name TEXT;
  tier_name TEXT;
  town_exists BOOLEAN;
  tier_exists BOOLEAN;
  achievement_exists BOOLEAN;
BEGIN
  -- Check if town exists (handle both UUID and TEXT town IDs)
  SELECT EXISTS(SELECT 1 FROM public.towns WHERE id::TEXT = p_town_id OR id = p_town_id::UUID) INTO town_exists;
  IF NOT town_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Town not found');
  END IF;

  -- Check if tier exists
  SELECT EXISTS(SELECT 1 FROM public.town_achievement_tiers WHERE id::TEXT = p_tier_id OR id = p_tier_id::UUID) INTO tier_exists;
  IF NOT tier_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Achievement tier not found');
  END IF;

  -- Check if achievement exists and is not already claimed
  SELECT EXISTS(
    SELECT 1 FROM public.town_unlocked_achievements
    WHERE town_id = p_town_id 
      AND tier_id::TEXT = p_tier_id 
      AND (is_claimed = false OR is_claimed IS NULL)
  ) INTO achievement_exists;
  
  IF NOT achievement_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Achievement not found or already claimed');
  END IF;
  
  -- Get the XP points and achievement info
  SELECT tat.points, tad.name, tat.name
  INTO xp_amount, achievement_name, tier_name
  FROM public.town_achievement_tiers tat
  JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
  WHERE tat.id::TEXT = p_tier_id OR tat.id = p_tier_id::UUID;
  
  -- Mark achievement as claimed
  UPDATE public.town_unlocked_achievements
  SET is_claimed = true, claimed_at = NOW()
  WHERE town_id = p_town_id AND (tier_id::TEXT = p_tier_id OR tier_id = p_tier_id::UUID);
  
  -- Update town's total XP (handle both UUID and TEXT town IDs)
  UPDATE public.towns
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE id::TEXT = p_town_id OR id = p_town_id::UUID
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_town_level_from_xp(new_total_xp);
  
  -- Update town's level
  UPDATE public.towns
  SET level = calculated_level
  WHERE id::TEXT = p_town_id OR id = p_town_id::UUID;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', xp_amount,
    'new_total_xp', new_total_xp,
    'new_level', calculated_level,
    'achievement_name', achievement_name,
    'tier_name', tier_name
  );
END;
$$;

-- Drop and recreate the sync function
DROP FUNCTION IF EXISTS public.sync_all_town_achievements();

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
          town_stat_value := COALESCE(town_record.residents_count, 0);
        WHEN 'nation_member' THEN
          -- Nation member if they have a nation_name (NOT NULL and NOT empty)
          town_stat_value := CASE 
            WHEN town_record.nation_name IS NOT NULL AND town_record.nation_name != '' AND town_record.nation_name != ' ' THEN 1 
            ELSE 0 
          END;
        WHEN 'independent' THEN
          -- Independent if NO nation_name (NULL or empty)
          town_stat_value := CASE 
            WHEN town_record.nation_name IS NULL OR town_record.nation_name = '' OR town_record.nation_name = ' ' THEN 1 
            ELSE 0 
          END;
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
            WHEN COALESCE(town_record.residents_count, 0) > 0 THEN 1 
            ELSE 0 
          END;
        WHEN 'wealth' THEN
          -- Use balance for wealth achievements
          town_stat_value := COALESCE(town_record.balance, 0);
        WHEN 'plots' THEN
          -- Use plots_count for development achievements
          town_stat_value := COALESCE(town_record.plots_count, 0);
        ELSE
          town_stat_value := 0;
      END CASE;
      
      -- Award ALL tiers that the town qualifies for (not just the highest)
      FOR tier_record IN 
        SELECT tat.id, tat.tier
        FROM public.town_achievement_tiers tat
        WHERE tat.achievement_id = achievement_record.id
          AND tat.threshold <= town_stat_value
        ORDER BY tat.tier ASC
      LOOP
        -- Check if this tier is already unlocked
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.town_unlocked_achievements tua
        WHERE tua.town_id = town_record.id::TEXT
          AND tua.tier_id = tier_record.id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.town_unlocked_achievements (town_id, tier_id, unlocked_at)
          VALUES (town_record.id::TEXT, tier_record.id, NOW());
        END IF;
      END LOOP;
      
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

-- Run the sync to populate achievements
SELECT public.sync_all_town_achievements();

-- Show summary of what was fixed
SELECT 
  'Achievement System Fix Summary' as info,
  COUNT(*) as total_towns,
  SUM(CASE WHEN nation_name IS NOT NULL AND nation_name != '' AND nation_name != ' ' THEN 1 ELSE 0 END) as nation_towns,
  SUM(CASE WHEN nation_name IS NULL OR nation_name = '' OR nation_name = ' ' THEN 1 ELSE 0 END) as independent_towns,
  SUM(CASE WHEN is_capital THEN 1 ELSE 0 END) as capital_towns
FROM public.towns;

SELECT 
  'Unlocked Achievements Summary' as info,
  tad.name as achievement_name,
  COUNT(*) as unlocked_count,
  SUM(CASE WHEN tua.is_claimed THEN 1 ELSE 0 END) as claimed_count
FROM public.town_unlocked_achievements tua
JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
GROUP BY tad.id, tad.name
ORDER BY tad.name;

-- Show towns with their levels and XP
SELECT 
  'Town Levels and XP' as info,
  name as town_name,
  level,
  total_xp,
  nation_name
FROM public.towns
ORDER BY total_xp DESC;

-- Verify the function was created correctly
SELECT 
  'Function verification' as info,
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname = 'claim_town_achievement' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 