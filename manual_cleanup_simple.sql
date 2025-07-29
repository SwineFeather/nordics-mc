-- Simple manual cleanup - run these commands one by one
-- Copy and paste each section into your SQL editor

-- ========================================
-- 1. First, let's see what we have
-- ========================================

SELECT 
  id,
  name, 
  nation_name, 
  town_name, 
  slug,
  created_at
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
ORDER BY name, nation_name, town_name;

-- ========================================
-- 2. Remove duplicates (keep most recent)
-- ========================================

DELETE FROM forum_categories 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY 
               CASE 
                 WHEN town_name IS NOT NULL THEN town_name
                 ELSE nation_name
               END
             ORDER BY created_at DESC
           ) as rn
    FROM forum_categories
    WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
  ) t
  WHERE t.rn > 1
);

-- ========================================
-- 3. Fix nation names (remove underscores)
-- ========================================

UPDATE forum_categories 
SET nation_name = REPLACE(nation_name, '_', ' ')
WHERE nation_name LIKE '%_%';

-- ========================================
-- 4. Update names and descriptions
-- ========================================

UPDATE forum_categories 
SET name = nation_name || ' Forum'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL;

UPDATE forum_categories 
SET description = 'Private forum for ' || nation_name || ' members'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL;

UPDATE forum_categories 
SET description = 'Private forum for ' || town_name || ' residents'
WHERE town_name IS NOT NULL;

-- ========================================
-- 5. Update colors
-- ========================================

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

-- ========================================
-- 6. Fix slugs one by one (run these individually)
-- ========================================

-- For Skyward Sanctum
UPDATE forum_categories 
SET slug = 'skyward-sanctum-forum'
WHERE nation_name = 'Skyward Sanctum' 
  AND town_name IS NULL;

-- For North Sea League
UPDATE forum_categories 
SET slug = 'north-sea-league-forum'
WHERE nation_name = 'North Sea League' 
  AND town_name IS NULL;

-- For Kesko Corporation
UPDATE forum_categories 
SET slug = 'kesko-corporation-forum'
WHERE nation_name = 'Kesko Corporation' 
  AND town_name IS NULL;

-- For Aqua Union
UPDATE forum_categories 
SET slug = 'aqua-union-forum'
WHERE nation_name = 'Aqua Union' 
  AND town_name IS NULL;

-- For Constellation
UPDATE forum_categories 
SET slug = 'constellation-forum'
WHERE nation_name = 'Constellation' 
  AND town_name IS NULL;

-- ========================================
-- 7. Check final results
-- ========================================

SELECT 
  name, 
  nation_name, 
  town_name, 
  slug,
  color
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
ORDER BY 
  CASE WHEN town_name IS NULL THEN 0 ELSE 1 END,
  nation_name, 
  town_name; 