
-- Ensure wiki_categories table exists with proper structure
CREATE TABLE IF NOT EXISTS public.wiki_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ensure wiki_pages table exists with proper structure
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published',
  author_id uuid REFERENCES auth.users(id),
  category_id uuid REFERENCES public.wiki_categories(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  github_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug ON public.wiki_categories(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_order ON public.wiki_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON public.wiki_pages(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_category ON public.wiki_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_order ON public.wiki_pages(order_index);

-- Enable RLS on both tables
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Wiki categories are readable by all" ON public.wiki_categories;
DROP POLICY IF EXISTS "Wiki categories manageable by editors" ON public.wiki_categories;
DROP POLICY IF EXISTS "Wiki pages are readable by all" ON public.wiki_pages;
DROP POLICY IF EXISTS "Wiki pages manageable by editors" ON public.wiki_pages;

-- Create policies for wiki_categories (readable by all, manageable by editors+)
CREATE POLICY "Wiki categories are readable by all" 
  ON public.wiki_categories FOR SELECT 
  USING (true);

CREATE POLICY "Wiki categories manageable by editors" 
  ON public.wiki_categories FOR ALL 
  USING (has_role_or_higher('editor'::app_role));

-- Create policies for wiki_pages (readable by all, manageable by editors+)
CREATE POLICY "Wiki pages are readable by all" 
  ON public.wiki_pages FOR SELECT 
  USING (true);

CREATE POLICY "Wiki pages manageable by editors" 
  ON public.wiki_pages FOR ALL 
  USING (has_role_or_higher('editor'::app_role));

-- Add updated_at trigger for both tables
DROP TRIGGER IF EXISTS set_timestamp_wiki_categories ON public.wiki_categories;
DROP TRIGGER IF EXISTS set_timestamp_wiki_pages ON public.wiki_pages;

CREATE TRIGGER set_timestamp_wiki_categories
  BEFORE UPDATE ON public.wiki_categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_wiki_pages
  BEFORE UPDATE ON public.wiki_pages
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
