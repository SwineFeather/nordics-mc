-- Test achievement calculations for player 75c88432-a4ed-4f01-a660-b98783a0ed1b

-- First, let's check what achievements this player should qualify for based on their stats:
-- Blocks Placed: 106095 (should qualify for Master Builder achievements)
-- Blocks Broken: 98376 (should qualify for Excavator achievements)  
-- Mob Kills: 2184 (should qualify for Monster Hunter achievements)

-- Check current unlocked achievements
SELECT 
  ua.player_uuid,
  ad.name as achievement_name,
  at.name as tier_name,
  at.threshold,
  ua.is_claimed,
  ua.claimed_at
FROM unlocked_achievements ua
JOIN achievement_tiers at ON ua.tier_id = at.id
JOIN achievement_definitions ad ON at.achievement_id = ad.id
WHERE ua.player_uuid = '75c88432-a4ed-4f01-a660-b98783a0ed1b'
ORDER BY ad.name, at.tier;

-- Check what achievements should be created based on stats:
-- Master Builder achievements (blocks_placed_total = 106095):
-- - Apprentice Builder: 10,000 ✓ (qualifies)
-- - Journeyman Builder: 50,000 ✓ (qualifies)
-- - Master Architect: 250,000 ✗ (doesn't qualify)
-- - World Shaper: 1,000,000 ✗ (doesn't qualify)
-- - Architect: 500,000 ✗ (doesn't qualify)

-- Excavator achievements (blocks_broken_total = 98376):
-- - Digger: 15,000 ✓ (qualifies)
-- - Miner: 75,000 ✓ (qualifies)
-- - Expert Excavator: 300,000 ✗ (doesn't qualify)
-- - Earth Mover: 1,500,000 ✗ (doesn't qualify)
-- - Terraformer: 500,000 ✗ (doesn't qualify)

-- Monster Hunter achievements (mob_kills_total = 2184):
-- - Novice Slayer: 100 ✓ (qualifies)
-- - Expert Slayer: 1,000 ✓ (qualifies)
-- - Legendary Hunter: 5,000 ✗ (doesn't qualify)
-- - Combat Expert: 10,000 ✗ (doesn't qualify)

-- Expected total: 6 achievements should be created

-- Test the calculate_player_achievements function with sample stats
SELECT public.calculate_player_achievements(
  '75c88432-a4ed-4f01-a660-b98783a0ed1b',
  '{
    "use_dirt": 106095,
    "mine_ground": 98376,
    "kill_any": 2184,
    "walk_one_cm": 0,
    "play_one_minute": 0,
    "mine_diamond_ore": 0,
    "use_netherite_sword": 0,
    "damageDealt": 0,
    "balance": 0,
    "monument_builds": 0,
    "use_fishing_rod": 0,
    "jumps": 0,
    "use_bow": 0,
    "mine_wood": 0
  }'::jsonb
);

-- Check if achievements were created
SELECT 
  ua.player_uuid,
  ad.name as achievement_name,
  at.name as tier_name,
  at.threshold,
  ua.is_claimed,
  ua.claimed_at
FROM unlocked_achievements ua
JOIN achievement_tiers at ON ua.tier_id = at.id
JOIN achievement_definitions ad ON at.achievement_id = ad.id
WHERE ua.player_uuid = '75c88432-a4ed-4f01-a660-b98783a0ed1b'
ORDER BY ad.name, at.tier;

-- Count total unlocked achievements for this player
SELECT COUNT(*) as total_unlocked_achievements
FROM unlocked_achievements 
WHERE player_uuid = '75c88432-a4ed-4f01-a660-b98783a0ed1b';

-- Count unclaimed achievements for this player
SELECT COUNT(*) as unclaimed_achievements
FROM unlocked_achievements 
WHERE player_uuid = '75c88432-a4ed-4f01-a660-b98783a0ed1b' 
AND (is_claimed = false OR is_claimed IS NULL); 