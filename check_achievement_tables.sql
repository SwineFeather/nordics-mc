-- Check the structure of town achievement tables
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'town_unlocked_achievements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'town_achievement_tiers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'town_achievement_definitions' 
AND table_schema = 'public'
ORDER BY ordinal_position; 