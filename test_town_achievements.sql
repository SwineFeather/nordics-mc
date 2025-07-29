-- Test script to check and fix town achievements system

-- 1. Add missing columns to towns table if they don't exist
ALTER TABLE public.towns 
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_xp BIGINT NOT NULL DEFAULT 0;

-- 2. Check if town achievement tables exist
SELECT 'town_achievement_definitions' as table_name, COUNT(*) as count FROM public.town_achievement_definitions
UNION ALL
SELECT 'town_achievement_tiers' as table_name, COUNT(*) as count FROM public.town_achievement_tiers
UNION ALL
SELECT 'town_unlocked_achievements' as table_name, COUNT(*) as count FROM public.town_unlocked_achievements;

-- 3. Check if towns table has the required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND column_name IN ('level', 'total_xp', 'population', 'nation_id', 'is_independent', 'created_at');

-- 4. Check a sample town
SELECT id, name, population, nation_id, is_independent, created_at, level, total_xp 
FROM public.towns 
LIMIT 3;

-- 5. Check if achievement definitions exist
SELECT * FROM public.town_achievement_definitions LIMIT 5;

-- 6. Check if achievement tiers exist
SELECT * FROM public.town_achievement_tiers LIMIT 5; 