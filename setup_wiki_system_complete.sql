-- Complete Wiki System Setup
-- Run this in your Supabase SQL Editor to set up wiki editing from scratch

-- 1. Create wiki storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  10485760, -- 10MB limit
  ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif'];

-- 2. Create wiki_pages table
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  path TEXT UNIQUE NOT NULL,
  bucket TEXT DEFAULT 'wiki',
  category_id UUID,
  parent_page_id UUID,
  depth INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  is_expanded BOOLEAN DEFAULT true,
  description TEXT,
  tags TEXT[],
  last_edited_by UUID REFERENCES auth.users(id),
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT true,
  allow_editing BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  custom_css TEXT,
  meta_description TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create wiki_categories table
CREATE TABLE IF NOT EXISTS public.wiki_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.wiki_categories(id),
  depth INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  is_expanded BOOLEAN DEFAULT true,
  last_edited_by UUID REFERENCES auth.users(id),
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_count INTEGER DEFAULT 0,
  subcategory_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create wiki_comments table
CREATE TABLE IF NOT EXISTS public.wiki_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create wiki_edit_sessions table
CREATE TABLE IF NOT EXISTS public.wiki_edit_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create page_revisions table
CREATE TABLE IF NOT EXISTS public.page_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  title TEXT,
  description TEXT,
  revision_number INTEGER NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON public.wiki_pages(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_path ON public.wiki_pages(path);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_category_id ON public.wiki_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_parent_page_id ON public.wiki_pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_depth ON public.wiki_pages(depth);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_tags ON public.wiki_pages USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_keywords ON public.wiki_pages USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug ON public.wiki_categories(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_parent_id ON public.wiki_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_depth ON public.wiki_categories(depth);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_page_id ON public.wiki_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_author_id ON public.wiki_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_page_id ON public.wiki_edit_sessions(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_user_id ON public.wiki_edit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id ON public.page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_user_id ON public.page_revisions(user_id);

-- 8. Enable Row Level Security
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for wiki_pages
CREATE POLICY "Public read access to wiki_pages" ON public.wiki_pages
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can read all wiki_pages" ON public.wiki_pages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert wiki_pages" ON public.wiki_pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update wiki_pages" ON public.wiki_pages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete wiki_pages" ON public.wiki_pages
  FOR DELETE USING (auth.role() = 'authenticated');

-- 10. Create RLS policies for wiki_categories
CREATE POLICY "Public read access to wiki_categories" ON public.wiki_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage wiki_categories" ON public.wiki_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- 11. Create RLS policies for wiki_comments
CREATE POLICY "Public read access to approved wiki_comments" ON public.wiki_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can read all wiki_comments" ON public.wiki_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert wiki_comments" ON public.wiki_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own wiki_comments" ON public.wiki_comments
  FOR UPDATE USING (auth.role() = 'authenticated' AND author_id = auth.uid());

CREATE POLICY "Authenticated users can delete own wiki_comments" ON public.wiki_comments
  FOR DELETE USING (auth.role() = 'authenticated' AND author_id = auth.uid());

-- 12. Create RLS policies for wiki_edit_sessions
CREATE POLICY "Users can manage own edit sessions" ON public.wiki_edit_sessions
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- 13. Create RLS policies for page_revisions
CREATE POLICY "Public read access to page_revisions" ON public.page_revisions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert page_revisions" ON public.page_revisions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 14. Create storage policies for wiki bucket
DROP POLICY IF EXISTS "Public read access for wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from wiki" ON storage.objects;

CREATE POLICY "Public read access for wiki" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

CREATE POLICY "Authenticated users can upload to wiki" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update wiki" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete from wiki" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- 15. Create helper functions for wiki operations
CREATE OR REPLACE FUNCTION public.create_wiki_page(
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT,
  p_path TEXT,
  p_category_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_id UUID;
BEGIN
  INSERT INTO public.wiki_pages (
    title, slug, content, path, category_id, description, tags, last_edited_by
  ) VALUES (
    p_title, p_slug, p_content, p_path, p_category_id, p_description, p_tags, auth.uid()
  ) RETURNING id INTO page_id;
  
  -- Create initial revision
  INSERT INTO public.page_revisions (
    page_id, user_id, content, title, description, revision_number, change_summary
  ) VALUES (
    page_id, auth.uid(), p_content, p_title, p_description, 1, 'Initial page creation'
  );
  
  RETURN page_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_wiki_page(
  p_page_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_revision INTEGER;
BEGIN
  -- Get current revision number
  SELECT COALESCE(MAX(revision_number), 0) + 1 INTO current_revision
  FROM public.page_revisions
  WHERE page_id = p_page_id;
  
  -- Update the page
  UPDATE public.wiki_pages SET
    title = p_title,
    content = p_content,
    description = p_description,
    tags = p_tags,
    last_edited_by = auth.uid(),
    last_edited_at = NOW(),
    updated_at = NOW()
  WHERE id = p_page_id;
  
  -- Create new revision
  INSERT INTO public.page_revisions (
    page_id, user_id, content, title, description, revision_number, change_summary
  ) VALUES (
    p_page_id, auth.uid(), p_content, p_title, p_description, current_revision, p_change_summary
  );
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_wiki_page_by_path(p_path TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  path TEXT,
  category_id UUID,
  description TEXT,
  tags TEXT[],
  last_edited_by UUID,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    wp.id,
    wp.title,
    wp.slug,
    wp.content,
    wp.path,
    wp.category_id,
    wp.description,
    wp.tags,
    wp.last_edited_by,
    wp.last_edited_at,
    wp.created_at,
    wp.updated_at
  FROM public.wiki_pages wp
  WHERE wp.path = p_path;
$$;

-- 16. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.wiki_pages TO anon, authenticated;
GRANT ALL ON public.wiki_categories TO anon, authenticated;
GRANT ALL ON public.wiki_comments TO anon, authenticated;
GRANT ALL ON public.wiki_edit_sessions TO anon, authenticated;
GRANT ALL ON public.page_revisions TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 17. Create some sample data
INSERT INTO public.wiki_categories (title, slug, description, icon, color) VALUES
('Nordics', 'nordics', 'Main wiki category for the Nordics server', 'globe', '#3b82f6'),
('Towns', 'towns', 'Information about towns and settlements', 'map-pin', '#10b981'),
('Nations', 'nations', 'Information about nations and alliances', 'flag', '#f59e0b'),
('Server Rules', 'server-rules', 'Server rules and guidelines', 'book', '#ef4444'),
('Guides', 'guides', 'Player guides and tutorials', 'help-circle', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- 18. Create sample wiki pages
INSERT INTO public.wiki_pages (title, slug, content, path, category_id, description) VALUES
('Welcome to Nordics', 'welcome', '# Welcome to Nordics

This is the main wiki page for the Nordics server.

## Getting Started

1. Read the server rules
2. Join a town or nation
3. Start building and exploring

## Quick Links

- [Server Rules](/wiki/server-rules)
- [Towns](/wiki/towns)
- [Nations](/wiki/nations)
- [Guides](/wiki/guides)', 'Nordics/README.md', 
(SELECT id FROM public.wiki_categories WHERE slug = 'nordics'), 
'Main welcome page for the Nordics server')
ON CONFLICT (path) DO NOTHING;

-- 19. Test the setup
SELECT 'Wiki system setup complete!' as status;
SELECT COUNT(*) as categories_count FROM public.wiki_categories;
SELECT COUNT(*) as pages_count FROM public.wiki_pages;
SELECT COUNT(*) as storage_policies FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%wiki%'; 