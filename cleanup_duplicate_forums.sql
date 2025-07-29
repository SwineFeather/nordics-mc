-- Clean up duplicate forum categories
-- Run this directly in your database

-- First, let's see what duplicates we have
SELECT 
  name, 
  nation_name, 
  town_name, 
  COUNT(*) as count
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY name, nation_name, town_name 
HAVING COUNT(*) > 1;

-- Remove duplicates, keeping only the first occurrence
DELETE FROM forum_categories 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, nation_name, town_name 
             ORDER BY created_at
           ) as rn
    FROM forum_categories
    WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
  ) t
  WHERE t.rn > 1
);

-- Verify the cleanup
SELECT 
  name, 
  nation_name, 
  town_name, 
  COUNT(*) as count
FROM forum_categories 
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL
GROUP BY name, nation_name, town_name 
HAVING COUNT(*) > 1; 