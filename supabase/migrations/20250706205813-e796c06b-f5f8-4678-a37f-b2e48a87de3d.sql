
-- Create the new player_awards table
CREATE TABLE IF NOT EXISTS public.player_awards (
  id SERIAL PRIMARY KEY,
  player_uuid UUID NOT NULL REFERENCES public.players(uuid),
  award_id VARCHAR(255) NOT NULL,
  award_name VARCHAR(255) NOT NULL,
  award_description TEXT,
  tier VARCHAR(50) NOT NULL,
  medal VARCHAR(50) NOT NULL,
  points DECIMAL(10,2) NOT NULL DEFAULT 0,
  stat_value BIGINT,
  stat_path VARCHAR(255),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the new player_medals table
CREATE TABLE IF NOT EXISTS public.player_medals (
  player_uuid UUID PRIMARY KEY REFERENCES public.players(uuid),
  bronze_count INTEGER DEFAULT 0,
  silver_count INTEGER DEFAULT 0,
  gold_count INTEGER DEFAULT 0,
  total_medals INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the new player_points table
CREATE TABLE IF NOT EXISTS public.player_points (
  player_uuid UUID PRIMARY KEY REFERENCES public.players(uuid),
  total_points DECIMAL(10,2) DEFAULT 0,
  stone_points DECIMAL(10,2) DEFAULT 0,
  iron_points DECIMAL(10,2) DEFAULT 0,
  diamond_points DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update the existing player_stats table to match the new structure
ALTER TABLE public.player_stats 
DROP COLUMN IF EXISTS ranks,
DROP COLUMN IF EXISTS medals;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_awards_uuid ON public.player_awards(player_uuid);
CREATE INDEX IF NOT EXISTS idx_player_awards_medal ON public.player_awards(medal);
CREATE INDEX IF NOT EXISTS idx_player_awards_tier ON public.player_awards(tier);
CREATE INDEX IF NOT EXISTS idx_player_stats_jsonb ON public.player_stats USING GIN (stats);

-- Enable RLS on new tables
ALTER TABLE public.player_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (matching existing pattern)
CREATE POLICY "Allow anonymous select on player_awards" ON public.player_awards FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on player_awards" ON public.player_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on player_awards" ON public.player_awards FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous select on player_medals" ON public.player_medals FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on player_medals" ON public.player_medals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on player_medals" ON public.player_medals FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous select on player_points" ON public.player_points FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on player_points" ON public.player_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on player_points" ON public.player_points FOR UPDATE USING (true);

-- Create helper functions for leaderboards
CREATE OR REPLACE FUNCTION get_top_players_by_stat(stat_name_param TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(player_name TEXT, stat_value BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT as player_name,
        (ps.stats->>stat_name_param)::BIGINT as stat_value
    FROM players p
    JOIN player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats ? stat_name_param
    ORDER BY (ps.stats->>stat_name_param)::BIGINT DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_award_leaderboard(award_id_param TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(player_name TEXT, medal VARCHAR, points NUMERIC, achieved_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT as player_name,
        pa.medal::VARCHAR(50),
        pa.points::DECIMAL(10,2),
        pa.achieved_at
    FROM players p
    JOIN player_awards pa ON p.uuid = pa.player_uuid
    WHERE pa.award_id = award_id_param
    ORDER BY pa.points DESC, pa.achieved_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_medal_leaderboard(medal_type TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(player_name TEXT, medal_count INTEGER, total_points NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT as player_name,
        pm.bronze_count + pm.silver_count + pm.gold_count as medal_count,
        pp.total_points::DECIMAL(10,2)
    FROM players p
    JOIN player_medals pm ON p.uuid = pm.player_uuid
    JOIN player_points pp ON p.uuid = pp.player_uuid
    WHERE 
        CASE 
            WHEN medal_type = 'bronze' THEN pm.bronze_count > 0
            WHEN medal_type = 'silver' THEN pm.silver_count > 0
            WHEN medal_type = 'gold' THEN pm.gold_count > 0
            ELSE true
        END
    ORDER BY 
        CASE 
            WHEN medal_type = 'bronze' THEN pm.bronze_count
            WHEN medal_type = 'silver' THEN pm.silver_count
            WHEN medal_type = 'gold' THEN pm.gold_count
            ELSE pm.total_medals
        END DESC,
        pp.total_points DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(player_name TEXT, total_points NUMERIC, bronze_count INTEGER, silver_count INTEGER, gold_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT as player_name,
        pp.total_points::DECIMAL(10,2),
        pm.bronze_count,
        pm.silver_count,
        pm.gold_count
    FROM players p
    JOIN player_points pp ON p.uuid = pp.player_uuid
    JOIN player_medals pm ON p.uuid = pm.player_uuid
    ORDER BY pp.total_points DESC, pm.gold_count DESC, pm.silver_count DESC, pm.bronze_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Helper functions for updating medal and point counts
CREATE OR REPLACE FUNCTION update_player_medals(player_uuid_param UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO player_medals (player_uuid, bronze_count, silver_count, gold_count, total_medals, last_updated)
    SELECT 
        player_uuid_param,
        COUNT(CASE WHEN medal = 'bronze' THEN 1 END) as bronze_count,
        COUNT(CASE WHEN medal = 'silver' THEN 1 END) as silver_count,
        COUNT(CASE WHEN medal = 'gold' THEN 1 END) as gold_count,
        COUNT(*) as total_medals,
        NOW()
    FROM player_awards
    WHERE player_uuid = player_uuid_param
    ON CONFLICT (player_uuid) DO UPDATE SET
        bronze_count = EXCLUDED.bronze_count,
        silver_count = EXCLUDED.silver_count,
        gold_count = EXCLUDED.gold_count,
        total_medals = EXCLUDED.total_medals,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_player_points(player_uuid_param UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO player_points (player_uuid, total_points, stone_points, iron_points, diamond_points, last_updated)
    SELECT 
        player_uuid_param,
        SUM(points) as total_points,
        SUM(CASE WHEN tier = 'stone' THEN points ELSE 0 END) as stone_points,
        SUM(CASE WHEN tier = 'iron' THEN points ELSE 0 END) as iron_points,
        SUM(CASE WHEN tier = 'diamond' THEN points ELSE 0 END) as diamond_points,
        NOW()
    FROM player_awards
    WHERE player_uuid = player_uuid_param
    ON CONFLICT (player_uuid) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        stone_points = EXCLUDED.stone_points,
        iron_points = EXCLUDED.iron_points,
        diamond_points = EXCLUDED.diamond_points,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get player stats by category
CREATE OR REPLACE FUNCTION get_player_stats_by_category(player_uuid_param UUID, category_param TEXT)
RETURNS TABLE(stat_name TEXT, stat_value BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key::TEXT as stat_name,
        (value::TEXT)::BIGINT as stat_value
    FROM player_stats ps,
         jsonb_each(ps.stats) as stats(key, value)
    WHERE ps.player_uuid = player_uuid_param
      AND key LIKE category_param || '.%';
END;
$$ LANGUAGE plpgsql;
