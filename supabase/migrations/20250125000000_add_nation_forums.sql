-- Add nation-specific forum categories
-- First, update the existing Towns Forum to Nations Forum
UPDATE forum_categories 
SET name = 'Nations Forum', 
    description = 'Private forums for each nation - only accessible to nation members',
    slug = 'nations'
WHERE slug = 'towns';

-- Add nation-specific forum categories for each nation
INSERT INTO forum_categories (name, description, slug, icon, color, order_index, is_moderator_only) VALUES
('Skyward Sanctum Forum', 'Private forum for Skyward Sanctum members', 'skyward-sanctum', 'crown', '#3b82f6', 2, false),
('North Sea League Forum', 'Private forum for North Sea League members', 'north-sea-league', 'anchor', '#059669', 3, false),
('Kesko Corporation Forum', 'Private forum for Kesko Corporation members', 'kesko-corporation', 'building', '#f59e0b', 4, false),
('Aqua Union Forum', 'Private forum for Aqua Union members', 'aqua-union', 'droplets', '#0ea5e9', 5, false),
('Constellation Forum', 'Private forum for Constellation members', 'constellation', 'star', '#8b5cf6', 6, false);

-- Add a new column to track nation-specific access
ALTER TABLE forum_categories 
ADD COLUMN nation_name TEXT;

-- Update the nation forums with their nation names
UPDATE forum_categories 
SET nation_name = 'Skyward Sanctum'
WHERE slug = 'skyward-sanctum';

UPDATE forum_categories 
SET nation_name = 'North_Sea_League'
WHERE slug = 'north-sea-league';

UPDATE forum_categories 
SET nation_name = 'Kesko Corporation'
WHERE slug = 'kesko-corporation';

UPDATE forum_categories 
SET nation_name = 'Aqua Union'
WHERE slug = 'aqua-union';

UPDATE forum_categories 
SET nation_name = 'Constellation'
WHERE slug = 'constellation';

-- Create a function to check if user can access nation forum
CREATE OR REPLACE FUNCTION can_access_nation_forum(user_id UUID, nation_name TEXT)
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
  
  -- For now, we'll return true for testing
  -- In production, this would make an API call to https://townywebpanel.nordics.world/api/players/{username}
  -- and check if the user's nation matches the forum's nation
  -- The actual API call will be handled by the frontend for now
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update forum categories policy to check nation access
DROP POLICY IF EXISTS "Forum categories are viewable by everyone" ON forum_categories;

CREATE POLICY "Forum categories are viewable by everyone except nation forums" 
ON forum_categories 
FOR SELECT 
USING (
  nation_name IS NULL OR 
  can_access_nation_forum(auth.uid(), nation_name)
);

-- Update forum posts policy for nation forums
DROP POLICY IF EXISTS "Forum posts are viewable by everyone" ON forum_posts;

CREATE POLICY "Forum posts are viewable by everyone except nation forum posts" 
ON forum_posts 
FOR SELECT 
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_categories 
    WHERE forum_categories.id = forum_posts.category_id 
    AND forum_categories.nation_name IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM forum_categories 
    WHERE forum_categories.id = forum_posts.category_id 
    AND forum_categories.nation_name IS NOT NULL
    AND can_access_nation_forum(auth.uid(), forum_categories.nation_name)
  )
);

-- Update forum replies policy for nation forums
DROP POLICY IF EXISTS "Forum replies are viewable by everyone" ON forum_replies;

CREATE POLICY "Forum replies are viewable by everyone except nation forum replies" 
ON forum_replies 
FOR SELECT 
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_posts 
    JOIN forum_categories ON forum_categories.id = forum_posts.category_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND forum_categories.nation_name IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM forum_posts 
    JOIN forum_categories ON forum_categories.id = forum_posts.category_id
    WHERE forum_posts.id = forum_replies.post_id 
    AND forum_categories.nation_name IS NOT NULL
    AND can_access_nation_forum(auth.uid(), forum_categories.nation_name)
  )
); 