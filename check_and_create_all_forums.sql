-- Check and create forums for all nations and towns
-- Run this to ensure all nations and towns have their forums

-- First, make sure all required columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'nation_name') THEN
        ALTER TABLE forum_categories ADD COLUMN nation_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'town_name') THEN
        ALTER TABLE forum_categories ADD COLUMN town_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'is_archived') THEN
        ALTER TABLE forum_categories ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'updated_at') THEN
        ALTER TABLE forum_categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_name ON forum_categories(nation_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_town_name ON forum_categories(town_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_town ON forum_categories(nation_name, town_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_is_archived ON forum_categories(is_archived);
CREATE INDEX IF NOT EXISTS idx_forum_categories_updated_at ON forum_categories(updated_at);

-- Show current status of nation forums
SELECT 
    'NATION FORUMS STATUS' as section,
    n.name as nation_name,
    CASE WHEN fc.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as forum_status
FROM nations n
LEFT JOIN forum_categories fc ON n.name = fc.nation_name AND fc.town_name IS NULL AND fc.is_archived = false
ORDER BY n.name;

-- Show current status of town forums
SELECT 
    'TOWN FORUMS STATUS' as section,
    t.name as town_name,
    t.nation_name,
    CASE WHEN fc.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as forum_status
FROM towns t
LEFT JOIN forum_categories fc ON t.name = fc.town_name AND fc.is_archived = false
WHERE t.nation_name IS NOT NULL
ORDER BY t.nation_name, t.name;

-- Create nation forums for missing nations
INSERT INTO forum_categories (
    name, 
    description, 
    slug, 
    icon, 
    color, 
    order_index, 
    is_moderator_only,
    nation_name,
    town_name,
    is_archived
) 
SELECT 
    n.name || ' Forum',
    'Private forum for ' || n.name || ' members',
    LOWER(REPLACE(n.name, ' ', '-')) || '-forum',
    'crown',
    CASE n.name
        WHEN 'Skyward Sanctum' THEN '#3b82f6'
        WHEN 'North_Sea_League' THEN '#059669'
        WHEN 'Kesko Corporation' THEN '#f59e0b'
        WHEN 'Aqua Union' THEN '#0ea5e9'
        WHEN 'Constellation' THEN '#8b5cf6'
        ELSE '#3b82f6'
    END,
    5,
    false,
    n.name,
    NULL,
    false
FROM nations n
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories fc 
    WHERE fc.nation_name = n.name 
    AND fc.town_name IS NULL
    AND fc.is_archived = false
)
ON CONFLICT (slug) DO NOTHING;

-- Create town forums for missing towns
INSERT INTO forum_categories (
    name, 
    description, 
    slug, 
    icon, 
    color, 
    order_index, 
    is_moderator_only,
    nation_name,
    town_name,
    is_archived
) 
SELECT 
    t.name || ' Forum',
    'Private forum for ' || t.name || ' residents',
    'town-' || LOWER(REPLACE(t.name, ' ', '-')),
    'image',
    CASE t.nation_name
        WHEN 'Skyward Sanctum' THEN '#3b82f6'
        WHEN 'North_Sea_League' THEN '#059669'
        WHEN 'Kesko Corporation' THEN '#f59e0b'
        WHEN 'Aqua Union' THEN '#0ea5e9'
        WHEN 'Constellation' THEN '#8b5cf6'
        ELSE '#3b82f6'
    END,
    6,
    false,
    t.nation_name,
    t.name,
    false
FROM towns t
WHERE t.nation_name IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM forum_categories fc 
    WHERE fc.town_name = t.name 
    AND fc.is_archived = false
)
ON CONFLICT (slug) DO NOTHING;

-- Show final results
SELECT 
    'FINAL NATION FORUMS' as section,
    n.name as nation_name,
    CASE WHEN fc.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as forum_status
FROM nations n
LEFT JOIN forum_categories fc ON n.name = fc.nation_name AND fc.town_name IS NULL AND fc.is_archived = false
ORDER BY n.name;

SELECT 
    'FINAL TOWN FORUMS' as section,
    t.name as town_name,
    t.nation_name,
    CASE WHEN fc.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as forum_status
FROM towns t
LEFT JOIN forum_categories fc ON t.name = fc.town_name AND fc.is_archived = false
WHERE t.nation_name IS NOT NULL
ORDER BY t.nation_name, t.name;

-- Summary
SELECT 
    'SUMMARY' as section,
    COUNT(DISTINCT n.name) as total_nations,
    COUNT(DISTINCT CASE WHEN fc_nation.id IS NOT NULL THEN n.name END) as nations_with_forums,
    COUNT(DISTINCT t.name) as total_towns,
    COUNT(DISTINCT CASE WHEN fc_town.id IS NOT NULL THEN t.name END) as towns_with_forums
FROM nations n
LEFT JOIN forum_categories fc_nation ON n.name = fc_nation.nation_name AND fc_nation.town_name IS NULL AND fc_nation.is_archived = false
LEFT JOIN towns t ON n.name = t.nation_name
LEFT JOIN forum_categories fc_town ON t.name = fc_town.town_name AND fc_town.is_archived = false; 