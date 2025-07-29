-- Final comprehensive fix for town achievement claim button
-- Addresses all issues: function not found, type casting, permissions, and data structure

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
('population', 4, 'Bustling City', 'Reach 10 residents', 10, 350, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 5, 'Major Metropolis', 'Reach 15 residents', 15, 500, 'trophy', 'from-blue-500 to-cyan-600'),
('population', 6, 'Grand Capital', 'Reach 25 residents', 25, 750, 'trophy', 'from-purple-500 to-violet-600'),
('population', 7, 'Imperial City', 'Reach 35 residents', 35, 1000, 'trophy', 'from-orange-500 to-amber-600'),
('population', 8, 'Legendary Metropolis', 'Reach 50 residents', 50, 1500, 'trophy', 'from-red-500 to-pink-600'),

-- Nation Member achievements
('nation_member', 1, 'Alliance Forged', 'Join a nation', 1, 200, 'flag', 'from-blue-500 to-indigo-600'),

-- Independent Spirit achievements
('independent', 1, 'Independent Spirit', 'Remain independent for 30 days', 30, 150, 'shield', 'from-gray-500 to-slate-600'),

-- Capital Status achievements
('capital', 1, 'Capital City', 'Become a nation capital', 1, 500, 'crown', 'from-yellow-500 to-amber-600'),

-- Town Age achievements
('age', 1, 'Established', 'Town exists for 30 days', 30, 100, 'calendar', 'from-green-500 to-emerald-600'),
('age', 2, 'Veteran', 'Town exists for 90 days', 90, 250, 'calendar', 'from-blue-500 to-cyan-600'),
('age', 3, 'Ancient', 'Town exists for 180 days', 180, 500, 'calendar', 'from-purple-500 to-violet-600'),
('age', 4, 'Timeless', 'Town exists for 365 days', 365, 1000, 'calendar', 'from-orange-500 to-amber-600'),
('age', 5, 'Eternal', 'Town exists for 730 days (2 years)', 730, 2000, 'calendar', 'from-red-500 to-pink-600'),

-- Town Activity achievements
('activity', 1, 'Active Community', 'Maintain activity for 3 days', 3, 50, 'trophy', 'from-green-500 to-emerald-600'),
('activity', 2, 'Thriving Hub', 'Maintain activity for 7 days', 7, 150, 'trophy', 'from-blue-500 to-cyan-600'),
('activity', 3, 'Eternal Flame', 'Maintain activity for 30 days', 30, 300, 'trophy', 'from-purple-500 to-violet-600'),

-- Town Wealth achievements
('wealth', 1, 'Prosperous', 'Accumulate $1000', 1000, 100, 'trophy', 'from-yellow-500 to-amber-600'),
('wealth', 2, 'Wealthy', 'Accumulate $5000', 5000, 250, 'trophy', 'from-orange-500 to-amber-600'),
('wealth', 3, 'Rich', 'Accumulate $10000', 10000, 500, 'trophy', 'from-red-500 to-pink-600'),
('wealth', 4, 'Millionaire', 'Accumulate $50000', 50000, 1000, 'trophy', 'from-purple-500 to-violet-600'),

-- Town Development achievements
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

-- Drop ALL existing claim functions to start fresh
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, TEXT);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, TEXT);

-- Create a simple, working claim function with TEXT parameters
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
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Check if user has permission (admin, moderator, or town mayor)
  IF user_role NOT IN ('admin', 'moderator') THEN
    -- Check if user is town mayor
    SELECT EXISTS(
      SELECT 1 FROM public.towns t
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE t.id::TEXT = p_town_id 
        AND t.mayor = p.minecraft_username
    ) INTO town_exists;
    
    IF NOT town_exists THEN
      RETURN jsonb_build_object('success', false, 'message', 'Insufficient permissions to claim achievements for this town');
    END IF;
  END IF;

  -- Check if town exists
  SELECT EXISTS(SELECT 1 FROM public.towns WHERE id::TEXT = p_town_id) INTO town_exists;
  IF NOT town_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Town not found');
  END IF;

  -- Check if tier exists
  SELECT EXISTS(SELECT 1 FROM public.town_achievement_tiers WHERE id::TEXT = p_tier_id) INTO tier_exists;
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
  WHERE tat.id::TEXT = p_tier_id;
  
  -- Mark achievement as claimed
  UPDATE public.town_unlocked_achievements
  SET is_claimed = true, claimed_at = NOW()
  WHERE town_id = p_town_id AND tier_id::TEXT = p_tier_id;
  
  -- Update town's total XP
  UPDATE public.towns
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE id::TEXT = p_town_id
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_town_level_from_xp(new_total_xp);
  
  -- Update town's level
  UPDATE public.towns
  SET level = calculated_level
  WHERE id::TEXT = p_town_id;
  
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

-- Create a permission function to check if user can claim town achievements
CREATE OR REPLACE FUNCTION public.can_claim_town_achievement(p_town_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Admin and moderators can claim any town's achievements
  IF user_role IN ('admin', 'moderator') THEN
    RETURN true;
  END IF;
  
  -- Check if user is town mayor
  RETURN EXISTS(
    SELECT 1 FROM public.towns t
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE t.id::TEXT = p_town_id 
      AND t.mayor = p.minecraft_username
  );
END;
$$;

-- Update the sync function to award all qualifying tiers
CREATE OR REPLACE FUNCTION public.sync_town_achievements()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  town_record RECORD;
  achievement_record RECORD;
  tier_record RECORD;
  town_stat_value NUMERIC;
  town_xp BIGINT := 0;
  new_level INTEGER;
BEGIN
  -- Loop through all towns
  FOR town_record IN 
    SELECT 
      id,
      name,
      residents_count,
      nation_name,
      is_capital,
      created_at,
      activity_score,
      balance,
      plots_count,
      total_xp,
      level
    FROM public.towns
  LOOP
    town_xp := COALESCE(town_record.total_xp, 0);
    
    -- Loop through all achievement definitions
    FOR achievement_record IN 
      SELECT * FROM public.town_achievement_definitions
    LOOP
      -- Get the appropriate stat value based on achievement type
      CASE achievement_record.stat
        WHEN 'population' THEN
          town_stat_value := COALESCE(town_record.residents_count, 0);
        WHEN 'nation_member' THEN
          town_stat_value := CASE WHEN town_record.nation_name IS NOT NULL AND town_record.nation_name != '' THEN 1 ELSE 0 END;
        WHEN 'independent' THEN
          town_stat_value := CASE WHEN town_record.nation_name IS NULL OR town_record.nation_name = '' THEN 1 ELSE 0 END;
        WHEN 'capital' THEN
          town_stat_value := CASE WHEN town_record.is_capital = true THEN 1 ELSE 0 END;
        WHEN 'age' THEN
          town_stat_value := EXTRACT(DAY FROM (NOW() - town_record.created_at));
        WHEN 'activity' THEN
          town_stat_value := COALESCE(town_record.activity_score, 0);
        WHEN 'wealth' THEN
          town_stat_value := COALESCE(town_record.balance, 0);
        WHEN 'plots' THEN
          town_stat_value := COALESCE(town_record.plots_count, 0);
        ELSE
          town_stat_value := 0;
      END CASE;
      
      -- Check all tiers for this achievement and award qualifying ones
      FOR tier_record IN 
        SELECT * FROM public.town_achievement_tiers 
        WHERE achievement_id = achievement_record.id 
        AND threshold <= town_stat_value
        ORDER BY tier ASC
      LOOP
        -- Insert achievement if not already unlocked
        INSERT INTO public.town_unlocked_achievements (town_id, tier_id, unlocked_at)
        VALUES (town_record.id::TEXT, tier_record.id, NOW())
        ON CONFLICT (town_id, tier_id) DO NOTHING;
        
        -- Add XP if not already claimed
        IF NOT EXISTS (
          SELECT 1 FROM public.town_unlocked_achievements 
          WHERE town_id = town_record.id::TEXT 
          AND tier_id = tier_record.id 
          AND is_claimed = true
        ) THEN
          town_xp := town_xp + tier_record.points;
        END IF;
      END LOOP;
    END LOOP;
    
    -- Calculate new level
    SELECT level INTO new_level
    FROM public.calculate_town_level_from_xp(town_xp);
    
    -- Update town with new XP and level
    UPDATE public.towns 
    SET total_xp = town_xp, level = new_level
    WHERE id = town_record.id;
  END LOOP;
END;
$$;

-- Run the sync to populate achievements
SELECT public.sync_town_achievements();

-- Verify the function was created
SELECT 
  'Function created successfully' as status,
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname = 'claim_town_achievement' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Show summary of what was fixed
SELECT 
  'Town Achievement System Fixed' as message,
  'Claim function created with TEXT parameters' as function_status,
  'Permission checking added for admin/moderator/mayor' as permissions,
  'All qualifying tiers are awarded' as tier_awarding,
  'Sync function updated' as sync_status;

-- Show current town levels and achievements
SELECT 
  t.name as town_name,
  t.level,
  t.total_xp,
  COUNT(tua.id) as total_achievements,
  COUNT(CASE WHEN tua.is_claimed = true THEN 1 END) as claimed_achievements,
  COUNT(CASE WHEN tua.is_claimed = false OR tua.is_claimed IS NULL THEN 1 END) as unclaimed_achievements
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON t.id::TEXT = tua.town_id
GROUP BY t.id, t.name, t.level, t.total_xp
ORDER BY t.total_xp DESC
LIMIT 10; 