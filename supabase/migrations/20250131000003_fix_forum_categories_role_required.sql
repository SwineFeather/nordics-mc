-- Fix missing forum categories by ensuring proper role_required field
-- Migration: 20250131000003_fix_forum_categories_role_required.sql

-- Step 1: Ensure all existing forum categories have role_required set
UPDATE forum_categories 
SET role_required = CASE 
    WHEN is_moderator_only = true THEN 'moderator'
    ELSE 'member'
END
WHERE role_required IS NULL;

-- Step 2: Restore general forum categories that were lost
-- Check if general categories exist, if not, create them
INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'General Discussion',
    'General chat and community discussions',
    'general-discussion',
    'message-square',
    '#6366f1',
    1,
    'member',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'general-discussion'
);

INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'Events & Activities',
    'Community events, competitions, and activities',
    'events-activities',
    'calendar',
    '#f59e0b',
    2,
    'member',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'events-activities'
);

INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'Questions & Help',
    'Get help with commands, gameplay, and server features',
    'questions-help',
    'help-circle',
    '#eab308',
    3,
    'member',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'questions-help'
);

INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'Server Ideas & Suggestions',
    'Suggest new features and improvements for the server',
    'server-ideas',
    'lightbulb',
    '#ec4899',
    4,
    'member',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'server-ideas'
);

INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'News & Announcements',
    'Latest server news and important announcements',
    'news-announcements',
    'newspaper',
    '#059669',
    5,
    'moderator',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'news-announcements'
);

INSERT INTO forum_categories (name, description, slug, icon, color, order_index, role_required, created_at, updated_at) 
SELECT 
    'Patch Notes & Updates',
    'Server updates, bug fixes, and new features',
    'patch-notes',
    'wrench',
    '#8b5cf6',
    6,
    'moderator',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'patch-notes'
);

-- Step 3: Update the order_index for nation and town forums to be after general categories
UPDATE forum_categories 
SET order_index = order_index + 10
WHERE nation_name IS NOT NULL OR town_name IS NOT NULL;

-- Step 4: Ensure all categories have proper metadata
UPDATE forum_categories 
SET 
    icon = COALESCE(icon, 'message-square'),
    color = COALESCE(color, '#3b82f6'),
    order_index = COALESCE(order_index, 999)
WHERE icon IS NULL OR color IS NULL OR order_index IS NULL;

-- Step 5: Create a view for easier forum category management
CREATE OR REPLACE VIEW forum_categories_view AS
SELECT 
    id,
    name,
    description,
    slug,
    icon,
    color,
    order_index,
    role_required,
    nation_name,
    town_name,
    is_archived,
    created_at,
    updated_at,
    CASE 
        WHEN nation_name IS NOT NULL AND town_name IS NOT NULL THEN 'town'
        WHEN nation_name IS NOT NULL THEN 'nation'
        ELSE 'general'
    END as category_type
FROM forum_categories
ORDER BY order_index, name;

-- Step 6: Add a comment to document the structure
COMMENT ON TABLE forum_categories IS 'Forum categories with role-based access control. General categories have role_required = member, staff categories have role_required = moderator, and nation/town forums have nation_name and/or town_name set.';
COMMENT ON COLUMN forum_categories.role_required IS 'Access level required: member, moderator, admin';
COMMENT ON COLUMN forum_categories.nation_name IS 'For nation-specific forums, the name of the nation';
COMMENT ON COLUMN forum_categories.town_name IS 'For town-specific forums, the name of the town (requires nation_name to be set)';
