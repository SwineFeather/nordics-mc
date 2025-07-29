-- Add town forum categories for all towns in all nations
-- Run this directly in your database

-- First, make sure the forum_categories table has the required columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'nation_name') THEN
        ALTER TABLE forum_categories ADD COLUMN nation_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'town_name') THEN
        ALTER TABLE forum_categories ADD COLUMN town_name TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_name ON forum_categories(nation_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_town_name ON forum_categories(town_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_town ON forum_categories(nation_name, town_name);

-- Get all towns in all nations and create forum categories for them
INSERT INTO forum_categories (
  name, 
  description, 
  slug, 
  icon, 
  color, 
  order_index, 
  is_moderator_only,
  nation_name,
  town_name
)
SELECT 
  t.name || ' Forum',
  'Private forum for ' || t.name || ' residents',
  LOWER(REPLACE(t.name, ' ', '-')) || '-forum',
  'building',
  CASE 
    WHEN t.nation_name = 'Skyward Sanctum' THEN '#3b82f6'
    WHEN t.nation_name = 'North_Sea_League' THEN '#059669'
    WHEN t.nation_name = 'Kesko Corporation' THEN '#f59e0b'
    WHEN t.nation_name = 'Aqua Union' THEN '#0ea5e9'
    WHEN t.nation_name = 'Constellation' THEN '#8b5cf6'
    ELSE '#3b82f6' -- Default color
  END,
  10, -- Higher order index to appear after nation forums
  false,
  t.nation_name,
  t.name
FROM towns t
WHERE t.nation_name IS NOT NULL
  AND t.name IS NOT NULL
  AND t.nation_name != ''
ON CONFLICT (slug) DO NOTHING; 