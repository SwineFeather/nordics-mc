-- Add nation forum categories
-- Migration: 20250127000000_add_nation_forum_categories.sql

-- First, add the missing columns to forum_categories table
ALTER TABLE forum_categories 
ADD COLUMN IF NOT EXISTS nation_name TEXT;

ALTER TABLE forum_categories 
ADD COLUMN IF NOT EXISTS town_name TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_name ON forum_categories(nation_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_town_name ON forum_categories(town_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_town ON forum_categories(nation_name, town_name);

-- Create nation forum categories for each nation
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
) VALUES 
  (
    'Skyward Sanctum Forum',
    'Private forum for Skyward Sanctum members',
    'skyward-sanctum-forum',
    'crown',
    '#3b82f6',
    5,
    false,
    'Skyward Sanctum',
    NULL
  ),
  (
    'North Sea League Forum',
    'Private forum for North Sea League members',
    'north-sea-league-forum',
    'anchor',
    '#059669',
    5,
    false,
    'North_Sea_League',
    NULL
  ),
  (
    'Kesko Corporation Forum',
    'Private forum for Kesko Corporation members',
    'kesko-corporation-forum',
    'building',
    '#f59e0b',
    5,
    false,
    'Kesko Corporation',
    NULL
  ),
  (
    'Aqua Union Forum',
    'Private forum for Aqua Union members',
    'aqua-union-forum',
    'droplets',
    '#0ea5e9',
    5,
    false,
    'Aqua Union',
    NULL
  ),
  (
    'Constellation Forum',
    'Private forum for Constellation members',
    'constellation-forum',
    'star',
    '#8b5cf6',
    5,
    false,
    'Constellation',
    NULL
  )
ON CONFLICT (slug) DO NOTHING; 