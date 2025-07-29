-- Test script to verify achievement system is working correctly

-- 1. Check if achievement definitions exist
SELECT 'Achievement Definitions:' as test_type, COUNT(*) as count FROM public.achievement_definitions;

-- 2. Check if achievement tiers exist
SELECT 'Achievement Tiers:' as test_type, COUNT(*) as count FROM public.achievement_tiers;

-- 3. Check if level definitions exist
SELECT 'Level Definitions:' as test_type, COUNT(*) as count FROM public.level_definitions;

-- 4. Check if players exist
SELECT 'Players:' as test_type, COUNT(*) as count FROM public.players;

-- 5. Check if any unlocked achievements exist
SELECT 'Unlocked Achievements:' as test_type, COUNT(*) as count FROM public.unlocked_achievements;

-- 6. Test the get_claimable_achievements function for a specific player
-- Replace '00d533d9-d4c1-4ba3-8648-3e0cfe04e4a4' with an actual player UUID
SELECT 'Claimable Achievements for Player:' as test_type, 
       COUNT(*) as total_claimable,
       COUNT(*) FILTER (WHERE is_claimable = true) as can_claim
FROM public.get_claimable_achievements('00d533d9-d4c1-4ba3-8648-3e0cfe04e4a4');

-- 7. Show detailed claimable achievements for the test player
SELECT 
  achievement_name,
  tier_name,
  current_value,
  threshold,
  is_claimable,
  points
FROM public.get_claimable_achievements('00d533d9-d4c1-4ba3-8648-3e0cfe04e4a4')
WHERE is_claimable = true
ORDER BY achievement_name, tier_number;

-- 8. Check what players exist in the database
SELECT 
  uuid::text as player_uuid,
  name as player_name,
  level,
  total_xp,
  last_seen
FROM public.players
ORDER BY last_seen DESC
LIMIT 10;

-- 9. Test the debug functions
SELECT 'Debug Player Info:' as test_type, 
       COUNT(*) as player_count
FROM public.debug_get_player_info('00d533d9-d4c1-4ba3-8648-3e0cfe04e4a4');

-- 10. Show achievement calculations (placeholder values for now)
SELECT 
  achievement_name,
  tier_name,
  stat_name,
  current_value,
  threshold,
  qualifies,
  points
FROM public.debug_test_achievement_calculations('00d533d9-d4c1-4ba3-8648-3e0cfe04e4a4')
ORDER BY achievement_name, tier_name; 