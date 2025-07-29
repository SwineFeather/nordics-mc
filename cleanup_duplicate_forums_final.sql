-- Clean up duplicate forum categories and standardize naming
-- Run this directly in your database

-- First, let's see what duplicates we have
SELECT 
  'CURRENT DUPLICATES' as section,
  name, 
  nation_name, 
  town_name, 
  slug,
  COUNT(*) as count
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY name, nation_name, town_name, slug
HAVING COUNT(*) > 1
ORDER BY name, nation_name, town_name;

-- Show all nation and town forums before cleanup
SELECT 
  'ALL FORUMS BEFORE CLEANUP' as section,
  id,
  name, 
  nation_name, 
  town_name, 
  slug,
  created_at
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
ORDER BY name, nation_name, town_name, created_at;

-- Step 1: Remove duplicates, keeping only the most recent occurrence
DELETE FROM forum_categories 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY 
               CASE 
                 WHEN town_name IS NOT NULL THEN town_name
                 ELSE nation_name
               END,
               CASE 
                 WHEN town_name IS NOT NULL THEN 'town'
                 ELSE 'nation'
               END
             ORDER BY created_at DESC
           ) as rn
    FROM forum_categories
    WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
  ) t
  WHERE t.rn > 1
);

-- Step 2: Standardize nation names (remove underscores, use spaces)
UPDATE forum_categories 
SET nation_name = REPLACE(nation_name, '_', ' ')
WHERE nation_name LIKE '%_%';

-- Step 3: Update forum names to match standardized nation names
UPDATE forum_categories 
SET name = nation_name || ' Forum'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND name != (nation_name || ' Forum');

-- Step 4: Update descriptions to match standardized nation names
UPDATE forum_categories 
SET description = 'Private forum for ' || nation_name || ' members'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND description != ('Private forum for ' || nation_name || ' members');

-- Step 5: Update town forum descriptions to remove underscores
UPDATE forum_categories 
SET description = 'Private forum for ' || town_name || ' residents'
WHERE town_name IS NOT NULL
  AND description != ('Private forum for ' || town_name || ' residents');

-- Step 6: Update slugs to be consistent
UPDATE forum_categories 
SET slug = LOWER(REPLACE(nation_name, ' ', '-')) || '-forum'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND slug != (LOWER(REPLACE(nation_name, ' ', '-')) || '-forum');

UPDATE forum_categories 
SET slug = 'town-' || LOWER(REPLACE(town_name, ' ', '-'))
WHERE town_name IS NOT NULL
  AND slug != ('town-' || LOWER(REPLACE(town_name, ' ', '-')));

-- Step 7: Update colors based on standardized nation names
UPDATE forum_categories 
SET color = CASE 
  WHEN nation_name = 'Skyward Sanctum' THEN '#3b82f6'
  WHEN nation_name = 'North Sea League' THEN '#059669'
  WHEN nation_name = 'Kesko Corporation' THEN '#f59e0b'
  WHEN nation_name = 'Aqua Union' THEN '#0ea5e9'
  WHEN nation_name = 'Constellation' THEN '#8b5cf6'
  ELSE color
END
WHERE nation_name IS NOT NULL;

-- Step 8: Update town forum colors based on their nation
UPDATE forum_categories 
SET color = CASE 
  WHEN fc.nation_name = 'Skyward Sanctum' THEN '#3b82f6'
  WHEN fc.nation_name = 'North Sea League' THEN '#059669'
  WHEN fc.nation_name = 'Kesko Corporation' THEN '#f59e0b'
  WHEN fc.nation_name = 'Aqua Union' THEN '#0ea5e9'
  WHEN fc.nation_name = 'Constellation' THEN '#8b5cf6'
  ELSE fc.color
END
FROM forum_categories fc
WHERE forum_categories.town_name IS NOT NULL
  AND forum_categories.nation_name = fc.nation_name
  AND fc.town_name IS NULL;

-- Show results after cleanup
SELECT 
  'FORUMS AFTER CLEANUP' as section,
  name, 
  nation_name, 
  town_name, 
  slug,
  color,
  created_at
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
ORDER BY 
  CASE WHEN town_name IS NULL THEN 0 ELSE 1 END,
  nation_name, 
  town_name;

-- Verify no duplicates remain
SELECT 
  'DUPLICATE CHECK' as section,
  name, 
  nation_name, 
  town_name, 
  COUNT(*) as count
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY name, nation_name, town_name 
HAVING COUNT(*) > 1;

-- Summary
SELECT 
  'SUMMARY' as section,
  COUNT(*) as total_forums,
  COUNT(CASE WHEN town_name IS NULL THEN 1 END) as nation_forums,
  COUNT(CASE WHEN town_name IS NOT NULL THEN 1 END) as town_forums,
  COUNT(DISTINCT nation_name) as unique_nations
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL; 