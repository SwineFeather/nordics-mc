-- Add town-specific forum categories
-- Migration: 20250126000000_add_town_forums.sql

-- First, remove the old nation forum categories that are in the wrong place
DELETE FROM forum_categories 
WHERE nation_name IS NOT NULL AND slug IN (
  'skyward-sanctum',
  'north-sea-league', 
  'kesko-corporation',
  'aqua-union',
  'constellation'
);

-- Add town-specific forum categories for each town that belongs to a nation
-- We'll create these dynamically based on the towns table

-- Create a function to generate town forum categories
CREATE OR REPLACE FUNCTION create_town_forum_categories()
RETURNS void AS $$
DECLARE
  town_record RECORD;
  nation_record RECORD;
BEGIN
  -- Loop through all towns that belong to a nation
  FOR town_record IN 
    SELECT t.name as town_name, t.mayor, n.name as nation_name, n.id as nation_id
    FROM towns t
    JOIN nations n ON t.nation_id = n.id
    WHERE t.is_independent = false
    ORDER BY n.name, t.name
  LOOP
    -- Insert town forum category
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
    ) VALUES (
      town_record.town_name || ' Forum',
      'Private forum for ' || town_record.town_name || ' residents',
      LOWER(REPLACE(town_record.town_name, ' ', '-')) || '-forum',
      'building',
      '#3b82f6',
      10, -- Higher order index to appear after general categories
      false,
      town_record.nation_name,
      town_record.town_name
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create town forum categories
SELECT create_town_forum_categories();

-- Add town_name column to forum_categories if it doesn't exist
ALTER TABLE forum_categories 
ADD COLUMN IF NOT EXISTS town_name TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_town_name ON forum_categories(town_name);
CREATE INDEX IF NOT EXISTS idx_forum_categories_nation_town ON forum_categories(nation_name, town_name);

-- Update the can_access_nation_forum function to also check town access
CREATE OR REPLACE FUNCTION can_access_nation_forum(user_id UUID, nation_name TEXT, town_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_minecraft_username TEXT;
BEGIN
  -- Get user's Minecraft username
  SELECT minecraft_username INTO user_minecraft_username
  FROM profiles
  WHERE id = user_id;
  
  IF user_minecraft_username IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If town_name is specified, check if user is a resident of that specific town
  IF town_name IS NOT NULL THEN
    -- First check if user is a resident of the specific town
    IF EXISTS (
      SELECT 1 FROM residents
      WHERE name = user_minecraft_username 
      AND town_name = town_name
      AND nation_name = nation_name
    ) THEN
      RETURN TRUE;
    END IF;
    
    -- Fallback: check if user is mayor of that specific town
    RETURN EXISTS (
      SELECT 1 FROM towns t
      JOIN nations n ON t.nation_id = n.id
      WHERE t.mayor = user_minecraft_username 
      AND t.name = town_name
      AND n.name = nation_name
    );
  END IF;
  
  -- Otherwise, check if user is a resident of any town in the nation
  IF EXISTS (
    SELECT 1 FROM residents
    WHERE name = user_minecraft_username 
    AND nation_name = nation_name
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback: check if user is mayor of any town in the nation
  RETURN EXISTS (
    SELECT 1 FROM towns t
    JOIN nations n ON t.nation_id = n.id
    WHERE t.mayor = user_minecraft_username 
    AND n.name = nation_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update forum categories policy to check nation and town access
DROP POLICY IF EXISTS "Forum categories are viewable by everyone except nation forums" ON forum_categories;

CREATE POLICY "Forum categories are viewable by everyone except nation/town forums" 
ON forum_categories 
FOR SELECT 
USING (
  (nation_name IS NULL AND town_name IS NULL) OR 
  can_access_nation_forum(auth.uid(), nation_name, town_name)
);

-- Update forum posts policy for nation/town forums
DROP POLICY IF EXISTS "Forum posts are viewable by everyone except nation forum posts" ON forum_posts;

CREATE POLICY "Forum posts are viewable by everyone except nation/town forum posts" 
ON forum_posts 
FOR SELECT 
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_categories 
    WHERE forum_categories.id = forum_posts.category_id 
    AND (forum_categories.nation_name IS NOT NULL OR forum_categories.town_name IS NOT NULL)
  ) OR
  EXISTS (
    SELECT 1 FROM forum_categories 
    WHERE forum_categories.id = forum_posts.category_id 
    AND (forum_categories.nation_name IS NOT NULL OR forum_categories.town_name IS NOT NULL)
    AND can_access_nation_forum(auth.uid(), forum_categories.nation_name, forum_categories.town_name)
  )
);

-- Update forum replies policy for nation/town forums
DROP POLICY IF EXISTS "Forum replies are viewable by everyone except nation forum replies" ON forum_replies;

CREATE POLICY "Forum replies are viewable by everyone except nation/town forum replies" 
ON forum_replies 
FOR SELECT 
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_posts 
    JOIN forum_categories ON forum_categories.id = forum_posts.category_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND (forum_categories.nation_name IS NOT NULL OR forum_categories.town_name IS NOT NULL)
  ) OR
  EXISTS (
    SELECT 1 FROM forum_posts 
    JOIN forum_categories ON forum_categories.id = forum_posts.category_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND (forum_categories.nation_name IS NOT NULL OR forum_categories.town_name IS NOT NULL)
    AND can_access_nation_forum(auth.uid(), forum_categories.nation_name, forum_categories.town_name)
  )
); 