-- Test script to verify achievement fix works
-- Run this after applying the stat name fixes

-- Test the calculation function with the player's actual stats
-- Based on the debug panel, player 75c88432-a4ed-4f01-a660-b98783a0ed1b has:
-- use_dirt: 106095 (blocks placed)
-- mine_ground: 98376 (blocks broken)  
-- kill_any: 2184 (mob kills)
-- damage_dealt: 255016 (damage dealt)
-- jump: 779502 (jumps)
-- use_bow: 56 (bow uses)
-- mine_wood: 4098 (wood mined)

-- Create a test JSON with the player's actual stats
WITH player_stats AS (
  SELECT '{
    "use_dirt": 106095,
    "mine_ground": 98376,
    "kill_any": 2184,
    "damage_dealt": 255016,
    "jump": 779502,
    "use_bow": 56,
    "mine_wood": 4098,
    "play_one_minute": 0,
    "walk_one_cm": 0
  }'::jsonb as stats
)
SELECT 
  ad.name as achievement_name,
  ad.stat as stat_name,
  at.name as tier_name,
  at.threshold,
  at.tier,
  at.points,
  ps.stats ->> ad.stat as raw_value,
  CASE 
    WHEN ad.stat IN ('play', 'play_one_minute') THEN FLOOR((ps.stats ->> ad.stat)::numeric / 72000)
    WHEN ad.stat IN ('walk', 'walk_one_cm', 'sprint') THEN FLOOR((ps.stats ->> ad.stat)::numeric / 100)
    ELSE (ps.stats ->> ad.stat)::numeric
  END as calculated_value,
  CASE 
    WHEN ad.stat IN ('play', 'play_one_minute') THEN FLOOR((ps.stats ->> ad.stat)::numeric / 72000) >= at.threshold
    WHEN ad.stat IN ('walk', 'walk_one_cm', 'sprint') THEN FLOOR((ps.stats ->> ad.stat)::numeric / 100) >= at.threshold
    ELSE (ps.stats ->> ad.stat)::numeric >= at.threshold
  END as qualifies
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
CROSS JOIN player_stats ps
WHERE ad.stat IN ('use_dirt', 'mine_ground', 'kill_any', 'damage_dealt', 'jump', 'use_bow', 'mine_wood', 'play_one_minute', 'walk_one_cm')
ORDER BY ad.name, at.tier;

-- Expected results:
-- Master Builder (use_dirt: 106095):
--   - Apprentice Builder (10,000): ✅ Qualifies (106095 >= 10000)
--   - Journeyman Builder (50,000): ✅ Qualifies (106095 >= 50000)
--   - Master Architect (250,000): ❌ Doesn't qualify (106095 < 250000)
--
-- Excavator (mine_ground: 98376):
--   - Digger (15,000): ✅ Qualifies (98376 >= 15000)
--   - Miner (75,000): ✅ Qualifies (98376 >= 75000)
--   - Expert Excavator (300,000): ❌ Doesn't qualify (98376 < 300000)
--
-- Monster Hunter (kill_any: 2184):
--   - Novice Slayer (100): ✅ Qualifies (2184 >= 100)
--   - Expert Slayer (1,000): ✅ Qualifies (2184 >= 1000)
--   - Legendary Hunter (5,000): ❌ Doesn't qualify (2184 < 5000)
--
-- Gladiator (damage_dealt: 255016):
--   - Brawler (1,000): ✅ Qualifies (255016 >= 1000)
--   - Warrior (10,000): ✅ Qualifies (255016 >= 10000)
--   - Warlord (100,000): ✅ Qualifies (255016 >= 100000)
--
-- Acrobat (jump: 779502):
--   - Hopper (10,000): ✅ Qualifies (779502 >= 10000)
--   - Jumper (100,000): ✅ Qualifies (779502 >= 100000)
--   - Lunar Leap (1,000,000): ❌ Doesn't qualify (779502 < 1000000)
--
-- Archer (use_bow: 56):
--   - Archer (100): ❌ Doesn't qualify (56 < 100)
--
-- Lumberjack (mine_wood: 4098):
--   - Woodcutter (100): ✅ Qualifies (4098 >= 100)
--   - Lumberjack (500): ✅ Qualifies (4098 >= 500)
--   - Forest Master (2,500): ✅ Qualifies (4098 >= 2500)
--   - Timber Baron (10,000): ❌ Doesn't qualify (4098 < 10000)
--
-- Total expected qualifying achievements: 12 