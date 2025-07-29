-- Comprehensive fix for town achievements and leveling system
-- Fixes: Independent Spirit logic, Nation Member logic, adds 365 day tier, increases plot threshold to 200, reduces XP requirements by 50%
-- UPDATED: Uses nation_name instead of nation_id for nation membership detection

-- First, let's clear existing unlocked achievements to start fresh
DELETE FROM public.town_unlocked_achievements;

-- Update town level definitions to reduce XP requirements by 50%
UPDATE public.town_level_definitions 
SET xp_required = xp_required / 2
WHERE level > 1;

-- Add more achievement definitions if they don't exist
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

-- Update/add achievement tiers with corrected logic and new requirements
INSERT INTO public.town_achievement_tiers (achievement_id, tier, name, description, threshold, points, icon, color) VALUES
-- Population Growth achievements (ALL tiers should be awarded)
('population', 1, 'Small Settlement', 'Reach 2 residents', 2, 50, 'trophy', 'from-green-500 to-emerald-600'),
('population', 2, 'Growing Community', 'Reach 3 residents', 3, 100, 'trophy', 'from-green-500 to-emerald-600'),
('population', 3, 'Thriving Town', 'Reach 5 residents', 5, 200, 'trophy', 'from-green-500 to-emerald-600'),
('population', 4, 'Bustling City', 'Reach 8 residents', 8, 350, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 5, 'Major Metropolis', 'Reach 10 residents', 10, 500, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 6, 'Grand Capital', 'Reach 15 residents', 15, 750, 'trophy', 'from-purple-500 to-violet-600'),
('population', 7, 'Imperial City', 'Reach 20 residents', 20, 1000, 'trophy', 'from-orange-500 to-amber-600'),
('population', 8, 'Legendary Metropolis', 'Reach 25 residents', 25, 1500, 'trophy', 'from-red-500 to-pink-600'),

-- Nation Member achievements (FIXED: Only for towns WITH nation_name)
('nation_member', 1, 'Alliance Forged', 'Join a nation', 1, 200, 'trophy', 'from-blue-500 to-indigo-600'),

-- Independent Spirit achievements (FIXED: Only for towns WITHOUT nation_name)
('independent', 1, 'Independent Spirit', 'Remain independent', 1, 150, 'trophy', 'from-gray-500 to-slate-600'),

-- Capital Status achievements
('capital', 1, 'Capital City', 'Become a nation capital', 1, 500, 'trophy', 'from-yellow-500 to-amber-600'),

-- Town Age achievements (ADDED: 365 day tier)
('age', 1, 'Established', 'Town exists for 7 days', 7, 100, 'trophy', 'from-green-500 to-emerald-600'),
('age', 2, 'Veteran', 'Town exists for 30 days', 30, 250, 'trophy', 'from-blue-500 to-cyan-600'),
('age', 3, 'Ancient', 'Town exists for 90 days', 90, 500, 'trophy', 'from-purple-500 to-violet-600'),
('age', 4, 'Timeless', 'Town exists for 180 days', 180, 1000, 'trophy', 'from-orange-500 to-amber-600'),
('age', 5, 'Eternal', 'Town exists for 365 days', 365, 2000, 'trophy', 'from-red-500 to-pink-600'),

-- Town Activity achievements
('activity', 1, 'Active Community', 'Maintain activity for 3 days', 3, 50, 'trophy', 'from-green-500 to-emerald-600'),
('activity', 2, 'Thriving Hub', 'Maintain activity for 7 days', 7, 150, 'trophy', 'from-blue-500 to-cyan-600'),
('activity', 3, 'Eternal Flame', 'Maintain activity for 30 days', 30, 300, 'trophy', 'from-purple-500 to-violet-600'),

-- Town Wealth achievements
('wealth', 1, 'Prosperous', 'Accumulate $1000', 1000, 100, 'trophy', 'from-yellow-500 to-amber-600'),
('wealth', 2, 'Wealthy', 'Accumulate $5000', 5000, 250, 'trophy', 'from-orange-500 to-amber-600'),
('wealth', 3, 'Rich', 'Accumulate $10000', 10000, 500, 'trophy', 'from-red-500 to-pink-600'),
('wealth', 4, 'Millionaire', 'Accumulate $50000', 50000, 1000, 'trophy', 'from-purple-500 to-violet-600'),

-- Town Development achievements (UPDATED: Highest tier at 200 plots)
('plots', 1, 'Planned', 'Develop 5 plots', 5, 50, 'trophy', 'from-green-500 to-emerald-600'),
('plots', 2, 'Expanding', 'Develop 15 plots', 15, 150, 'trophy', 'from-blue-500 to-cyan-600'),
('plots', 3, 'Developed', 'Develop 50 plots', 50, 300, 'trophy', 'from-purple-500 to-violet-600'),
('plots', 4, 'Urban', 'Develop 100 plots', 100, 600, 'trophy', 'from-orange-500 to-amber-600'),
('plots', 5, 'Mega City', 'Develop 200 plots', 200, 1200, 'trophy', 'from-red-500 to-pink-600')
ON CONFLICT (achievement_id, tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  threshold = EXCLUDED.threshold,
  points = EXCLUDED.points,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.sync_all_town_achievements();

-- Create the corrected function with FIXED logic using nation_name
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
          town_stat_value := town_record.residents_count;
        WHEN 'nation_member' THEN
          -- FIXED: Nation member if they have a nation_name (NOT NULL and NOT empty)
          town_stat_value := CASE 
            WHEN town_record.nation_name IS NOT NULL AND town_record.nation_name != '' THEN 1 
            ELSE 0 
          END;
        WHEN 'independent' THEN
          -- FIXED: Independent if NO nation_name (NULL or empty)
          town_stat_value := CASE 
            WHEN town_record.nation_name IS NULL OR town_record.nation_name = '' THEN 1 
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
            WHEN town_record.residents_count > 0 THEN 1 
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
          INSERT INTO public.town_unlocked_achievements (town_id, tier_id)
          VALUES (town_record.id::TEXT, tier_record.id);
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

-- Run the sync to populate achievements and recalculate levels
SELECT public.sync_all_town_achievements();

-- Show summary of what was fixed
SELECT 
  'Achievement Fix Summary' as info,
  COUNT(*) as total_towns,
  SUM(CASE WHEN nation_name IS NOT NULL AND nation_name != '' THEN 1 ELSE 0 END) as nation_towns,
  SUM(CASE WHEN nation_name IS NULL OR nation_name = '' THEN 1 ELSE 0 END) as independent_towns,
  SUM(CASE WHEN is_capital THEN 1 ELSE 0 END) as capital_towns
FROM public.towns;

SELECT 
  'Unlocked Achievements Summary' as info,
  tad.name as achievement_name,
  COUNT(*) as unlocked_count
FROM public.town_unlocked_achievements tua
JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
GROUP BY tad.id, tad.name
ORDER BY tad.name; 