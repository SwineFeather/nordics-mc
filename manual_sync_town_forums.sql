-- Manual town forum sync script
-- Run this directly in your database to sync town forums immediately

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

-- Show current towns that need forums
SELECT 
    t.name as town_name,
    t.nation_name,
    CASE WHEN fc.id IS NULL THEN 'NEEDS FORUM' ELSE 'FORUM EXISTS' END as status
FROM towns t
LEFT JOIN forum_categories fc ON t.name = fc.town_name AND fc.is_archived = false
WHERE t.nation_name IS NOT NULL
ORDER BY t.nation_name, t.name;

-- Create forums for towns that don't have them
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

-- Show results
SELECT 
    'Created forums for:' as action,
    COUNT(*) as count
FROM forum_categories 
WHERE town_name IS NOT NULL 
AND created_at >= NOW() - INTERVAL '1 minute';

-- Show all town forums
SELECT 
    name,
    nation_name,
    town_name,
    is_archived,
    created_at
FROM forum_categories 
WHERE town_name IS NOT NULL
ORDER BY nation_name, town_name; 