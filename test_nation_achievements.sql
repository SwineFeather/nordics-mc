-- Test script to verify nation member achievements are working correctly
-- UPDATED: Uses nation_name instead of nation_id

-- First, let's see what towns we have and their nation status
SELECT 
  'Town Status Summary' as info,
  COUNT(*) as total_towns,
  SUM(CASE WHEN nation_name IS NOT NULL AND nation_name != '' THEN 1 ELSE 0 END) as nation_towns,
  SUM(CASE WHEN nation_name IS NULL OR nation_name = '' THEN 1 ELSE 0 END) as independent_towns
FROM public.towns;

-- Show towns with their nation status
SELECT 
  name as town_name,
  nation_name,
  CASE WHEN nation_name IS NOT NULL AND nation_name != '' THEN 'In Nation' ELSE 'Independent' END as status
FROM public.towns
ORDER BY name;

-- Check current unlocked achievements
SELECT 
  'Current Unlocked Achievements' as info,
  t.name as town_name,
  tad.name as achievement_name,
  tat.name as tier_name,
  tua.is_claimed
FROM public.town_unlocked_achievements tua
JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
JOIN public.towns t ON tua.town_id = t.id::TEXT
WHERE tad.id = 'nation_member'
ORDER BY t.name;

-- Run the sync function to ensure all achievements are up to date
SELECT public.sync_all_town_achievements();

-- Check achievements after sync
SELECT 
  'Achievements After Sync' as info,
  t.name as town_name,
  t.nation_name,
  CASE WHEN t.nation_name IS NOT NULL AND t.nation_name != '' THEN 'Should have Alliance Forged' ELSE 'Should have Independent Spirit' END as expected_achievement,
  tad.name as actual_achievement,
  tat.name as tier_name
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
LEFT JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
WHERE tad.id IN ('nation_member', 'independent')
ORDER BY t.name;

-- Summary of nation member achievements
SELECT 
  'Nation Member Achievement Summary' as info,
  COUNT(*) as total_towns_in_nations,
  SUM(CASE WHEN tua.tier_id IS NOT NULL THEN 1 ELSE 0 END) as towns_with_alliance_forged
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
WHERE t.nation_name IS NOT NULL AND t.nation_name != ''
  AND tat.achievement_id = 'nation_member';

-- Summary of independent achievements  
SELECT 
  'Independent Achievement Summary' as info,
  COUNT(*) as total_independent_towns,
  SUM(CASE WHEN tua.tier_id IS NOT NULL THEN 1 ELSE 0 END) as towns_with_independent_spirit
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
WHERE (t.nation_name IS NULL OR t.nation_name = '')
  AND tat.achievement_id = 'independent'; 