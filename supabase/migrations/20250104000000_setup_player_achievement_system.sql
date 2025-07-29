-- Comprehensive Player Achievement and Leveling System Setup
-- This migration creates all necessary tables, functions, and initial data for the achievement system

-- Create achievement definitions table
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id text not null,
  name text not null,
  description text not null,
  stat text not null,
  created_at timestamp with time zone not null default now(),
  constraint achievement_definitions_pkey primary key (id)
) TABLESPACE pg_default;

-- Create achievement tiers table
CREATE TABLE IF NOT EXISTS public.achievement_tiers (
  id uuid not null default gen_random_uuid (),
  achievement_id text not null,
  tier integer not null,
  name text not null,
  description text not null,
  threshold numeric not null,
  icon text not null,
  points integer not null,
  created_at timestamp with time zone not null default now(),
  constraint achievement_tiers_pkey primary key (id),
  constraint achievement_tiers_achievement_id_tier_key unique (achievement_id, tier),
  constraint achievement_tiers_achievement_id_fkey foreign KEY (achievement_id) references achievement_definitions (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create level definitions table
CREATE TABLE IF NOT EXISTS public.level_definitions (
  level integer not null,
  xp_required bigint not null,
  title text not null default ''::text,
  description text null default ''::text,
  color text null default '#3b82f6'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint level_definitions_pkey primary key (level)
) TABLESPACE pg_default;

-- Create unlocked achievements table with claiming support
CREATE TABLE IF NOT EXISTS public.unlocked_achievements (
  id uuid not null default gen_random_uuid (),
  player_uuid text not null,
  tier_id uuid not null,
  unlocked_at timestamp with time zone not null default now(),
  claimed_at timestamp with time zone,
  is_claimed boolean default false,
  constraint unlocked_achievements_pkey primary key (id),
  constraint unlocked_achievements_player_uuid_tier_id_key unique (player_uuid, tier_id),
  constraint unlocked_achievements_player_uuid_fkey foreign KEY (player_uuid) references players (uuid) on delete CASCADE,
  constraint unlocked_achievements_tier_id_fkey foreign KEY (tier_id) references achievement_tiers (id) on delete CASCADE
) TABLESPACE pg_default;

-- Ensure players table has required columns
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS level integer default 1,
ADD COLUMN IF NOT EXISTS total_xp bigint default 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievement_tiers_achievement_id ON public.achievement_tiers (achievement_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_achievements_player_uuid ON public.unlocked_achievements (player_uuid);
CREATE INDEX IF NOT EXISTS idx_unlocked_achievements_tier_id ON public.unlocked_achievements (tier_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_achievements_is_claimed ON public.unlocked_achievements (is_claimed);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(player_xp bigint)
RETURNS TABLE(level integer, xp_in_current_level bigint, xp_for_next_level bigint, progress numeric)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_level integer := 1;
  current_level_xp bigint := 0;
  next_level_xp bigint;
BEGIN
  -- Find the highest level the player has reached
  SELECT ld.level, ld.xp_required
  INTO current_level, current_level_xp
  FROM public.level_definitions ld
  WHERE ld.xp_required <= player_xp
  ORDER BY ld.level DESC
  LIMIT 1;
  
  -- Get XP required for next level
  SELECT ld.xp_required
  INTO next_level_xp
  FROM public.level_definitions ld
  WHERE ld.level = current_level + 1;
  
  -- If no next level exists, use current level XP + 100000
  IF next_level_xp IS NULL THEN
    next_level_xp := current_level_xp + 100000;
  END IF;
  
  -- Return the calculated values
  RETURN QUERY SELECT 
    current_level,
    player_xp - current_level_xp,
    next_level_xp - current_level_xp,
    CASE 
      WHEN next_level_xp - current_level_xp > 0 
      THEN ROUND(((player_xp - current_level_xp) * 100.0) / (next_level_xp - current_level_xp), 2)
      ELSE 100.0
    END;
END;
$$;

-- Function to claim an achievement and award XP
CREATE OR REPLACE FUNCTION public.claim_achievement(
  p_player_uuid text,
  p_tier_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  xp_amount integer;
  new_total_xp bigint;
  calculated_level integer;
  achievement_name text;
  tier_name text;
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

-- Function to get claimable achievements for a player
CREATE OR REPLACE FUNCTION public.get_claimable_achievements(p_player_uuid text)
RETURNS TABLE (
  tier_id uuid,
  achievement_id text,
  achievement_name text,
  tier_name text,
  tier_description text,
  points integer,
  tier_number integer,
  current_value numeric,
  threshold numeric,
  is_claimable boolean
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

-- Function to sync all achievements for all players
CREATE OR REPLACE FUNCTION public.sync_all_achievements()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_record record;
  achievement_record record;
  tier_record record;
  player_stat_value numeric;
  converted_stat_value numeric;
  highest_tier_id uuid;
  existing_achievement_count integer;
  processed_count integer := 0;
BEGIN
  RAISE NOTICE 'Starting achievement sync for all players...';
  
  -- Loop through all players with stats
  FOR player_record IN (
    SELECT p.uuid, ps.stats
    FROM public.players p
    LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
    WHERE ps.stats IS NOT NULL AND ps.stats != '{}'
  ) LOOP
    
    processed_count := processed_count + 1;
    IF processed_count % 50 = 0 THEN
      RAISE NOTICE 'Processed % players...', processed_count;
    END IF;
    
    -- Loop through all achievement definitions
    FOR achievement_record IN (
      SELECT * FROM public.achievement_definitions
    ) LOOP
      
      -- Get the player's raw stat value
      player_stat_value := COALESCE(
        (player_record.stats ->> achievement_record.stat)::NUMERIC,
        0
      );
      
      -- Skip if player has no progress in this stat
      CONTINUE WHEN player_stat_value <= 0;
      
      -- Convert stat value based on achievement type
      converted_stat_value := player_stat_value;
      
      -- Handle stat conversions
      IF achievement_record.stat = 'custom_minecraft_play_time' THEN
        -- Convert ticks to hours (20 ticks per second, 3600 seconds per hour)
        converted_stat_value := FLOOR(player_stat_value / 72000);
      ELSIF achievement_record.stat IN ('ride_boat', 'walk', 'sprint') THEN
        -- Convert centimeters to blocks (100 cm = 1 block)
        converted_stat_value := FLOOR(player_stat_value / 100);
      END IF;
      
      -- Skip if converted value is still 0
      CONTINUE WHEN converted_stat_value <= 0;
      
      -- Find the highest tier this player qualifies for
      highest_tier_id := NULL;
      
      -- Special handling for 'death' stat (lower is better) - if we add it later
      IF achievement_record.id = 'survivor' THEN
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND converted_stat_value <= threshold
        ORDER BY tier DESC
        LIMIT 1;
      ELSE
        -- Normal achievements (higher is better)
        SELECT id INTO highest_tier_id
        FROM public.achievement_tiers
        WHERE achievement_id = achievement_record.id
          AND converted_stat_value >= threshold
        ORDER BY tier DESC
        LIMIT 1;
      END IF;
      
      -- If player qualifies for a tier, check if they already have it
      IF highest_tier_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_achievement_count
        FROM public.unlocked_achievements
        WHERE player_uuid = player_record.uuid
          AND tier_id = highest_tier_id;
        
        -- Award achievement if not already unlocked
        IF existing_achievement_count = 0 THEN
          INSERT INTO public.unlocked_achievements (player_uuid, tier_id)
          VALUES (player_record.uuid, highest_tier_id);
          
          RAISE NOTICE 'Awarded achievement % to player %', achievement_record.id, player_record.uuid;
        END IF;
      END IF;
      
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Processed % total players', processed_count;
  
  -- Recalculate all player levels based on their total XP
  UPDATE public.players
  SET level = (
    SELECT level 
    FROM public.calculate_level_from_xp(players.total_xp) 
    LIMIT 1
  )
  WHERE total_xp > 0;
  
  RAISE NOTICE 'Achievement sync completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in sync_all_achievements: %', SQLERRM;
END;
$$;

-- Insert initial achievement definitions
INSERT INTO public.achievement_definitions (id, name, description, stat) VALUES
('playtime', 'Time Lord', 'Accumulate playtime on the server', 'custom_minecraft_play_time'),
('blocks_placed', 'Master Builder', 'Place blocks to build amazing structures', 'blocksPlaced'),
('blocks_broken', 'Mining Master', 'Break blocks to gather resources', 'blocksBroken'),
('mob_kills', 'Combat Expert', 'Defeat hostile mobs', 'mobKills'),
('diamond_mining', 'Diamond Hunter', 'Mine diamond ores', 'mined_minecraft_diamond_ore'),
('fishing', 'Master Angler', 'Catch fish and treasures', 'fishing_rod'),
('woodcutting', 'Lumberjack', 'Cut down trees and gather wood', 'mined_minecraft_oak_log'),
('travel', 'Explorer', 'Travel across the world', 'walk'),
('combat_weapons', 'Weapon Master', 'Master different combat weapons', 'netherite_sword'),
('ranged_combat', 'Archer', 'Master ranged combat', 'bow')
ON CONFLICT (id) DO NOTHING;

-- Insert achievement tiers
INSERT INTO public.achievement_tiers (achievement_id, tier, name, description, threshold, icon, points) VALUES
-- Playtime tiers
('playtime', 1, 'Newcomer', 'Play for 1 hour', 1, 'clock', 50),
('playtime', 2, 'Regular', 'Play for 10 hours', 10, 'clock', 100),
('playtime', 3, 'Dedicated', 'Play for 50 hours', 50, 'clock', 150),
('playtime', 4, 'Veteran', 'Play for 100 hours', 100, 'clock', 200),
('playtime', 5, 'Time Lord', 'Play for 500 hours', 500, 'clock', 250),

-- Blocks placed tiers
('blocks_placed', 1, 'Builder', 'Place 1,000 blocks', 1000, 'hammer', 50),
('blocks_placed', 2, 'Constructor', 'Place 5,000 blocks', 5000, 'hammer', 100),
('blocks_placed', 3, 'Engineer', 'Place 25,000 blocks', 25000, 'hammer', 150),
('blocks_placed', 4, 'Master Builder', 'Place 100,000 blocks', 100000, 'hammer', 200),
('blocks_placed', 5, 'Architect', 'Place 500,000 blocks', 500000, 'hammer', 250),

-- Blocks broken tiers
('blocks_broken', 1, 'Miner', 'Break 1,000 blocks', 1000, 'pickaxe', 50),
('blocks_broken', 2, 'Excavator', 'Break 5,000 blocks', 5000, 'pickaxe', 100),
('blocks_broken', 3, 'Tunneler', 'Break 25,000 blocks', 25000, 'pickaxe', 150),
('blocks_broken', 4, 'Mining Master', 'Break 100,000 blocks', 100000, 'pickaxe', 200),
('blocks_broken', 5, 'Terraformer', 'Break 500,000 blocks', 500000, 'pickaxe', 250),

-- Mob kills tiers
('mob_kills', 1, 'Fighter', 'Kill 100 mobs', 100, 'swords', 50),
('mob_kills', 2, 'Warrior', 'Kill 500 mobs', 500, 'swords', 100),
('mob_kills', 3, 'Slayer', 'Kill 2,500 mobs', 2500, 'swords', 150),
('mob_kills', 4, 'Combat Expert', 'Kill 10,000 mobs', 10000, 'swords', 200),
('mob_kills', 5, 'Legendary Hunter', 'Kill 50,000 mobs', 50000, 'swords', 250),

-- Diamond mining tiers
('diamond_mining', 1, 'Prospector', 'Mine 10 diamond ores', 10, 'gem', 100),
('diamond_mining', 2, 'Diamond Hunter', 'Mine 50 diamond ores', 50, 'gem', 200),
('diamond_mining', 3, 'Diamond Master', 'Mine 200 diamond ores', 200, 'gem', 300),
('diamond_mining', 4, 'Diamond Baron', 'Mine 1,000 diamond ores', 1000, 'gem', 400),
('diamond_mining', 5, 'Diamond King', 'Mine 5,000 diamond ores', 5000, 'gem', 500),

-- Fishing tiers
('fishing', 1, 'Fisher', 'Use fishing rod 100 times', 100, 'ship', 50),
('fishing', 2, 'Angler', 'Use fishing rod 500 times', 500, 'ship', 100),
('fishing', 3, 'Master Angler', 'Use fishing rod 2,500 times', 2500, 'ship', 150),
('fishing', 4, 'Fishing Legend', 'Use fishing rod 10,000 times', 10000, 'ship', 200),
('fishing', 5, 'Sea Lord', 'Use fishing rod 50,000 times', 50000, 'ship', 250),

-- Woodcutting tiers
('woodcutting', 1, 'Woodcutter', 'Mine 100 oak logs', 100, 'tree-deciduous', 50),
('woodcutting', 2, 'Lumberjack', 'Mine 500 oak logs', 500, 'tree-deciduous', 100),
('woodcutting', 3, 'Forest Master', 'Mine 2,500 oak logs', 2500, 'tree-deciduous', 150),
('woodcutting', 4, 'Timber Baron', 'Mine 10,000 oak logs', 10000, 'tree-deciduous', 200),
('woodcutting', 5, 'Nature Guardian', 'Mine 50,000 oak logs', 50000, 'tree-deciduous', 250),

-- Travel tiers
('travel', 1, 'Wanderer', 'Walk 10,000 blocks', 10000, 'footprints', 50),
('travel', 2, 'Explorer', 'Walk 50,000 blocks', 50000, 'footprints', 100),
('travel', 3, 'Adventurer', 'Walk 250,000 blocks', 250000, 'footprints', 150),
('travel', 4, 'Voyager', 'Walk 1,000,000 blocks', 1000000, 'footprints', 200),
('travel', 5, 'World Walker', 'Walk 5,000,000 blocks', 5000000, 'footprints', 250),

-- Combat weapons tiers
('combat_weapons', 1, 'Swordsman', 'Use netherite sword 100 times', 100, 'sword', 100),
('combat_weapons', 2, 'Blade Master', 'Use netherite sword 500 times', 500, 'sword', 200),
('combat_weapons', 3, 'Weapon Master', 'Use netherite sword 2,500 times', 2500, 'sword', 300),
('combat_weapons', 4, 'Combat Legend', 'Use netherite sword 10,000 times', 10000, 'sword', 400),
('combat_weapons', 5, 'War God', 'Use netherite sword 50,000 times', 50000, 'sword', 500),

-- Ranged combat tiers
('ranged_combat', 1, 'Archer', 'Use bow 100 times', 100, 'bow', 50),
('ranged_combat', 2, 'Marksman', 'Use bow 500 times', 500, 'bow', 100),
('ranged_combat', 3, 'Sharpshooter', 'Use bow 2,500 times', 2500, 'bow', 150),
('ranged_combat', 4, 'Ranged Master', 'Use bow 10,000 times', 10000, 'bow', 200),
('ranged_combat', 5, 'Eagle Eye', 'Use bow 50,000 times', 50000, 'bow', 250)
ON CONFLICT (achievement_id, tier) DO NOTHING;

-- Insert level definitions
INSERT INTO public.level_definitions (level, xp_required, title, description, color) VALUES
(1, 0, 'Newcomer', 'Welcome to the server!', '#6b7280'),
(2, 100, 'Novice', 'Getting started', '#10b981'),
(3, 250, 'Apprentice', 'Learning the ropes', '#3b82f6'),
(4, 500, 'Journeyman', 'Making progress', '#8b5cf6'),
(5, 1000, 'Adventurer', 'Exploring the world', '#f59e0b'),
(6, 1750, 'Explorer', 'Discovering new places', '#06b6d4'),
(7, 2750, 'Veteran', 'Experienced player', '#84cc16'),
(8, 4000, 'Expert', 'Skilled and knowledgeable', '#f97316'),
(9, 6000, 'Master', 'Mastered the game', '#ef4444'),
(10, 8500, 'Champion', 'Elite player', '#a855f7'),
(11, 12000, 'Legend', 'Legendary status', '#dc2626'),
(12, 16500, 'Mythic', 'Mythical prowess', '#9333ea'),
(13, 22500, 'Ascended', 'Beyond mortal limits', '#1d4ed8'),
(14, 30000, 'Divine', 'Divine power', '#059669'),
(15, 40000, 'Transcendent', 'Transcended reality', '#be123c')
ON CONFLICT (level) DO NOTHING;

-- Enable RLS and create policies
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (with IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_definitions' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON public.achievement_definitions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_tiers' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON public.achievement_tiers FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'level_definitions' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON public.level_definitions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unlocked_achievements' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON public.unlocked_achievements FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unlocked_achievements' AND policyname = 'Allow users to insert their own achievements') THEN
        CREATE POLICY "Allow users to insert their own achievements" ON public.unlocked_achievements 
        FOR INSERT WITH CHECK (auth.uid()::text = player_uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unlocked_achievements' AND policyname = 'Allow users to update their own achievements') THEN
        CREATE POLICY "Allow users to update their own achievements" ON public.unlocked_achievements 
        FOR UPDATE USING (auth.uid()::text = player_uuid);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.achievement_definitions TO anon, authenticated;
GRANT ALL ON public.achievement_tiers TO anon, authenticated;
GRANT ALL ON public.level_definitions TO anon, authenticated;
GRANT ALL ON public.unlocked_achievements TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_level_from_xp(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_achievement(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_claimable_achievements(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_all_achievements() TO anon, authenticated; 