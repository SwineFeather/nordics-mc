-- Manual fix for achievement stat names to match player data
-- Run this directly in your Supabase SQL editor

-- First, let's see what the current achievement definitions look like
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name,
  COUNT(at.id) as tier_count
FROM achievement_definitions ad
LEFT JOIN achievement_tiers at ON ad.id = at.achievement_id
GROUP BY ad.id, ad.name, ad.stat
ORDER BY ad.name;

-- Now update the achievement definitions to use the correct stat names
-- Based on the player data, we need to use the actual stat names, not aggregated ones

-- Update Master Builder achievements to use use_dirt (blocks placed)
UPDATE achievement_definitions 
SET stat = 'use_dirt' 
WHERE id = 'master_builder' AND stat = 'blocks_placed_total';

-- Update Excavator achievements to use mine_ground (blocks broken)
UPDATE achievement_definitions 
SET stat = 'mine_ground' 
WHERE id = 'excavator' AND stat = 'blocks_broken_total';

-- Update Monster Hunter achievements to use kill_any (mob kills)
UPDATE achievement_definitions 
SET stat = 'kill_any' 
WHERE id = 'monster_hunter' AND stat = 'mob_kills_total';

-- Update Time Lord achievements to use play_one_minute (playtime)
UPDATE achievement_definitions 
SET stat = 'play_one_minute' 
WHERE id = 'time_lord' AND stat = 'play';

-- Update Explorer achievements to use walk_one_cm (walking distance)
UPDATE achievement_definitions 
SET stat = 'walk_one_cm' 
WHERE id = 'explorer' AND stat = 'walk';

-- Update Acrobat achievements to use jump (jumps)
UPDATE achievement_definitions 
SET stat = 'jump' 
WHERE id = 'acrobat' AND stat = 'jumps';

-- Update Gladiator achievements to use damage_dealt (damage dealt)
UPDATE achievement_definitions 
SET stat = 'damage_dealt' 
WHERE id = 'gladiator' AND stat = 'damageDealt';

-- Verify the updates
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name,
  COUNT(at.id) as tier_count
FROM achievement_definitions ad
LEFT JOIN achievement_tiers at ON ad.id = at.achievement_id
GROUP BY ad.id, ad.name, ad.stat
ORDER BY ad.name;

-- Now let's test the calculation for our specific player
-- This should show the correct values now
SELECT 
  ad.name as achievement_name,
  ad.stat as stat_name,
  at.name as tier_name,
  at.threshold,
  at.tier,
  at.points
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
WHERE ad.stat IN ('use_dirt', 'mine_ground', 'kill_any', 'damage_dealt', 'jump', 'use_bow', 'mine_wood')
ORDER BY ad.name, at.tier; 