-- Fix for town achievement claim function overloading issue
-- Drop ALL existing claim functions to resolve conflicts

-- Drop all variations of the claim function
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

-- Test the function with a sample call (commented out to avoid errors)
-- SELECT public.claim_town_achievement('sample-town-id', 'sample-tier-id');

-- Show that the function was created successfully
SELECT 
  'Function created successfully' as status,
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname = 'claim_town_achievement' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 