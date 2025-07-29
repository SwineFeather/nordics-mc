
-- Create a new 'players' table to store player-specific data
CREATE TABLE public.players (
  uuid TEXT PRIMARY KEY, -- Minecraft UUID
  username TEXT NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level INT NOT NULL DEFAULT 1,
  total_xp BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.players IS 'Stores core data for each unique Minecraft player.';
COMMENT ON COLUMN public.players.uuid IS 'Minecraft player UUID.';
COMMENT ON COLUMN public.players.profile_id IS 'Link to a registered website user profile.';

-- Create a table for player stats
CREATE TABLE public.player_stats (
    player_uuid TEXT PRIMARY KEY REFERENCES public.players(uuid) ON DELETE CASCADE,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    ranks JSONB NOT NULL DEFAULT '{}'::jsonb,
    medals JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.player_stats IS 'Stores aggregated stats, ranks, and medals for players.';
COMMENT ON COLUMN public.player_stats.stats IS 'All player statistics like playtime, blocks broken, etc.';

-- Create tables for the achievement system, moved from config files
CREATE TABLE public.achievement_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    stat TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.achievement_definitions IS 'Definitions for each achievement category.';

CREATE TABLE public.achievement_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_id TEXT NOT NULL REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
    tier INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    icon TEXT NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(achievement_id, tier)
);
COMMENT ON TABLE public.achievement_tiers IS 'Individual tiers for each achievement.';
COMMENT ON COLUMN public.achievement_tiers.points IS 'XP awarded for completing this tier.';

-- Create table to track unlocked achievements
CREATE TABLE public.unlocked_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_uuid TEXT NOT NULL REFERENCES public.players(uuid) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.achievement_tiers(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_uuid, tier_id)
);
COMMENT ON TABLE public.unlocked_achievements IS 'Tracks which achievements each player has unlocked.';

-- RLS Policies --
-- Make all new tables publicly readable for now
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.player_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.achievement_definitions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.achievement_tiers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.unlocked_achievements FOR SELECT USING (true);

-- Function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update 'updated_at' on players and player_stats tables
CREATE TRIGGER set_players_timestamp
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_player_stats_timestamp
BEFORE UPDATE ON public.player_stats
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Seed achievement data from config file
INSERT INTO public.achievement_definitions (id, name, description, stat) VALUES
('playtime', 'Time Lord', 'Total time spent on the server.', 'playtimeHours'),
('blocks_placed', 'Master Builder', 'Total blocks placed in the world.', 'blocksPlaced'),
('blocks_broken', 'Excavator', 'Total blocks broken.', 'blocksBroken'),
('mob_kills', 'Monster Hunter', 'Total mobs killed.', 'mobKills'),
('balance', 'Financier', 'Amount of money accumulated.', 'balance'),
('jumps', 'Acrobat', 'Total number of jumps.', 'jumps'),
('damage_dealt', 'Gladiator', 'Total damage dealt to mobs and players.', 'damageDealt'),
('monument_builder', 'Monument Builder', 'Build a server-recognized monument. (Granted by Admin)', 'monument_builds');

INSERT INTO public.achievement_tiers (achievement_id, tier, name, description, threshold, icon, points) VALUES
('playtime', 1, 'Novice Adventurer', 'Play for 50 hours', 50, 'Star', 10),
('playtime', 2, 'Seasoned Explorer', 'Play for 100 hours', 100, 'Star', 20),
('playtime', 3, 'Server Veteran', 'Play for 250 hours', 250, 'Award', 50),
('playtime', 4, 'Nordics Legend', 'Play for 500 hours', 500, 'Award', 100),
('playtime', 5, 'Living History', 'Play for 1000 hours', 1000, 'Trophy', 200),

('blocks_placed', 1, 'Apprentice Builder', 'Place 10,000 blocks', 10000, 'Star', 10),
('blocks_placed', 2, 'Journeyman Builder', 'Place 50,000 blocks', 50000, 'Star', 20),
('blocks_placed', 3, 'Master Architect', 'Place 250,000 blocks', 250000, 'Award', 50),
('blocks_placed', 4, 'World Shaper', 'Place 1,000,000 blocks', 1000000, 'Trophy', 100),

('blocks_broken', 1, 'Digger', 'Break 15,000 blocks', 15000, 'Star', 10),
('blocks_broken', 2, 'Miner', 'Break 75,000 blocks', 75000, 'Star', 20),
('blocks_broken', 3, 'Expert Excavator', 'Break 300,000 blocks', 300000, 'Award', 50),
('blocks_broken', 4, 'Earth Mover', 'Break 1,500,000 blocks', 1500000, 'Trophy', 100),

('mob_kills', 1, 'Novice Slayer', 'Kill 100 mobs', 100, 'Star', 10),
('mob_kills', 2, 'Expert Slayer', 'Kill 1,000 mobs', 1000, 'Award', 25),
('mob_kills', 3, 'Legendary Hunter', 'Kill 5,000 mobs', 5000, 'Trophy', 75),

('balance', 1, 'Pocket Change', 'Reach a balance of $1,000', 1000, 'Star', 10),
('balance', 2, 'Getting Wealthy', 'Reach a balance of $10,000', 10000, 'Star', 20),
('balance', 3, 'Financially Secure', 'Reach a balance of $25,000', 25000, 'Award', 50),
('balance', 4, 'Richie Rich', 'Reach a balance of $50,000', 50000, 'Trophy', 100),

('jumps', 1, 'Hopper', 'Jump 10,000 times', 10000, 'Star', 10),
('jumps', 2, 'Jumper', 'Jump 100,000 times', 100000, 'Award', 25),
('jumps', 3, 'Lunar Leap', 'Jump 1,000,000 times', 1000000, 'Trophy', 75),

('damage_dealt', 1, 'Brawler', 'Deal 1,000 damage', 1000, 'Star', 10),
('damage_dealt', 2, 'Warrior', 'Deal 10,000 damage', 10000, 'Award', 25),
('damage_dealt', 3, 'Warlord', 'Deal 100,000 damage', 100000, 'Trophy', 75),

('monument_builder', 1, 'Monumental Achievement', 'Build a great monument.', 1, 'Trophy', 5000);

