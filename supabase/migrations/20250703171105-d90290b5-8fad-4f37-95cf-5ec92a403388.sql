-- Add columns to track claiming status
ALTER TABLE public.unlocked_achievements 
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;

-- Drop the trigger and function in correct order
DROP TRIGGER IF EXISTS award_xp_on_achievement ON public.unlocked_achievements;
DROP FUNCTION IF EXISTS public.award_achievement_xp() CASCADE;

-- Create a function to manually claim an achievement and award XP
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
  
  -- Update player's total XP
  UPDATE public.players
  SET total_xp = total_xp + COALESCE(xp_amount, 0)
  WHERE uuid = p_player_uuid
  RETURNING total_xp INTO new_total_xp;
  
  -- Calculate new level based on total XP
  SELECT level INTO calculated_level
  FROM public.calculate_level_from_xp(new_total_xp);
  
  -- Update player's level
  UPDATE public.players
  SET level = calculated_level
  WHERE uuid = p_player_uuid;
  
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

-- Create a function to get claimable achievements for a player
CREATE OR REPLACE FUNCTION public.get_claimable_achievements(p_player_uuid TEXT)
RETURNS TABLE (
  tier_id UUID,
  achievement_id TEXT,
  achievement_name TEXT,
  tier_name TEXT,
  tier_description TEXT,
  points INTEGER,
  tier_number INTEGER,
  current_value NUMERIC,
  threshold NUMERIC,
  is_claimable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  converted_value NUMERIC;
  is_qualified BOOLEAN;
BEGIN
  -- First, check and create unlocked achievements for qualifying players
  FOR achievement_record IN (
    SELECT 
      ad.id as achievement_id,
      ad.stat,
      at.id as tier_id,
      at.threshold,
      at.tier
    FROM public.achievement_definitions ad
    JOIN public.achievement_tiers at ON ad.id = at.achievement_id
    LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
    WHERE ua.id IS NULL
  ) LOOP
    
    -- Get player's stat value
    SELECT COALESCE((ps.stats ->> achievement_record.stat)::NUMERIC, 0) INTO converted_value
    FROM public.player_stats ps
    WHERE ps.player_uuid = p_player_uuid;
    
    -- Check if player qualifies based on stat type
    IF achievement_record.stat = 'custom_minecraft_play_time' THEN
      is_qualified := FLOOR(converted_value / 72000) >= achievement_record.threshold;
    ELSIF achievement_record.stat IN ('ride_boat', 'walk', 'sprint') THEN
      is_qualified := FLOOR(converted_value / 100) >= achievement_record.threshold;
    ELSE
      is_qualified := converted_value >= achievement_record.threshold;
    END IF;
    
    -- If player qualifies, create the unlocked achievement
    IF is_qualified THEN
      INSERT INTO public.unlocked_achievements (player_uuid, tier_id, is_claimed, claimed_at)
      VALUES (p_player_uuid, achievement_record.tier_id, false, NULL)
      ON CONFLICT (player_uuid, tier_id) DO NOTHING;
    END IF;
  END LOOP;

  -- Now return all claimable achievements
  RETURN QUERY
  SELECT 
    at.id as tier_id,
    ad.id as achievement_id,
    ad.name as achievement_name,
    at.name as tier_name,
    at.description as tier_description,
    at.points,
    at.tier as tier_number,
    COALESCE((ps.stats ->> ad.stat)::NUMERIC, 0) as current_value,
    at.threshold,
    -- Check if player qualifies but hasn't claimed yet
    CASE 
      WHEN ad.stat = 'custom_minecraft_play_time' THEN
        FLOOR(COALESCE((ps.stats ->> ad.stat)::NUMERIC, 0) / 72000) >= at.threshold
      WHEN ad.stat IN ('ride_boat', 'walk', 'sprint') THEN
        FLOOR(COALESCE((ps.stats ->> ad.stat)::NUMERIC, 0) / 100) >= at.threshold
      ELSE
        COALESCE((ps.stats ->> ad.stat)::NUMERIC, 0) >= at.threshold
    END as is_claimable
  FROM public.achievement_definitions ad
  JOIN public.achievement_tiers at ON ad.id = at.achievement_id
  LEFT JOIN public.player_stats ps ON ps.player_uuid = p_player_uuid
  LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
  WHERE ua.id IS NULL OR (ua.is_claimed = false OR ua.is_claimed IS NULL)
  ORDER BY ad.id, at.tier;
END;
$$;

-- Create a function for admin to claim achievements for any player
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

-- Add unique constraint to prevent duplicate achievements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_player_tier'
  ) THEN
    ALTER TABLE public.unlocked_achievements 
    ADD CONSTRAINT unique_player_tier UNIQUE (player_uuid, tier_id);
  END IF;
END $$;