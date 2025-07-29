
-- Remove unused player_statistics table since we're using player_stats instead
DROP TABLE IF EXISTS public.player_statistics CASCADE;

-- Ensure proper indexing for performance on the tables we're actually using
CREATE INDEX IF NOT EXISTS idx_players_username_search ON public.players USING gin(to_tsvector('english', username));
CREATE INDEX IF NOT EXISTS idx_player_stats_stats_search ON public.player_stats USING gin(stats);
CREATE INDEX IF NOT EXISTS idx_player_stats_ranks_search ON public.player_stats USING gin(ranks);
CREATE INDEX IF NOT EXISTS idx_player_stats_medals_search ON public.player_stats USING gin(medals);

-- Add a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_players_level_xp ON public.players (level DESC, total_xp DESC);

-- Ensure the calculate_player_rankings function is optimized
CREATE OR REPLACE FUNCTION public.calculate_player_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stat_keys TEXT[];
  stat_key TEXT;
  player_record RECORD;
  rank_counter INTEGER;
BEGIN
  -- Get all unique stat keys from player_stats (limit to prevent timeout)
  SELECT ARRAY_AGG(DISTINCT jsonb_object_keys(stats))
  INTO stat_keys
  FROM public.player_stats
  WHERE stats != '{}'
  LIMIT 1000;

  -- For each stat key, calculate rankings (with better performance)
  FOREACH stat_key IN ARRAY stat_keys
  LOOP
    rank_counter := 1;
    
    -- Update ranks for this stat using a more efficient approach
    FOR player_record IN (
      SELECT player_uuid, 
             CAST(stats->>stat_key AS NUMERIC) as stat_value
      FROM public.player_stats 
      WHERE stats ? stat_key 
        AND CAST(stats->>stat_key AS NUMERIC) > 0
      ORDER BY CAST(stats->>stat_key AS NUMERIC) DESC
      LIMIT 1000 -- Limit to top 1000 for performance
    ) LOOP
      UPDATE public.player_stats 
      SET ranks = COALESCE(ranks, '{}'::jsonb) || jsonb_build_object(stat_key, rank_counter)
      WHERE player_uuid = player_record.player_uuid;
      
      rank_counter := rank_counter + 1;
    END LOOP;
  END LOOP;

  -- Calculate medal points with better performance
  UPDATE public.player_stats 
  SET medals = jsonb_build_object(
    'points', (
      SELECT COALESCE(SUM(
        CASE 
          WHEN CAST(value AS INTEGER) = 1 THEN 4
          WHEN CAST(value AS INTEGER) = 2 THEN 2
          WHEN CAST(value AS INTEGER) = 3 THEN 1
          ELSE 0
        END
      ), 0)
      FROM jsonb_each_text(COALESCE(ranks, '{}'::jsonb))
      WHERE CAST(value AS INTEGER) BETWEEN 1 AND 3
    ),
    'gold', (
      SELECT COUNT(*)
      FROM jsonb_each_text(COALESCE(ranks, '{}'::jsonb))
      WHERE CAST(value AS INTEGER) = 1
    ),
    'silver', (
      SELECT COUNT(*)
      FROM jsonb_each_text(COALESCE(ranks, '{}'::jsonb))
      WHERE CAST(value AS INTEGER) = 2
    ),
    'bronze', (
      SELECT COUNT(*)
      FROM jsonb_each_text(COALESCE(ranks, '{}'::jsonb))
      WHERE CAST(value AS INTEGER) = 3
    )
  );
END;
$$;
