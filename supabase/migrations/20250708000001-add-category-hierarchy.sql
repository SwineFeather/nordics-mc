-- Add parent_id column to wiki_categories for hierarchical structure
ALTER TABLE wiki_categories 
ADD COLUMN parent_id UUID REFERENCES wiki_categories(id) ON DELETE CASCADE;

-- Add index for better performance on parent lookups
CREATE INDEX idx_wiki_categories_parent_id ON wiki_categories(parent_id);

-- Add constraint to prevent circular references (max 6 levels deep)
-- This will be enforced by application logic, but we can add a check constraint
ALTER TABLE wiki_categories 
ADD CONSTRAINT check_category_depth 
CHECK (
  -- For now, we'll rely on application logic to enforce depth
  -- This constraint can be enhanced later if needed
  parent_id IS NULL OR parent_id != id
);

-- Add a function to get category depth
CREATE OR REPLACE FUNCTION get_category_depth(category_id UUID)
RETURNS INTEGER AS $$
DECLARE
  depth INTEGER := 0;
  current_parent_id UUID;
BEGIN
  SELECT parent_id INTO current_parent_id 
  FROM wiki_categories 
  WHERE id = category_id;
  
  WHILE current_parent_id IS NOT NULL AND depth < 10 LOOP
    depth := depth + 1;
    SELECT parent_id INTO current_parent_id 
    FROM wiki_categories 
    WHERE id = current_parent_id;
  END LOOP;
  
  RETURN depth;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_child_categories(uuid);
-- Add a function to get all child categories recursively
CREATE OR REPLACE FUNCTION get_child_categories(parent_category_id UUID)
RETURNS TABLE(id UUID, title TEXT, slug TEXT, depth INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: direct children
    SELECT 
      c.id, 
      c.title, 
      c.slug, 
      1 as depth,
      ARRAY[c.id] as path
    FROM wiki_categories c
    WHERE c.parent_id = parent_category_id
    
    UNION ALL
    
    -- Recursive case: children of children
    SELECT 
      c.id, 
      c.title, 
      c.slug, 
      ct.depth + 1,
      ct.path || c.id
    FROM wiki_categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 6  -- Limit to 6 levels deep
  )
  SELECT ct.id, ct.title, ct.slug, ct.depth
  FROM category_tree ct;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to include parent_id
DROP POLICY IF EXISTS "Users can view wiki categories" ON wiki_categories;
CREATE POLICY "Users can view wiki categories" ON wiki_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage wiki categories" ON wiki_categories;
CREATE POLICY "Staff can manage wiki categories" ON wiki_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Add policy for category creation with parent validation
CREATE POLICY "Users can create categories with valid parent" ON wiki_categories
  FOR INSERT WITH CHECK (
    -- Allow staff to create any category
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
    OR
    -- Allow regular users to create top-level categories only
    (parent_id IS NULL)
  ); 