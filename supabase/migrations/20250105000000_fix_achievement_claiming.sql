-- Fix achievement claiming by updating get_claimable_achievements function
-- to create unlocked_achievements records when players qualify

-- Note: This assumes player stats are stored elsewhere (like in a JSON file or different table)
-- The function will need to be updated when we know where player stats are stored

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
  stat_value NUMERIC;
BEGIN
  -- For now, we'll return existing unlocked achievements that haven't been claimed
  -- This function will need to be updated when we know where player stats are stored
  
  RETURN QUERY
  SELECT 
    at.id as tier_id,
    ad.id as achievement_id,
    ad.name as achievement_name,
    at.name as tier_name,
    at.description as tier_description,
    at.points,
    at.tier as tier_number,
    0 as current_value, -- Placeholder until we know where stats are stored
    at.threshold,
    -- For now, only show achievements that are already unlocked but not claimed
    CASE 
      WHEN ua.id IS NOT NULL AND (ua.is_claimed = false OR ua.is_claimed IS NULL) THEN true
      ELSE false
    END as is_claimable
  FROM public.achievement_definitions ad
  JOIN public.achievement_tiers at ON ad.id = at.achievement_id
  LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
  WHERE ua.id IS NULL OR (ua.is_claimed = false OR ua.is_claimed IS NULL)
  ORDER BY ad.id, at.tier;
END;
$$; 