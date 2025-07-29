
-- Add foreign key constraint to ensure data integrity between players and player_stats
ALTER TABLE public.player_stats 
ADD CONSTRAINT fk_player_stats_player_uuid 
FOREIGN KEY (player_uuid) REFERENCES public.players(uuid) 
ON DELETE CASCADE;

-- Create indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_players_username_search ON public.players USING gin(to_tsvector('english', username));
CREATE INDEX IF NOT EXISTS idx_player_stats_lookup ON public.player_stats (player_uuid);
CREATE INDEX IF NOT EXISTS idx_players_total_xp ON public.players (total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_players_level ON public.players (level DESC);

-- Create a view for commonly accessed player profile data
CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  p.username,
  p.level,
  p.total_xp,
  p.first_joined,
  p.last_seen,
  p.is_online,
  p.created_at,
  ps.stats,
  ps.ranks,
  ps.medals,
  ps.updated_at as stats_updated_at
FROM public.players p
LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid;

-- Grant necessary permissions for the view
GRANT SELECT ON public.player_profiles_view TO authenticated;
GRANT SELECT ON public.player_profiles_view TO anon;

-- Create a function to get a single player profile efficiently
CREATE OR REPLACE FUNCTION public.get_player_profile(player_uuid_param TEXT)
RETURNS TABLE (
  uuid TEXT,
  username TEXT,
  level INTEGER,
  total_xp BIGINT,
  first_joined TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  stats JSONB,
  ranks JSONB,
  medals JSONB,
  stats_updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ppv.uuid,
    ppv.username,
    ppv.level,
    ppv.total_xp,
    ppv.first_joined,
    ppv.last_seen,
    ppv.is_online,
    ppv.created_at,
    ppv.stats,
    ppv.ranks,
    ppv.medals,
    ppv.stats_updated_at
  FROM public.player_profiles_view ppv
  WHERE ppv.uuid = player_uuid_param;
$$;
