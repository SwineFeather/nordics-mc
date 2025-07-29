-- Migration: Fix get_claimable_achievements to support dot notation for nested stat keys
-- Date: 2025-07-10

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
BEGIN
  RETURN QUERY
  SELECT 
    at.id as tier_id,
    ad.id as achievement_id,
    ad.name as achievement_name,
    at.name as tier_name,
    at.description as tier_description,
    at.points,
    at.tier as tier_number,
    -- Support dot notation for nested stat keys
    COALESCE(
      CASE
        WHEN position('.' in ad.stat) > 0 THEN
          (ps.stats #>> string_to_array(ad.stat, '.'))::NUMERIC
        ELSE
          (ps.stats ->> ad.stat)::NUMERIC
      END,
      0
    ) as current_value,
    at.threshold,
    -- Check if player qualifies but hasn't claimed yet
    CASE 
      WHEN ad.stat = 'custom_minecraft_play_time' THEN
        FLOOR(
          COALESCE(
            CASE WHEN position('.' in ad.stat) > 0 THEN
              (ps.stats #>> string_to_array(ad.stat, '.'))::NUMERIC
            ELSE
              (ps.stats ->> ad.stat)::NUMERIC
            END,
            0
          ) / 72000
        ) >= at.threshold
      WHEN ad.stat IN ('ride_boat', 'walk', 'sprint') THEN
        FLOOR(
          COALESCE(
            CASE WHEN position('.' in ad.stat) > 0 THEN
              (ps.stats #>> string_to_array(ad.stat, '.'))::NUMERIC
            ELSE
              (ps.stats ->> ad.stat)::NUMERIC
            END,
            0
          ) / 100
        ) >= at.threshold
      ELSE
        COALESCE(
          CASE WHEN position('.' in ad.stat) > 0 THEN
            (ps.stats #>> string_to_array(ad.stat, '.'))::NUMERIC
          ELSE
            (ps.stats ->> ad.stat)::NUMERIC
          END,
          0
        ) >= at.threshold
    END as is_claimable
  FROM public.achievement_definitions ad
  JOIN public.achievement_tiers at ON ad.id = at.achievement_id
  LEFT JOIN public.player_stats ps ON ps.player_uuid = p_player_uuid
  LEFT JOIN public.unlocked_achievements ua ON ua.player_uuid = p_player_uuid AND ua.tier_id = at.id
  WHERE ua.id IS NULL OR (ua.is_claimed = false OR ua.is_claimed IS NULL)
  ORDER BY ad.id, at.tier;
END;
$$; 