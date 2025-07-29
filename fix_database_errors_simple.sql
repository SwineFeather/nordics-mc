-- Simple Database Fix - Run this in Supabase SQL Editor
-- This fixes the most critical errors without dropping tables

-- 1. Fix notification_settings table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_settings TO authenticated;

-- 2. Fix get_player_profile function
CREATE OR REPLACE FUNCTION public.get_player_profile(player_uuid_param TEXT)
RETURNS TABLE (
  uuid TEXT,
  username TEXT,
  level INTEGER,
  total_xp BIGINT,
  first_joined TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  stats JSONB,
  ranks JSONB,
  medals JSONB,
  stats_updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.uuid,
    p.name as username,
    COALESCE(p.level, 1) as level,
    COALESCE(p.total_xp, 0) as total_xp,
    p.created_at as first_joined,
    CASE 
      WHEN p.last_seen IS NOT NULL THEN 
        CASE 
          WHEN p.last_seen > 1000000000000 THEN 
            to_timestamp(p.last_seen / 1000)
          ELSE 
            to_timestamp(p.last_seen)
        END
      ELSE p.created_at
    END as last_seen,
    false as is_online,
    p.created_at,
    COALESCE(ps.stats, '{}'::jsonb) as stats,
    '{}'::jsonb as ranks,
    '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
    COALESCE(ps.updated_at, p.updated_at) as stats_updated_at
  FROM public.players p
  LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid
  WHERE p.uuid = player_uuid_param;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_profile(TEXT) TO anon;

-- 3. Fix player_profiles_view
CREATE OR REPLACE VIEW public.player_profiles_view AS
SELECT 
  p.uuid,
  p.name as username,
  COALESCE(p.level, 1) as level,
  COALESCE(p.total_xp, 0) as total_xp,
  p.created_at as first_joined,
  CASE 
    WHEN p.last_seen IS NOT NULL THEN 
      CASE 
        WHEN p.last_seen > 1000000000000 THEN 
          to_timestamp(p.last_seen / 1000)
        ELSE 
          to_timestamp(p.last_seen)
      END
    ELSE p.created_at
  END as last_seen,
  false as is_online,
  p.created_at,
  COALESCE(ps.stats, '{}'::jsonb) as stats,
  '{}'::jsonb as ranks,
  '{"points": 0, "gold": 0, "silver": 0, "bronze": 0}'::jsonb as medals,
  COALESCE(ps.updated_at, p.updated_at) as stats_updated_at
FROM public.players p
LEFT JOIN public.player_stats ps ON p.uuid = ps.player_uuid;

GRANT SELECT ON public.player_profiles_view TO authenticated;
GRANT SELECT ON public.player_profiles_view TO anon;

-- 4. Fix profiles table username column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE public.profiles 
SET username = minecraft_username 
WHERE username IS NULL AND minecraft_username IS NOT NULL;

UPDATE public.profiles 
SET username = full_name 
WHERE username IS NULL AND full_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 5. Ensure all necessary tables exist
CREATE TABLE IF NOT EXISTS public.wiki_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  category_id UUID,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Enable RLS and create policies
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Anyone can view comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.wiki_comments;

DROP POLICY IF EXISTS "Anyone can view published pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Authenticated users can create pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.wiki_pages;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.wiki_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.wiki_categories;

-- Create new policies
CREATE POLICY "Anyone can view comments" ON public.wiki_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.wiki_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON public.wiki_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON public.wiki_comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view published pages" ON public.wiki_pages FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create pages" ON public.wiki_pages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own pages" ON public.wiki_pages FOR UPDATE USING (auth.uid() = author_id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Users can delete their own pages" ON public.wiki_pages FOR DELETE USING (auth.uid() = author_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Anyone can view categories" ON public.wiki_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.wiki_categories FOR ALL USING (auth.role() = 'authenticated');

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_comments TO authenticated;
GRANT SELECT ON public.wiki_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_pages TO authenticated;
GRANT SELECT ON public.wiki_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_categories TO authenticated;
GRANT SELECT ON public.wiki_categories TO anon;

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_wiki_comments_page_id ON public.wiki_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_author_id ON public.wiki_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_parent_id ON public.wiki_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_created_at ON public.wiki_comments(created_at);

-- 9. Ensure players table has all necessary columns
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS first_joined TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.players 
SET username = name 
WHERE username IS NULL AND name IS NOT NULL;

-- 10. Create missing handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Database errors fix completed successfully!' as status; 