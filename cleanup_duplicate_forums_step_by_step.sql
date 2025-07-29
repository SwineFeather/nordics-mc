-- Step-by-step cleanup of duplicate forum categories
-- Run this directly in your database, one section at a time

-- ========================================
-- STEP 1: Analyze current state
-- ========================================

-- Show all current forums
SELECT 
  'CURRENT FORUMS' as section,
  id,
  name, 
  nation_name, 
  town_name, 
  slug,
  created_at
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
ORDER BY name, nation_name, town_name, created_at;

-- Show duplicates
SELECT 
  'DUPLICATES' as section,
  name, 
  nation_name, 
  town_name, 
  COUNT(*) as count
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY name, nation_name, town_name 
HAVING COUNT(*) > 1
ORDER BY name, nation_name, town_name;

-- Show slug conflicts
SELECT 
  'SLUG CONFLICTS' as section,
  slug,
  COUNT(*) as count,
  array_agg(name) as forum_names
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY slug 
HAVING COUNT(*) > 1
ORDER BY slug;

-- ========================================
-- STEP 2: Remove duplicates (keep most recent)
-- ========================================

-- First, let's see what will be deleted
SELECT 
  'FORUMS TO DELETE' as section,
  id,
  name,
  nation_name,
  town_name,
  slug,
  created_at
FROM (
  SELECT id, name, nation_name, town_name, slug, created_at,
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
ORDER BY name, nation_name, town_name;

-- Now delete the duplicates
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

-- ========================================
-- STEP 3: Standardize nation names
-- ========================================

-- Show what will be changed
SELECT 
  'NATION NAMES TO STANDARDIZE' as section,
  id,
  name,
  nation_name as current_nation_name,
  REPLACE(nation_name, '_', ' ') as new_nation_name
FROM forum_categories 
WHERE nation_name LIKE '%_%'
ORDER BY nation_name;

-- Update nation names
UPDATE forum_categories 
SET nation_name = REPLACE(nation_name, '_', ' ')
WHERE nation_name LIKE '%_%';

-- ========================================
-- STEP 4: Update forum names and descriptions
-- ========================================

-- Update forum names
UPDATE forum_categories 
SET name = nation_name || ' Forum'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND name != (nation_name || ' Forum');

-- Update descriptions
UPDATE forum_categories 
SET description = 'Private forum for ' || nation_name || ' members'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND description != ('Private forum for ' || nation_name || ' members');

UPDATE forum_categories 
SET description = 'Private forum for ' || town_name || ' residents'
WHERE town_name IS NOT NULL
  AND description != ('Private forum for ' || town_name || ' residents');

-- ========================================
-- STEP 5: Update colors
-- ========================================

-- Update nation forum colors
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

-- Update town forum colors
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

-- ========================================
-- STEP 6: Handle slug conflicts carefully
-- ========================================

-- First, let's see what the desired slugs would be
SELECT 
  'DESIRED SLUGS ANALYSIS' as section,
  id,
  name,
  current_slug,
  desired_slug,
  conflict_exists
FROM (
  SELECT 
    fc.id,
    fc.name,
    fc.slug as current_slug,
    CASE 
      WHEN fc.town_name IS NULL THEN LOWER(REPLACE(fc.nation_name, ' ', '-')) || '-forum'
      ELSE 'town-' || LOWER(REPLACE(fc.town_name, ' ', '-'))
    END as desired_slug,
    EXISTS(
      SELECT 1 FROM forum_categories fc2 
      WHERE fc2.slug = CASE 
        WHEN fc.town_name IS NULL THEN LOWER(REPLACE(fc.nation_name, ' ', '-')) || '-forum'
        ELSE 'town-' || LOWER(REPLACE(fc.town_name, ' ', '-'))
      END
      AND fc2.id != fc.id
    ) as conflict_exists
  FROM forum_categories fc
  WHERE (fc.nation_name IS NOT NULL OR fc.town_name IS NOT NULL)
    AND fc.slug != CASE 
      WHEN fc.town_name IS NULL THEN LOWER(REPLACE(fc.nation_name, ' ', '-')) || '-forum'
      ELSE 'town-' || LOWER(REPLACE(fc.town_name, ' ', '-'))
    END
) slug_analysis
ORDER BY conflict_exists DESC, name;

-- Update slugs only where there are no conflicts
UPDATE forum_categories 
SET slug = LOWER(REPLACE(nation_name, ' ', '-')) || '-forum'
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND slug != (LOWER(REPLACE(nation_name, ' ', '-')) || '-forum')
  AND NOT EXISTS (
    SELECT 1 FROM forum_categories fc2 
    WHERE fc2.slug = LOWER(REPLACE(nation_name, ' ', '-')) || '-forum'
    AND fc2.id != forum_categories.id
  );

UPDATE forum_categories 
SET slug = 'town-' || LOWER(REPLACE(town_name, ' ', '-'))
WHERE town_name IS NOT NULL
  AND slug != ('town-' || LOWER(REPLACE(town_name, ' ', '-')))
  AND NOT EXISTS (
    SELECT 1 FROM forum_categories fc2 
    WHERE fc2.slug = 'town-' || LOWER(REPLACE(town_name, ' ', '-'))
    AND fc2.id != forum_categories.id
  );

-- For remaining conflicts, add a unique suffix
UPDATE forum_categories 
SET slug = LOWER(REPLACE(nation_name, ' ', '-')) || '-forum-' || id::text
WHERE nation_name IS NOT NULL 
  AND town_name IS NULL
  AND slug != (LOWER(REPLACE(nation_name, ' ', '-')) || '-forum')
  AND slug != (LOWER(REPLACE(nation_name, ' ', '-')) || '-forum-' || id::text);

UPDATE forum_categories 
SET slug = 'town-' || LOWER(REPLACE(town_name, ' ', '-')) || '-' || id::text
WHERE town_name IS NOT NULL
  AND slug != ('town-' || LOWER(REPLACE(town_name, ' ', '-')))
  AND slug != ('town-' || LOWER(REPLACE(town_name, ' ', '-')) || '-' || id::text);

-- ========================================
-- STEP 7: Final results
-- ========================================

-- Show final results
SELECT 
  'FINAL FORUMS' as section,
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