-- Fix the claim_achievement function to work with the actual table structure

CREATE OR REPLACE FUNCTION public.claim_achievement(
  p_player_uuid TEXT,
  p_tier_id UUID
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
  result JSONB;
BEGIN
  -- Check if achievement exists and is not already claimed
  SELECT COUNT(*) INTO xp_amount
  FROM public.unlocked_achievements
  WHERE player_uuid = p_player_uuid 
    AND tier_id = p_tier_id 
    AND (is_claimed = false OR is_claimed IS NULL);
  
  IF xp_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Achievement not found or already claimed');
  END IF;
  
  -- Get the XP points and achievement info
  SELECT at.points, ad.name, at.name
  INTO xp_amount, achievement_name, tier_name
  FROM public.achievement_tiers at
  JOIN public.achievement_definitions ad ON at.achievement_id = ad.id
  WHERE at.id = p_tier_id;
  
  -- Mark achievement as claimed
  UPDATE public.unlocked_achievements
  SET is_claimed = true, claimed_at = NOW()
  WHERE player_uuid = p_player_uuid AND tier_id = p_tier_id;
  
  -- Update player's total XP (convert text UUID to UUID for the players table)
  UPDATE public.players
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE uuid::TEXT = p_player_uuid
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_level_from_xp(new_total_xp);
  
  -- Update player's level
  UPDATE public.players
  SET level = calculated_level
  WHERE uuid::TEXT = p_player_uuid;
  
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

-- Also fix the admin_claim_achievement function
CREATE OR REPLACE FUNCTION public.admin_claim_achievement(
  p_admin_user_id UUID,
  p_player_uuid TEXT,
  p_tier_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
  result JSONB;
BEGIN
  -- Check if the user has admin role
  SELECT role INTO admin_role
  FROM public.profiles
  WHERE id = p_admin_user_id;
  
  IF admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient permissions');
  END IF;
  
  -- First, ensure the achievement exists in unlocked_achievements (even if not earned)
  INSERT INTO public.unlocked_achievements (player_uuid, tier_id, is_claimed, claimed_at)
  VALUES (p_player_uuid, p_tier_id, false, NULL)
  ON CONFLICT (player_uuid, tier_id) DO NOTHING;
  
  -- Now claim it
  SELECT public.claim_achievement(p_player_uuid, p_tier_id) INTO result;
  
  RETURN result;
END;
$$; 