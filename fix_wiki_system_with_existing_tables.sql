-- Fix Wiki System - Works with Existing Table Structures
-- Run this in your Supabase SQL Editor

-- 1. Create wiki storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  10485760, -- 10MB limit
  ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- 2. Enable RLS on all wiki tables
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for wiki_pages
DROP POLICY IF EXISTS "Wiki pages are viewable by everyone" ON public.wiki_pages;
CREATE POLICY "Wiki pages are viewable by everyone" ON public.wiki_pages
  FOR SELECT USING (is_visible = true AND is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create wiki pages" ON public.wiki_pages;
CREATE POLICY "Authenticated users can create wiki pages" ON public.wiki_pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own wiki pages" ON public.wiki_pages;
CREATE POLICY "Users can update their own wiki pages" ON public.wiki_pages
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    auth.uid() = last_edited_by OR
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete wiki pages" ON public.wiki_pages;
CREATE POLICY "Admins can delete wiki pages" ON public.wiki_pages
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- 4. Create RLS policies for wiki_categories
DROP POLICY IF EXISTS "Wiki categories are viewable by everyone" ON public.wiki_categories;
CREATE POLICY "Wiki categories are viewable by everyone" ON public.wiki_categories
  FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Admins can manage wiki categories" ON public.wiki_categories;
CREATE POLICY "Admins can manage wiki categories" ON public.wiki_categories
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- 5. Create RLS policies for wiki_comments
DROP POLICY IF EXISTS "Wiki comments are viewable by everyone" ON public.wiki_comments;
CREATE POLICY "Wiki comments are viewable by everyone" ON public.wiki_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.wiki_comments;
CREATE POLICY "Authenticated users can create comments" ON public.wiki_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own comments" ON public.wiki_comments;
CREATE POLICY "Users can update their own comments" ON public.wiki_comments
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
    )
  );

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.wiki_comments;
CREATE POLICY "Users can delete their own comments" ON public.wiki_comments
  FOR DELETE USING (
    auth.uid() = author_id OR 
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
    )
  );

-- 6. Create RLS policies for wiki_edit_sessions
DROP POLICY IF EXISTS "Users can manage their own edit sessions" ON public.wiki_edit_sessions;
CREATE POLICY "Users can manage their own edit sessions" ON public.wiki_edit_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 7. Create RLS policies for page_revisions
DROP POLICY IF EXISTS "Page revisions are viewable by everyone" ON public.page_revisions;
CREATE POLICY "Page revisions are viewable by everyone" ON public.page_revisions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create revisions" ON public.page_revisions;
CREATE POLICY "Authenticated users can create revisions" ON public.page_revisions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Create storage policies for wiki bucket
DROP POLICY IF EXISTS "Wiki files are publicly accessible" ON storage.objects;
CREATE POLICY "Wiki files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

DROP POLICY IF EXISTS "Authenticated users can upload wiki files" ON storage.objects;
CREATE POLICY "Authenticated users can upload wiki files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wiki' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own wiki files" ON storage.objects;
CREATE POLICY "Users can update their own wiki files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wiki' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own wiki files" ON storage.objects;
CREATE POLICY "Users can delete their own wiki files" ON storage.objects
  FOR DELETE USING (bucket_id = 'wiki' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 9. Insert default categories if they don't exist
INSERT INTO public.wiki_categories (title, slug, description, order_index, icon, color) VALUES
  ('General', 'general', 'General wiki pages', 1, 'BookOpen', '#3b82f6'),
  ('Towns', 'towns', 'Information about towns', 2, 'MapPin', '#10b981'),
  ('Nations', 'nations', 'Information about nations', 3, 'Flag', '#f59e0b'),
  ('Rules', 'rules', 'Server rules and guidelines', 4, 'Shield', '#ef4444'),
  ('Guides', 'guides', 'Helpful guides and tutorials', 5, 'Lightbulb', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- 10. Create helper functions for wiki operations
CREATE OR REPLACE FUNCTION public.get_wiki_page_by_slug(page_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  status TEXT,
  category_id UUID,
  author_id UUID,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  parent_page_id UUID,
  depth INTEGER,
  icon TEXT,
  color TEXT,
  is_expanded BOOLEAN,
  description TEXT,
  tags TEXT[],
  last_edited_by UUID,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN,
  allow_comments BOOLEAN,
  allow_editing BOOLEAN,
  require_approval BOOLEAN,
  is_visible BOOLEAN,
  category_title TEXT,
  author_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    wp.id,
    wp.title,
    wp.slug,
    wp.content,
    wp.status,
    wp.category_id,
    wp.author_id,
    wp.order_index,
    wp.created_at,
    wp.updated_at,
    wp.parent_page_id,
    wp.depth,
    wp.icon,
    wp.color,
    wp.is_expanded,
    wp.description,
    wp.tags,
    wp.last_edited_by,
    wp.last_edited_at,
    wp.is_public,
    wp.allow_comments,
    wp.allow_editing,
    wp.require_approval,
    wp.is_visible,
    wc.title as category_title,
    p.full_name as author_name
  FROM public.wiki_pages wp
  LEFT JOIN public.wiki_categories wc ON wp.category_id = wc.id
  LEFT JOIN public.profiles p ON wp.author_id = p.id
  WHERE wp.slug = page_slug
  AND wp.is_visible = true
  AND wp.is_public = true;
$$;

-- 11. Create function to increment view count (if view_count column exists)
CREATE OR REPLACE FUNCTION public.increment_wiki_page_views(page_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update if view_count column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wiki_pages' AND column_name = 'view_count'
  ) THEN
    UPDATE public.wiki_pages 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = page_id_param;
  END IF;
END;
$$;

-- 12. Create function to create wiki page automatically for towns/nations
CREATE OR REPLACE FUNCTION public.create_wiki_page_automatically()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_page_id UUID;
  page_title TEXT;
  page_slug TEXT;
  page_content TEXT;
  category_id UUID;
BEGIN
  -- Get the appropriate category
  IF TG_TABLE_NAME = 'towns' THEN
    SELECT id INTO category_id FROM public.wiki_categories WHERE slug = 'towns';
    page_title := NEW.name || ' (Town)';
    page_slug := 'towns/' || LOWER(REPLACE(NEW.name, ' ', '-'));
    page_content := '# ' || NEW.name || E'\n\n' ||
                   '**Mayor:** ' || COALESCE(NEW.mayor_name, 'Unknown') || E'\n\n' ||
                   '**Location:** ' || COALESCE(NEW.world_name, 'Unknown') || ' (' || 
                   COALESCE(NEW.location_x::text, '0') || ', ' || 
                   COALESCE(NEW.location_z::text, '0') || ')' || E'\n\n' ||
                   '**Balance:** $' || COALESCE(NEW.balance::text, '0') || E'\n\n' ||
                   '**Residents:** ' || COALESCE(NEW.residents_count::text, '0') || E'\n\n' ||
                   '**Level:** ' || COALESCE(NEW.level::text, '1') || E'\n\n' ||
                   'This page was automatically generated. Please edit it to add more information.';
  ELSIF TG_TABLE_NAME = 'nations' THEN
    SELECT id INTO category_id FROM public.wiki_categories WHERE slug = 'nations';
    page_title := NEW.name || ' (Nation)';
    page_slug := 'nations/' || LOWER(REPLACE(NEW.name, ' ', '-'));
    page_content := '# ' || NEW.name || E'\n\n' ||
                   '**Leader:** ' || COALESCE(NEW.leader_name, 'Unknown') || E'\n\n' ||
                   '**King:** ' || COALESCE(NEW.king_name, 'Unknown') || E'\n\n' ||
                   '**Capital:** ' || COALESCE(NEW.capital_town_name, 'None') || E'\n\n' ||
                   '**Balance:** $' || COALESCE(NEW.balance::text, '0') || E'\n\n' ||
                   '**Towns:** ' || COALESCE(NEW.towns_count::text, '0') || E'\n\n' ||
                   '**Residents:** ' || COALESCE(NEW.residents_count::text, '0') || E'\n\n' ||
                   'This page was automatically generated. Please edit it to add more information.';
  END IF;

  -- Create the wiki page
  INSERT INTO public.wiki_pages (
    title, 
    slug, 
    content, 
    status, 
    category_id, 
    tags, 
    is_public, 
    allow_comments, 
    allow_editing,
    description
  )
  VALUES (
    page_title, 
    page_slug, 
    page_content, 
    'published', 
    category_id, 
    ARRAY[TG_TABLE_NAME], 
    true, 
    true, 
    true,
    'Automatically generated page for ' || TG_TABLE_NAME || ': ' || NEW.name
  )
  RETURNING id INTO new_page_id;

  RETURN NEW;
END;
$$;

-- 13. Create triggers for automatic wiki page creation (only if they don't exist)
CREATE OR REPLACE FUNCTION public.create_town_nation_triggers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create town trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_create_town_wiki_page'
  ) THEN
    CREATE TRIGGER trigger_create_town_wiki_page
      AFTER INSERT ON public.towns
      FOR EACH ROW
      EXECUTE FUNCTION public.create_wiki_page_automatically();
  END IF;
  
  -- Create nation trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_create_nation_wiki_page'
  ) THEN
    CREATE TRIGGER trigger_create_nation_wiki_page
      AFTER INSERT ON public.nations
      FOR EACH ROW
      EXECUTE FUNCTION public.create_wiki_page_automatically();
  END IF;
END;
$$;

-- Execute the trigger creation function
SELECT public.create_town_nation_triggers();

-- 14. Create sample wiki pages if they don't exist
INSERT INTO public.wiki_pages (
  title, 
  slug, 
  content, 
  status, 
  category_id, 
  tags, 
  is_public, 
  allow_comments, 
  allow_editing,
  description,
  order_index
) VALUES (
  'Welcome to Nordics Nexus', 
  'welcome', 
  '# Welcome to Nordics Nexus

Welcome to the official wiki for Nordics Nexus! This is your comprehensive guide to everything about our server.

## Getting Started

- [Server Rules](rules)
- [Town Guide](guides/towns)
- [Nation Guide](guides/nations)

## Quick Links

- [Player Statistics](statistics)
- [Server Map](map)
- [Community Forums](forums)

This wiki is maintained by the community. Feel free to contribute!', 
  'published', 
  (SELECT id FROM public.wiki_categories WHERE slug = 'general'), 
  ARRAY['general', 'welcome'], 
  true, 
  true, 
  true,
  'Welcome page for Nordics Nexus wiki',
  1
) ON CONFLICT (slug) DO NOTHING;

-- 15. Create function to get wiki page tree
CREATE OR REPLACE FUNCTION public.get_wiki_page_tree(parent_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  depth INTEGER,
  order_index INTEGER,
  icon TEXT,
  color TEXT,
  is_expanded BOOLEAN,
  has_children BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH RECURSIVE page_tree AS (
    SELECT 
      id,
      title,
      slug,
      depth,
      order_index,
      icon,
      color,
      is_expanded,
      parent_page_id,
      0 as level
    FROM public.wiki_pages
    WHERE parent_page_id = parent_id_param
      AND is_visible = true
      AND is_public = true
    
    UNION ALL
    
    SELECT 
      wp.id,
      wp.title,
      wp.slug,
      wp.depth,
      wp.order_index,
      wp.icon,
      wp.color,
      wp.is_expanded,
      wp.parent_page_id,
      pt.level + 1
    FROM public.wiki_pages wp
    INNER JOIN page_tree pt ON wp.parent_page_id = pt.id
    WHERE wp.is_visible = true
      AND wp.is_public = true
  )
  SELECT 
    pt.id,
    pt.title,
    pt.slug,
    pt.depth,
    pt.order_index,
    pt.icon,
    pt.color,
    pt.is_expanded,
    EXISTS(
      SELECT 1 FROM public.wiki_pages 
      WHERE parent_page_id = pt.id 
        AND is_visible = true 
        AND is_public = true
    ) as has_children
  FROM page_tree pt
  ORDER BY pt.order_index, pt.title;
$$;

-- Success message
SELECT 'Wiki system setup completed successfully with existing tables!' as status; 