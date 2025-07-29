-- Fix Missing Tables and Additional Setup
-- Run this in your Supabase SQL Editor to create any missing tables

-- 1. Create player_badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.player_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_uuid TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  badge_color TEXT DEFAULT '#6b7280',
  is_verified BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  icon TEXT DEFAULT 'User',
  icon_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  minecraft_username TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create towns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.towns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  mayor_name TEXT,
  residents_count INTEGER DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  nation_name TEXT,
  is_capital BOOLEAN DEFAULT false,
  world_name TEXT DEFAULT 'world',
  location_x INTEGER DEFAULT 0,
  location_z INTEGER DEFAULT 0,
  spawn_x DOUBLE PRECISION DEFAULT 0,
  spawn_y DOUBLE PRECISION DEFAULT 64,
  spawn_z DOUBLE PRECISION DEFAULT 0,
  tag TEXT,
  board TEXT,
  max_residents INTEGER DEFAULT 50,
  max_plots INTEGER DEFAULT 100,
  taxes NUMERIC DEFAULT 0,
  plot_tax NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create nations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.nations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  leader_name TEXT,
  capital_name TEXT,
  balance NUMERIC DEFAULT 0,
  towns_count INTEGER DEFAULT 0,
  residents_count INTEGER DEFAULT 0,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  board TEXT,
  taxes NUMERIC DEFAULT 0,
  town_tax NUMERIC DEFAULT 0,
  max_towns INTEGER DEFAULT 10,
  ally_count INTEGER DEFAULT 0,
  enemy_count INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create players table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.players (
  uuid TEXT PRIMARY KEY,
  name TEXT,
  username TEXT,
  level INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  last_seen BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create player_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_uuid TEXT REFERENCES public.players(uuid) ON DELETE CASCADE,
  stats JSONB DEFAULT '{}',
  ranks JSONB DEFAULT '{}',
  medals JSONB DEFAULT '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_badges_player_uuid ON public.player_badges(player_uuid);
CREATE INDEX IF NOT EXISTS idx_player_badges_badge_type ON public.player_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_profiles_minecraft_username ON public.profiles(minecraft_username);
CREATE INDEX IF NOT EXISTS idx_towns_name ON public.towns(name);
CREATE INDEX IF NOT EXISTS idx_towns_nation_name ON public.towns(nation_name);
CREATE INDEX IF NOT EXISTS idx_nations_name ON public.nations(name);
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players(name);
CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(username);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_uuid ON public.player_stats(player_uuid);

-- 8. Enable Row Level Security
ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for player_badges
CREATE POLICY "Public read access to player_badges" ON public.player_badges
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage player_badges" ON public.player_badges
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read access to profiles" ON public.profiles
  FOR SELECT USING (true);

-- 11. Create RLS policies for towns
CREATE POLICY "Public read access to towns" ON public.towns
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage towns" ON public.towns
  FOR ALL USING (auth.role() = 'authenticated');

-- 12. Create RLS policies for nations
CREATE POLICY "Public read access to nations" ON public.nations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage nations" ON public.nations
  FOR ALL USING (auth.role() = 'authenticated');

-- 13. Create RLS policies for players
CREATE POLICY "Public read access to players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage players" ON public.players
  FOR ALL USING (auth.role() = 'authenticated');

-- 14. Create RLS policies for player_stats
CREATE POLICY "Public read access to player_stats" ON public.player_stats
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage player_stats" ON public.player_stats
  FOR ALL USING (auth.role() = 'authenticated');

-- 15. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_towns_updated_at ON towns;
CREATE TRIGGER update_towns_updated_at
  BEFORE UPDATE ON towns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nations_updated_at ON nations;
CREATE TRIGGER update_nations_updated_at
  BEFORE UPDATE ON nations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
CREATE TRIGGER update_player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 17. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.player_badges TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.towns TO anon, authenticated;
GRANT ALL ON public.nations TO anon, authenticated;
GRANT ALL ON public.players TO anon, authenticated;
GRANT ALL ON public.player_stats TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 18. Insert sample data for testing
INSERT INTO public.towns (name, mayor_name, residents_count, balance, level, nation_name) VALUES
('Garvia', '_Bamson', 5, 10000, 3, 'Constellation'),
('Northstar', 'Player1', 3, 5000, 2, 'Constellation'),
('TestTown', 'TestMayor', 1, 1000, 1, 'TestNation')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.nations (name, leader_name, capital_name, towns_count, residents_count) VALUES
('Constellation', 'ConstellationLeader', 'Garvia', 2, 8),
('TestNation', 'TestLeader', 'TestTown', 1, 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.players (uuid, name, username, level, total_xp) VALUES
('test-uuid-1', 'TestPlayer1', 'TestPlayer1', 10, 1000),
('test-uuid-2', 'TestPlayer2', 'TestPlayer2', 5, 500)
ON CONFLICT (uuid) DO NOTHING;

INSERT INTO public.player_stats (player_uuid, stats) VALUES
('test-uuid-1', '{"blocksPlaced": 1000, "blocksBroken": 500, "mobKills": 50}'),
('test-uuid-2', '{"blocksPlaced": 500, "blocksBroken": 250, "mobKills": 25}')
ON CONFLICT DO NOTHING;

-- 19. Test the setup
SELECT 'Missing tables setup complete!' as status;
SELECT COUNT(*) as player_badges_count FROM public.player_badges;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as towns_count FROM public.towns;
SELECT COUNT(*) as nations_count FROM public.nations;
SELECT COUNT(*) as players_count FROM public.players;
SELECT COUNT(*) as player_stats_count FROM public.player_stats; 