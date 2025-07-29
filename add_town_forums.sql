-- Add town forum categories for North Sea League towns
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

-- Get all towns in North Sea League and create forum categories for them
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
  '#059669', -- North Sea League color
  10, -- Higher order index to appear after nation forums
  false,
  'North_Sea_League',
  t.name
FROM towns t
WHERE t.nation_name = 'North_Sea_League'
  AND t.name IS NOT NULL
ON CONFLICT (slug) DO NOTHING; 