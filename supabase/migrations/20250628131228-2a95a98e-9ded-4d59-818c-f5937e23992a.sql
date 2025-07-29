
-- First, let's clean up old tables and create proper structure for the new stats system
DROP TABLE IF EXISTS minecraft_stats CASCADE;
DROP TABLE IF EXISTS scoreboard_data CASCADE;

-- Create a comprehensive player_stats table to replace the old system
CREATE TABLE IF NOT EXISTS public.player_stats (
  player_uuid TEXT PRIMARY KEY,
  stats JSONB NOT NULL DEFAULT '{}',
  ranks JSONB NOT NULL DEFAULT '{}',
  medals JSONB NOT NULL DEFAULT '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on player_stats
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to player stats
CREATE POLICY "Allow public read access to player stats" 
ON public.player_stats FOR SELECT 
USING (true);

-- Create policy for service role to manage player stats
CREATE POLICY "Allow service role to manage player stats" 
ON public.player_stats FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update the players table to be more comprehensive
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS first_joined TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_username_lower ON public.players (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_players_uuid ON public.players (uuid);
CREATE INDEX IF NOT EXISTS idx_player_stats_uuid ON public.player_stats (player_uuid);

-- Create a function to calculate medal points and rankings
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
  -- Get all unique stat keys from player_stats
  SELECT ARRAY_AGG(DISTINCT jsonb_object_keys(stats))
  INTO stat_keys
  FROM public.player_stats
  WHERE stats != '{}';

  -- For each stat key, calculate rankings
  FOREACH stat_key IN ARRAY stat_keys
  LOOP
    rank_counter := 1;
    
    -- Update ranks for this stat
    FOR player_record IN (
      SELECT player_uuid, 
             CAST(stats->>stat_key AS NUMERIC) as stat_value
      FROM public.player_stats 
      WHERE stats ? stat_key 
        AND CAST(stats->>stat_key AS NUMERIC) > 0
      ORDER BY CAST(stats->>stat_key AS NUMERIC) DESC
    ) LOOP
      UPDATE public.player_stats 
      SET ranks = ranks || jsonb_build_object(stat_key, rank_counter)
      WHERE player_uuid = player_record.player_uuid;
      
      rank_counter := rank_counter + 1;
    END LOOP;
  END LOOP;

  -- Calculate medal points
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
      FROM jsonb_each_text(ranks)
    ),
    'gold', (
      SELECT COUNT(*)
      FROM jsonb_each_text(ranks)
      WHERE CAST(value AS INTEGER) = 1
    ),
    'silver', (
      SELECT COUNT(*)
      FROM jsonb_each_text(ranks)
      WHERE CAST(value AS INTEGER) = 2
    ),
    'bronze', (
      SELECT COUNT(*)
      FROM jsonb_each_text(ranks)
      WHERE CAST(value AS INTEGER) = 3
    )
  );
END;
$$;
