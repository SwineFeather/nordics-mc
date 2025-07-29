-- Clean up duplicate forum categories and standardize naming
-- Migration: 20250128000000_cleanup_duplicate_forums.sql

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

-- Step 6: Handle slug conflicts carefully
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

-- Step 7: For remaining conflicts, add a suffix to make them unique
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

-- Step 8: Update colors based on standardized nation names
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

-- Step 9: Update town forum colors based on their nation
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

-- Create a unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_categories_unique_nation_town 
ON forum_categories (nation_name, town_name) 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL; 