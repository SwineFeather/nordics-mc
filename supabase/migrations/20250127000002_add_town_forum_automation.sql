-- Add town forum automation system
-- Migration: 20250127000002_add_town_forum_automation.sql

-- Add is_archived column to forum_categories if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'is_archived') THEN
        ALTER TABLE forum_categories ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add updated_at column to forum_categories if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'updated_at') THEN
        ALTER TABLE forum_categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_is_archived ON forum_categories(is_archived);
CREATE INDEX IF NOT EXISTS idx_forum_categories_updated_at ON forum_categories(updated_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_forum_categories_updated_at ON forum_categories;
CREATE TRIGGER trigger_update_forum_categories_updated_at
    BEFORE UPDATE ON forum_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_forum_categories_updated_at();

-- Create a function to sync town forums (for manual execution)
CREATE OR REPLACE FUNCTION sync_town_forums()
RETURNS JSON AS $$
DECLARE
    town_record RECORD;
    forum_record RECORD;
    results JSON;
    created_count INTEGER := 0;
    updated_count INTEGER := 0;
    archived_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Create new forums for towns that don't have them
    FOR town_record IN 
        SELECT id, name, nation_name 
        FROM towns 
        WHERE nation_name IS NOT NULL
    LOOP
        -- Check if forum already exists
        SELECT * INTO forum_record 
        FROM forum_categories 
        WHERE town_name = town_record.name 
        AND is_archived = false;
        
        IF NOT FOUND THEN
            -- Create new forum
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
            ) VALUES (
                town_record.name || ' Forum',
                'Private forum for ' || town_record.name || ' residents',
                'town-' || LOWER(REPLACE(town_record.name, ' ', '-')),
                'image',
                CASE town_record.nation_name
                    WHEN 'Skyward Sanctum' THEN '#3b82f6'
                    WHEN 'North_Sea_League' THEN '#059669'
                    WHEN 'Kesko Corporation' THEN '#f59e0b'
                    WHEN 'Aqua Union' THEN '#0ea5e9'
                    WHEN 'Constellation' THEN '#8b5cf6'
                    ELSE '#3b82f6'
                END,
                6,
                false,
                town_record.nation_name,
                town_record.name,
                false
            );
            created_count := created_count + 1;
        END IF;
    END LOOP;
    
    -- Archive forums for towns that no longer exist
    FOR forum_record IN 
        SELECT id, town_name 
        FROM forum_categories 
        WHERE town_name IS NOT NULL 
        AND is_archived = false
    LOOP
        -- Check if town still exists
        SELECT * INTO town_record 
        FROM towns 
        WHERE name = forum_record.town_name 
        AND nation_name IS NOT NULL;
        
        IF NOT FOUND THEN
            -- Archive the forum
            UPDATE forum_categories 
            SET is_archived = true, updated_at = NOW()
            WHERE id = forum_record.id;
            archived_count := archived_count + 1;
        END IF;
    END LOOP;
    
    -- Update nation names for forums if towns changed nations
    FOR forum_record IN 
        SELECT fc.id, fc.town_name, fc.nation_name, t.nation_name as current_nation
        FROM forum_categories fc
        JOIN towns t ON fc.town_name = t.name
        WHERE fc.town_name IS NOT NULL 
        AND fc.is_archived = false
        AND fc.nation_name != t.nation_name
    LOOP
        UPDATE forum_categories 
        SET nation_name = forum_record.current_nation, 
            color = CASE forum_record.current_nation
                WHEN 'Skyward Sanctum' THEN '#3b82f6'
                WHEN 'North_Sea_League' THEN '#059669'
                WHEN 'Kesko Corporation' THEN '#f59e0b'
                WHEN 'Aqua Union' THEN '#0ea5e9'
                WHEN 'Constellation' THEN '#8b5cf6'
                ELSE '#3b82f6'
            END,
            updated_at = NOW()
        WHERE id = forum_record.id;
        updated_count := updated_count + 1;
    END LOOP;
    
    results := json_build_object(
        'success', true,
        'created', created_count,
        'updated', updated_count,
        'archived', archived_count,
        'errors', error_count
    );
    
    RETURN results;
EXCEPTION
    WHEN OTHERS THEN
        error_count := error_count + 1;
        results := json_build_object(
            'success', false,
            'error', SQLERRM,
            'created', created_count,
            'updated', updated_count,
            'archived', archived_count,
            'errors', error_count
        );
        RETURN results;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION sync_town_forums() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_town_forums() TO service_role;

-- Create a cron job to run the sync every 24 hours
-- Note: This requires pg_cron extension to be enabled
-- You may need to enable it in your Supabase dashboard
SELECT cron.schedule(
    'sync-town-forums-daily',
    '0 2 * * *', -- Run at 2 AM every day
    'SELECT sync_town_forums();'
); 