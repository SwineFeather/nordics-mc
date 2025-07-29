-- IMMEDIATE FIX: Update achievement stat names to match player data
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- First, let's see the current state
SELECT 'BEFORE FIX - Current achievement definitions:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name
FROM achievement_definitions ad
ORDER BY ad.name;

-- Now apply the fixes
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
SET stat = 'play_one_minute' 
WHERE id = 'time_lord' AND stat = 'play';

UPDATE achievement_definitions 
SET stat = 'walk_one_cm' 
WHERE id = 'explorer' AND stat = 'walk';

UPDATE achievement_definitions 
SET stat = 'jump' 
WHERE id = 'acrobat' AND stat = 'jumps';

UPDATE achievement_definitions 
SET stat = 'damage_dealt' 
WHERE id = 'gladiator' AND stat = 'damageDealt';

-- Show the results
SELECT 'AFTER FIX - Updated achievement definitions:' as status;
SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name
FROM achievement_definitions ad
ORDER BY ad.name;

-- Test with the player's actual stats
SELECT 'TEST RESULTS - What the player should qualify for:' as status;
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
    ELSE '❌ DOES NOT QUALIFY'
  END as result
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
WHERE ad.stat IN ('use_dirt', 'mine_ground', 'kill_any', 'damage_dealt', 'jump', 'use_bow', 'mine_wood')
ORDER BY ad.name, at.tier; 