-- Add forum tags and search functionality
-- Migration: 20250707000000-add-forum-tags-and-search.sql

-- Create forum_tags table
CREATE TABLE IF NOT EXISTS public.forum_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create forum_post_tags junction table
CREATE TABLE IF NOT EXISTS public.forum_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(post_id, tag_id)
);

-- Add tags column to forum_posts for quick access
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Add search_vector column for full-text search
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS forum_posts_search_vector_idx ON public.forum_posts USING GIN (search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_forum_post_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_forum_post_search_vector ON public.forum_posts;
CREATE TRIGGER trigger_update_forum_post_search_vector
  BEFORE INSERT OR UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_forum_post_search_vector();

-- Function to update tags JSON column when post_tags change
CREATE OR REPLACE FUNCTION public.update_forum_post_tags_json()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts 
    SET tags = (
      SELECT jsonb_agg(t.name)
      FROM public.forum_post_tags pt
      JOIN public.forum_tags t ON pt.tag_id = t.id
      WHERE pt.post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts 
    SET tags = (
      SELECT COALESCE(jsonb_agg(t.name), '[]'::jsonb)
      FROM public.forum_post_tags pt
      JOIN public.forum_tags t ON pt.tag_id = t.id
      WHERE pt.post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tags JSON when post_tags change
DROP TRIGGER IF EXISTS trigger_update_forum_post_tags_json ON public.forum_post_tags;
CREATE TRIGGER trigger_update_forum_post_tags_json
  AFTER INSERT OR DELETE ON public.forum_post_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_forum_post_tags_json();

-- Enable RLS
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_tags
CREATE POLICY "Anyone can view forum tags" ON public.forum_tags FOR SELECT USING (true);
CREATE POLICY "Only moderators can manage forum tags" ON public.forum_tags FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

-- RLS Policies for forum_post_tags
CREATE POLICY "Anyone can view forum post tags" ON public.forum_post_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add tags to their posts" ON public.forum_post_tags FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.forum_posts 
    WHERE id = post_id AND author_id = auth.uid()
  )
);
CREATE POLICY "Users can remove tags from their posts or moderators can remove any" ON public.forum_post_tags FOR DELETE USING (
  auth.uid() = (SELECT author_id FROM public.forum_posts WHERE id = post_id) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

-- Insert default tags
INSERT INTO public.forum_tags (name, color, description) VALUES
  ('help', '#3b82f6', 'Questions and help requests'),
  ('discussion', '#10b981', 'General discussions'),
  ('suggestion', '#f59e0b', 'Feature suggestions and ideas'),
  ('bug', '#ef4444', 'Bug reports and issues'),
  ('announcement', '#8b5cf6', 'Official announcements'),
  ('guide', '#06b6d4', 'Tutorials and guides'),
  ('showcase', '#ec4899', 'Player creations and showcases'),
  ('news', '#84cc16', 'Server news and updates')
ON CONFLICT (name) DO NOTHING;

-- Update existing posts to have empty tags array
UPDATE public.forum_posts SET tags = '[]'::jsonb WHERE tags IS NULL;

-- Update search vectors for existing posts
UPDATE public.forum_posts SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'B')
WHERE search_vector IS NULL; 