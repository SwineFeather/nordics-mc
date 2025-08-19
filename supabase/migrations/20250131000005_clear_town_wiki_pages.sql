-- Clear all town wiki pages content
-- Migration: 20250131000005_clear_town_wiki_pages.sql

-- First, let's identify the towns category
-- We'll look for pages that are either:
-- 1. In a category with slug 'towns' 
-- 2. Have slugs that start with 'town-'
-- 3. Are in the Towns folder structure

-- Clear content for all town-related wiki pages
UPDATE wiki_pages 
SET 
  content = '',
  last_edited_at = NOW(),
  updated_at = NOW()
WHERE 
  -- Pages in towns category
  category_id IN (
    SELECT id FROM wiki_categories WHERE slug = 'towns'
  )
  OR
  -- Pages with town-related slugs
  slug LIKE 'town-%'
  OR
  slug LIKE '%-town'
  OR
  -- Pages with town names (common patterns)
  slug ~ '^[a-z]+(-[a-z]+)*$'
  OR
  -- Pages that might be town pages based on title patterns
  title IN (
    SELECT name FROM towns
  );

-- Also clear any pages that might be in a Towns subcategory
UPDATE wiki_pages 
SET 
  content = '',
  last_edited_at = NOW(),
  updated_at = NOW()
WHERE 
  category_id IN (
    SELECT id FROM wiki_categories 
    WHERE title ILIKE '%town%' 
    OR slug ILIKE '%town%'
  );

-- Log the number of pages cleared
DO $$
DECLARE
  cleared_count INTEGER;
BEGIN
  GET DIAGNOSTICS cleared_count = ROW_COUNT;
  RAISE NOTICE 'Cleared content for % town wiki pages', cleared_count;
END $$;

