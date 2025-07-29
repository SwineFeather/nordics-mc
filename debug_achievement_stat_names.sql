-- Debug: Check what stat names are used in achievement definitions

SELECT 
  ad.id as achievement_id,
  ad.name as achievement_name,
  ad.stat as stat_name,
  COUNT(at.id) as tier_count
FROM achievement_definitions ad
LEFT JOIN achievement_tiers at ON ad.id = at.achievement_id
GROUP BY ad.id, ad.name, ad.stat
ORDER BY ad.name;

-- Check specific achievements that should work with the player's stats
SELECT 
  ad.name as achievement_name,
  ad.stat as stat_name,
  at.name as tier_name,
  at.threshold,
  at.points
FROM achievement_definitions ad
JOIN achievement_tiers at ON ad.id = at.achievement_id
WHERE ad.stat IN ('blocks_placed_total', 'blocks_broken_total', 'mob_kills_total', 'use_dirt', 'mine_ground', 'kill_any')
ORDER BY ad.name, at.tier;

-- Check what stats the player actually has (from the debug output)
-- Based on the debug panel, the player has:
-- - use_dirt: 106095 (blocks placed)
-- - mine_ground: 98376 (blocks broken)  
-- - kill_any: 2184 (mob kills)

-- The issue is that achievement definitions use:
-- - blocks_placed_total (but player has use_dirt)
-- - blocks_broken_total (but player has mine_ground)
-- - mob_kills_total (but player has kill_any)

-- We need to either:
-- 1. Update achievement definitions to use the actual stat names, OR
-- 2. Update the calculation logic to map these correctly 