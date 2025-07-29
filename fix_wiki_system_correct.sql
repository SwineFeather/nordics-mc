-- Complete Wiki System Fix - Based on Actual Table Structures
-- Run this in your Supabase SQL Editor

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
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  meta_description TEXT,
  tags TEXT[],
  parent_page_id UUID REFERENCES public.wiki_pages(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0
);

-- 3. Create wiki_categories table
CREATE TABLE IF NOT EXISTS public.wiki_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create wiki_comments table
CREATE TABLE IF NOT EXISTS public.wiki_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- 5. Create wiki_edit_sessions table
CREATE TABLE IF NOT EXISTS public.wiki_edit_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 6. Create page_revisions table
CREATE TABLE IF NOT EXISTS public.page_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable RLS on all tables
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_edit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for wiki_pages
DROP POLICY IF EXISTS "Wiki pages are viewable by everyone" ON public.wiki_pages;
CREATE POLICY "Wiki pages are viewable by everyone" ON public.wiki_pages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create wiki pages" ON public.wiki_pages;
CREATE POLICY "Authenticated users can create wiki pages" ON public.wiki_pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own wiki pages" ON public.wiki_pages;
CREATE POLICY "Users can update their own wiki pages" ON public.wiki_pages
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
  ));

DROP POLICY IF EXISTS "Admins can delete wiki pages" ON public.wiki_pages;
CREATE POLICY "Admins can delete wiki pages" ON public.wiki_pages
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- 9. Create RLS policies for wiki_categories
DROP POLICY IF EXISTS "Wiki categories are viewable by everyone" ON public.wiki_categories;
CREATE POLICY "Wiki categories are viewable by everyone" ON public.wiki_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage wiki categories" ON public.wiki_categories;
CREATE POLICY "Admins can manage wiki categories" ON public.wiki_categories
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- 10. Create RLS policies for wiki_comments
DROP POLICY IF EXISTS "Wiki comments are viewable by everyone" ON public.wiki_comments;
CREATE POLICY "Wiki comments are viewable by everyone" ON public.wiki_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.wiki_comments;
CREATE POLICY "Authenticated users can create comments" ON public.wiki_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own comments" ON public.wiki_comments;
CREATE POLICY "Users can update their own comments" ON public.wiki_comments
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
  ));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.wiki_comments;
CREATE POLICY "Users can delete their own comments" ON public.wiki_comments
  FOR DELETE USING (auth.uid() = author_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true OR is_moderator = true
  ));

-- 11. Create RLS policies for wiki_edit_sessions
DROP POLICY IF EXISTS "Users can manage their own edit sessions" ON public.wiki_edit_sessions;
CREATE POLICY "Users can manage their own edit sessions" ON public.wiki_edit_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 12. Create RLS policies for page_revisions
DROP POLICY IF EXISTS "Page revisions are viewable by everyone" ON public.page_revisions;
CREATE POLICY "Page revisions are viewable by everyone" ON public.page_revisions
  FOR SELECT USING (true);

-- 13. Create storage policies for wiki bucket
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

-- 14. Create indexes
CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON public.wiki_pages(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_category ON public.wiki_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_author ON public.wiki_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_published ON public.wiki_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_featured ON public.wiki_pages(is_featured);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_tags ON public.wiki_pages USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_wiki_comments_page ON public.wiki_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_author ON public.wiki_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_parent ON public.wiki_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_user ON public.wiki_edit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_page ON public.wiki_edit_sessions(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_sessions_active ON public.wiki_edit_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page ON public.page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_author ON public.page_revisions(author_id);

-- 15. Insert default categories
INSERT INTO public.wiki_categories (name, slug, description, sort_order) VALUES
  ('General', 'general', 'General wiki pages', 1),
  ('Towns', 'towns', 'Information about towns', 2),
  ('Nations', 'nations', 'Information about nations', 3),
  ('Rules', 'rules', 'Server rules and guidelines', 4),
  ('Guides', 'guides', 'Helpful guides and tutorials', 5)
ON CONFLICT (slug) DO NOTHING;

-- 16. Create helper functions
CREATE OR REPLACE FUNCTION public.get_wiki_page_by_slug(page_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  category_id UUID,
  author_id UUID,
  is_published BOOLEAN,
  is_featured BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_description TEXT,
  tags TEXT[],
  parent_page_id UUID,
  sort_order INTEGER,
  category_name TEXT,
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
    wp.category_id,
    wp.author_id,
    wp.is_published,
    wp.is_featured,
    wp.view_count,
    wp.created_at,
    wp.updated_at,
    wp.published_at,
    wp.meta_description,
    wp.tags,
    wp.parent_page_id,
    wp.sort_order,
    wc.name as category_name,
    p.full_name as author_name
  FROM public.wiki_pages wp
  LEFT JOIN public.wiki_categories wc ON wp.category_id = wc.id
  LEFT JOIN public.profiles p ON wp.author_id = p.id
  WHERE wp.slug = page_slug
  AND wp.is_published = true;
$$;

-- 17. Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_wiki_page_views(page_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wiki_pages 
  SET view_count = view_count + 1
  WHERE id = page_id_param;
END;
$$;

-- 18. Create function to create wiki page automatically for towns/nations
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
BEGIN
  -- Determine if this is a town or nation
  IF TG_TABLE_NAME = 'towns' THEN
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
  INSERT INTO public.wiki_pages (title, slug, content, is_published, tags)
  VALUES (page_title, page_slug, page_content, true, ARRAY[TG_TABLE_NAME])
  RETURNING id INTO new_page_id;

  RETURN NEW;
END;
$$;

-- 19. Create triggers for automatic wiki page creation
DROP TRIGGER IF EXISTS trigger_create_town_wiki_page ON public.towns;
CREATE TRIGGER trigger_create_town_wiki_page
  AFTER INSERT ON public.towns
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wiki_page_automatically();

DROP TRIGGER IF EXISTS trigger_create_nation_wiki_page ON public.nations;
CREATE TRIGGER trigger_create_nation_wiki_page
  AFTER INSERT ON public.nations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wiki_page_automatically();

-- 20. Create sample wiki pages
INSERT INTO public.wiki_pages (title, slug, content, is_published, tags, category_id) VALUES
  ('Welcome to Nordics Nexus', 'welcome', '# Welcome to Nordics Nexus

Welcome to the official wiki for Nordics Nexus! This is your comprehensive guide to everything about our server.

## Getting Started

- [Server Rules](rules)
- [Town Guide](guides/towns)
- [Nation Guide](guides/nations)

## Quick Links

- [Player Statistics](statistics)
- [Server Map](map)
- [Community Forums](forums)

This wiki is maintained by the community. Feel free to contribute!', true, ARRAY['general', 'welcome'], (SELECT id FROM public.wiki_categories WHERE slug = 'general'))
ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Wiki system setup completed successfully!' as status; 