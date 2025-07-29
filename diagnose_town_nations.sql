-- Diagnostic script to check town nation status and achievements

-- First, let's see what's actually in the nation_name field
SELECT 
  'Town Nation Data' as info,
  name as town_name,
  nation_name,
  CASE 
    WHEN nation_name IS NULL THEN 'NULL'
    WHEN nation_name = '' THEN 'EMPTY STRING'
    WHEN nation_name = ' ' THEN 'SPACE ONLY'
    ELSE 'HAS NATION: ' || nation_name
  END as nation_status,
  LENGTH(nation_name) as name_length
FROM public.towns
ORDER BY name;

-- Check what achievements are currently unlocked
SELECT 
  'Current Achievements' as info,
  t.name as town_name,
  t.nation_name,
  tad.name as achievement_name,
  tat.name as tier_name,
  tua.is_claimed
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
LEFT JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
WHERE tad.id IN ('nation_member', 'independent')
ORDER BY t.name, tad.name;

-- Check if there are any towns that should be in nations but aren't getting the right achievement
SELECT 
  'Towns That Should Be In Nations' as info,
  t.name as town_name,
  t.nation_name,
  CASE 
    WHEN tua.tier_id IS NOT NULL THEN 'Has Achievement'
    ELSE 'Missing Achievement'
  END as achievement_status,
  tad.name as achievement_name
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
LEFT JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
WHERE (t.nation_name IS NOT NULL AND t.nation_name != '' AND t.nation_name != ' ')
  AND (tad.id IS NULL OR tad.id != 'nation_member')
ORDER BY t.name;

-- Check if there are any towns that should be independent but aren't getting the right achievement
SELECT 
  'Towns That Should Be Independent' as info,
  t.name as town_name,
  t.nation_name,
  CASE 
    WHEN tua.tier_id IS NOT NULL THEN 'Has Achievement'
    ELSE 'Missing Achievement'
  END as achievement_status,
  tad.name as achievement_name
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
LEFT JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
WHERE (t.nation_name IS NULL OR t.nation_name = '' OR t.nation_name = ' ')
  AND (tad.id IS NULL OR tad.id != 'independent')
ORDER BY t.name;

-- Clear all existing achievements and re-run sync
DELETE FROM public.town_unlocked_achievements;

-- Run the sync function
SELECT public.sync_all_town_achievements();

-- Check results after sync
SELECT 
  'Results After Sync' as info,
  t.name as town_name,
  t.nation_name,
  CASE 
    WHEN t.nation_name IS NOT NULL AND t.nation_name != '' AND t.nation_name != ' ' THEN 'Should be in nation'
    ELSE 'Should be independent'
  END as expected_status,
  tad.name as actual_achievement,
  tat.name as tier_name
FROM public.towns t
LEFT JOIN public.town_unlocked_achievements tua ON tua.town_id = t.id::TEXT
LEFT JOIN public.town_achievement_tiers tat ON tua.tier_id = tat.id
LEFT JOIN public.town_achievement_definitions tad ON tat.achievement_id = tad.id
WHERE tad.id IN ('nation_member', 'independent')
ORDER BY t.name; 