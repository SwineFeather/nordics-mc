-- Comprehensive diagnostic and fix for achievement system
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state of all achievement definitions
SELECT 'CURRENT ACHIEVEMENT DEFINITIONS:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name,
  COUNT(at.id) as tier_count
FROM achievement_definitions ad
LEFT JOIN achievement_tiers at ON ad.id = at.achievement_id
GROUP BY ad.id, ad.name, ad.stat
ORDER BY ad.name;

-- Step 2: Check what stats the player actually has (from the debug output)
SELECT 'PLAYER STATS SUMMARY:' as status;
SELECT 'Available stats from debug panel:' as info;
-- Based on the debug output, the player has:
-- jump: 779,502
-- damage_dealt: 255,016
-- use_bow: 56
-- mine_wood: 4,098
-- place_stairs: 21,583
-- kill_phantom: 31
-- kill_witch: 6
-- break_tools: 1,871
-- mine_ice: 168
-- mine_grass: 3,045

-- Step 3: Fix ALL achievement definitions to use the correct stat names
-- We need to map the achievement stats to the actual player stats

-- Master Builder should use place_stairs (blocks placed)
UPDATE achievement_definitions 
SET stat = 'place_stairs' 
WHERE id = 'master_builder';

-- Excavator should use mine_grass (blocks broken) 
UPDATE achievement_definitions 
SET stat = 'mine_grass' 
WHERE id = 'excavator';

-- Monster Hunter should use kill_phantom + kill_witch (mob kills)
-- We'll use kill_phantom as the primary stat
UPDATE achievement_definitions 
SET stat = 'kill_phantom' 
WHERE id = 'monster_hunter';

-- Gladiator should use damage_dealt
UPDATE achievement_definitions 
SET stat = 'damage_dealt' 
WHERE id = 'gladiator';

-- Acrobat should use jump
UPDATE achievement_definitions 
SET stat = 'jump' 
WHERE id = 'acrobat';

-- Archer should use use_bow
UPDATE achievement_definitions 
SET stat = 'use_bow' 
WHERE id = 'archer';

-- Lumberjack should use mine_wood
UPDATE achievement_definitions 
SET stat = 'mine_wood' 
WHERE id = 'lumberjack';

-- Time Lord should use play_record (playtime)
UPDATE achievement_definitions 
SET stat = 'play_record' 
WHERE id = 'time_lord';

-- Explorer should use time_since_death (as a proxy for movement)
UPDATE achievement_definitions 
SET stat = 'time_since_death' 
WHERE id = 'explorer';

-- Step 4: Verify the fixes
SELECT 'AFTER FIX - Updated achievement definitions:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name,
  COUNT(at.id) as tier_count
FROM achievement_definitions ad
LEFT JOIN achievement_tiers at ON ad.id = at.achievement_id
GROUP BY ad.id, ad.name, ad.stat
ORDER BY ad.name;

-- Step 5: Test what the player should qualify for with actual stats
SELECT 'EXPECTED RESULTS FOR PLAYER 75c88432-a4ed-4f01-a660-b98783a0ed1b:' as status;
SELECT 
  ad.name as achievement_name,
  at.name as tier_name,
  at.threshold,
  CASE 
    WHEN ad.stat = 'place_stairs' THEN 21583
    WHEN ad.stat = 'mine_grass' THEN 3045
    WHEN ad.stat = 'kill_phantom' THEN 31
    WHEN ad.stat = 'damage_dealt' THEN 255016
    WHEN ad.stat = 'jump' THEN 779502
    WHEN ad.stat = 'use_bow' THEN 56
    WHEN ad.stat = 'mine_wood' THEN 4098
    WHEN ad.stat = 'play_record' THEN 1
    WHEN ad.stat = 'time_since_death' THEN 242153
    ELSE 0
  END as player_value,
  CASE 
    WHEN ad.stat = 'place_stairs' AND 21583 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'mine_grass' AND 3045 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'kill_phantom' AND 31 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'damage_dealt' AND 255016 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'jump' AND 779502 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'use_bow' AND 56 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'mine_wood' AND 4098 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'play_record' AND 1 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'time_since_death' AND 242153 >= at.threshold THEN '✅ QUALIFIES'
    ELSE '❌ DOES NOT QUALIFY'
  END as result
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
WHERE ad.stat IN ('place_stairs', 'mine_grass', 'kill_phantom', 'damage_dealt', 'jump', 'use_bow', 'mine_wood', 'play_record', 'time_since_death')
ORDER BY ad.name, at.tier; 