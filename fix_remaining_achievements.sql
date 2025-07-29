-- Fix the remaining broken achievement stat names
-- Run this in your Supabase SQL Editor

-- Check what's still broken
SELECT 'CURRENT BROKEN ACHIEVEMENTS:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name
FROM achievement_definitions ad
WHERE ad.stat IN ('blocks_placed_total', 'blocks_broken_total', 'mob_kills_total', 'damageDealt', 'jumps')
ORDER BY ad.name;

-- Fix the remaining ones
UPDATE achievement_definitions 
SET stat = 'use_dirt' 
WHERE id = 'master_builder' AND stat = 'blocks_placed_total';

UPDATE achievement_definitions 
SET stat = 'mine_ground' 
WHERE id = 'excavator' AND stat = 'blocks_broken_total';

UPDATE achievement_definitions 
SET stat = 'kill_any' 
WHERE id = 'monster_hunter' AND stat = 'mob_kills_total';

UPDATE achievement_definitions 
SET stat = 'damage_dealt' 
WHERE id = 'gladiator' AND stat = 'damageDealt';

UPDATE achievement_definitions 
SET stat = 'jump' 
WHERE id = 'acrobat' AND stat = 'jumps';

-- Verify the fixes
SELECT 'AFTER FIX - All achievements should now work:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name
FROM achievement_definitions ad
ORDER BY ad.name;

-- Test what the player should now qualify for
SELECT 'EXPECTED RESULTS FOR PLAYER 75c88432-a4ed-4f01-a660-b98783a0ed1b:' as status;
SELECT 
  ad.name as achievement_name,
  at.name as tier_name,
  at.threshold,
  CASE 
    WHEN ad.stat = 'use_dirt' THEN 106095
    WHEN ad.stat = 'mine_ground' THEN 98376
    WHEN ad.stat = 'kill_any' THEN 2184
    WHEN ad.stat = 'damage_dealt' THEN 255016
    WHEN ad.stat = 'jump' THEN 779502
    WHEN ad.stat = 'use_bow' THEN 56
    WHEN ad.stat = 'mine_wood' THEN 4098
    WHEN ad.stat = 'play' THEN 745
    WHEN ad.stat = 'walk' THEN 1387368
    ELSE 0
  END as player_value,
  CASE 
    WHEN ad.stat = 'use_dirt' AND 106095 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'mine_ground' AND 98376 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'kill_any' AND 2184 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'damage_dealt' AND 255016 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'jump' AND 779502 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'use_bow' AND 56 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'mine_wood' AND 4098 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'play' AND 745 >= at.threshold THEN '✅ QUALIFIES'
    WHEN ad.stat = 'walk' AND 1387368 >= at.threshold THEN '✅ QUALIFIES'
    ELSE '❌ DOES NOT QUALIFY'
  END as result
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
WHERE ad.stat IN ('use_dirt', 'mine_ground', 'kill_any', 'damage_dealt', 'jump', 'use_bow', 'mine_wood', 'play', 'walk')
ORDER BY ad.name, at.tier; 