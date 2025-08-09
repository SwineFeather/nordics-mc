-- Fix forum access policies to enforce private nation/town forum visibility and prevent link sharing bypass

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_replies ENABLE ROW LEVEL SECURITY;

-- Create or replace the access check function supporting nation and optional town
CREATE OR REPLACE FUNCTION can_access_nation_forum(user_id UUID, forum_nation_name TEXT, forum_town_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_minecraft_username TEXT;
BEGIN
  -- Anonymous users cannot access private forums
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user's Minecraft username
  SELECT minecraft_username INTO user_minecraft_username
  FROM profiles
  WHERE id = user_id;

  IF user_minecraft_username IS NULL THEN
    RETURN FALSE;
  END IF;

  -- If town forum, require the user to belong to that specific town in the specified nation
  IF forum_town_name IS NOT NULL THEN
    -- Resident of specific town
    IF EXISTS (
      SELECT 1 FROM residents
      WHERE name = user_minecraft_username
        AND town_name = forum_town_name
        AND nation_name = forum_nation_name
    ) THEN
      RETURN TRUE;
    END IF;

    -- Or mayor of that town
    RETURN EXISTS (
      SELECT 1 FROM towns t
      JOIN nations n ON t.nation_id = n.id
      WHERE t.mayor = user_minecraft_username
        AND t.name = forum_town_name
        AND n.name = forum_nation_name
    );
  END IF;

  -- Nation forum: user must belong to any town in the nation or be a mayor in that nation
  IF EXISTS (
    SELECT 1 FROM residents
    WHERE name = user_minecraft_username
      AND nation_name = forum_nation_name
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM towns t
    JOIN nations n ON t.nation_id = n.id
    WHERE t.mayor = user_minecraft_username
      AND n.name = forum_nation_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories policy: public categories are visible to all; nation/town require access
DROP POLICY IF EXISTS "Forum categories are viewable by everyone except nation/town forums" ON forum_categories;
DROP POLICY IF EXISTS "Forum categories are viewable by everyone except nation forums" ON forum_categories;
CREATE POLICY "Forum categories are viewable with proper access" 
ON forum_categories
FOR SELECT
USING (
  (nation_name IS NULL AND town_name IS NULL)
  OR can_access_nation_forum(auth.uid(), nation_name, town_name)
);

-- Posts policy: enforce category-based access
DROP POLICY IF EXISTS "Forum posts are viewable by everyone except nation forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Forum posts are viewable by everyone except nation/town forum posts" ON forum_posts;
CREATE POLICY "Forum posts are viewable with proper access"
ON forum_posts
FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_categories c
    WHERE c.id = forum_posts.category_id
      AND (c.nation_name IS NOT NULL OR c.town_name IS NOT NULL)
  )
  OR EXISTS (
    SELECT 1 FROM forum_categories c
    WHERE c.id = forum_posts.category_id
      AND (c.nation_name IS NOT NULL OR c.town_name IS NOT NULL)
      AND can_access_nation_forum(auth.uid(), c.nation_name, c.town_name)
  )
);

-- Replies policy: enforce based on the parent post's category
DROP POLICY IF EXISTS "Forum replies are viewable by everyone except nation forum replies" ON forum_replies;
DROP POLICY IF EXISTS "Forum replies are viewable by everyone except nation/town forum replies" ON forum_replies;
CREATE POLICY "Forum replies are viewable with proper access"
ON forum_replies
FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM forum_posts p
    JOIN forum_categories c ON c.id = p.category_id
    WHERE p.id = forum_replies.post_id
      AND (c.nation_name IS NOT NULL OR c.town_name IS NOT NULL)
  )
  OR EXISTS (
    SELECT 1 FROM forum_posts p
    JOIN forum_categories c ON c.id = p.category_id
    WHERE p.id = forum_replies.post_id
      AND (c.nation_name IS NOT NULL OR c.town_name IS NOT NULL)
      AND can_access_nation_forum(auth.uid(), c.nation_name, c.town_name)
  )
);

