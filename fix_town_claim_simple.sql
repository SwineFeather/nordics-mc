-- Simple fix for town achievement claim function
-- Ensures function exists and handles types properly

-- First, let's check what functions exist
SELECT 
  'Existing functions' as info,
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname LIKE '%claim%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Drop ALL existing claim functions to start fresh
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, UUID);
DROP FUNCTION IF EXISTS public.claim_town_achievement(UUID, TEXT);
DROP FUNCTION IF EXISTS public.claim_town_achievement(TEXT, TEXT);

-- Create a simple, working claim function
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

-- Verify the function was created
SELECT 
  'Function created successfully' as status,
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname = 'claim_town_achievement' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test the function with a simple call (this will fail but shows the function exists)
SELECT 'Function test' as info, public.claim_town_achievement('test', 'test'); 