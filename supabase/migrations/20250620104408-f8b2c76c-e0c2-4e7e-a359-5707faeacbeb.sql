
-- Create comprehensive player statistics tables
CREATE TABLE public.player_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid TEXT NOT NULL UNIQUE,
  player_name TEXT NOT NULL,
  statistics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create player achievements table
CREATE TABLE public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_uuid, achievement_type, achievement_name)
);

-- Create online players tracking table
CREATE TABLE public.online_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid TEXT NOT NULL,
  player_name TEXT NOT NULL,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_uuid)
);

-- Create scoreboard data table
CREATE TABLE public.scoreboard_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  player_uuid TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category, player_uuid)
);

-- Add indexes for better performance
CREATE INDEX idx_player_statistics_uuid ON public.player_statistics(player_uuid);
CREATE INDEX idx_player_achievements_uuid ON public.player_achievements(player_uuid);
CREATE INDEX idx_online_players_uuid ON public.online_players(player_uuid);
CREATE INDEX idx_scoreboard_category ON public.scoreboard_data(category);
CREATE INDEX idx_scoreboard_rank ON public.scoreboard_data(category, rank);

-- Enable RLS
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoreboard_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (these are public gaming statistics)
CREATE POLICY "Anyone can view player statistics" ON public.player_statistics FOR SELECT USING (true);
CREATE POLICY "Anyone can view player achievements" ON public.player_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view online players" ON public.online_players FOR SELECT USING (true);
CREATE POLICY "Anyone can view scoreboard data" ON public.scoreboard_data FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp_player_statistics
  BEFORE UPDATE ON public.player_statistics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_online_players
  BEFORE UPDATE ON public.online_players
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_scoreboard_data
  BEFORE UPDATE ON public.scoreboard_data
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
