-- Fix Wiki Comments System
-- Migration: 20250110000000-fix-wiki-comments.sql

-- 1. Add username column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Update username to match minecraft_username or full_name where possible
UPDATE public.profiles 
SET username = COALESCE(minecraft_username, full_name, email)
WHERE username IS NULL;

-- 3. Create index for username searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 4. Ensure wiki_comments table exists with proper structure
CREATE TABLE IF NOT EXISTS public.wiki_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.wiki_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Enable RLS on wiki_comments if not already enabled
ALTER TABLE public.wiki_comments ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies and recreate them
DROP POLICY IF EXISTS "Anyone can view non-moderated comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.wiki_comments;
DROP POLICY IF EXISTS "Moderators can moderate comments" ON public.wiki_comments;

-- 7. Create proper RLS policies
CREATE POLICY "Anyone can view non-moderated comments" 
  ON public.wiki_comments FOR SELECT 
  USING (is_moderated = false OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create comments" 
  ON public.wiki_comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
  ON public.wiki_comments FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.wiki_comments FOR DELETE 
  TO authenticated 
  USING (auth.uid() = author_id);

CREATE POLICY "Moderators can moderate comments" 
  ON public.wiki_comments FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wiki_comments_page_id ON public.wiki_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_parent_id ON public.wiki_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_author_id ON public.wiki_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_comments_created_at ON public.wiki_comments(created_at);

-- 9. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_comments TO authenticated;
GRANT SELECT ON public.wiki_comments TO anon;

-- 10. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Add trigger to wiki_comments if not exists
DROP TRIGGER IF EXISTS update_wiki_comments_updated_at ON public.wiki_comments;
CREATE TRIGGER update_wiki_comments_updated_at
  BEFORE UPDATE ON public.wiki_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 12. Add some sample wiki pages if they don't exist
INSERT INTO public.wiki_pages (id, title, slug, content, status, category_id, author_id, order_index)
SELECT 
  '550e8400-e29b-41d4-a716-446655440010'::UUID,
  'Nordics General Information',
  'nordics-general-information',
  '# Nordics General Information

Welcome to the Nordics server! This page contains general information about our community.

## About Us
The Nordics Minecraft server is a Towny-survival with a vibrant economy and a custom map based on Northern Europe.

## Getting Started
1. Join our Discord: discord.gg/nordics
2. Read the rules and guidelines
3. Start building your town or kingdom

## Server Features
- Custom map based on Northern Europe
- Towny plugin for town management
- Economy system
- Custom plugins and features',
  'published',
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM public.wiki_pages WHERE slug = 'nordics-general-information'
);

INSERT INTO public.wiki_pages (id, title, slug, content, status, category_id, author_id, order_index)
SELECT 
  '550e8400-e29b-41d4-a716-446655440011'::UUID,
  'The World - Civilization Players',
  'nordics-the-world-civilization-players',
  '# The World - Civilization Players

This page is dedicated to the civilization players in our world.

## What is Civilization?
Civilization players focus on building large, organized settlements with multiple players working together.

## Current Civilizations
- Various player-created civilizations
- Each with their own unique culture and style
- Collaborative building projects

## How to Join
1. Find an existing civilization or start your own
2. Coordinate with other players
3. Contribute to the community',
  'published',
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM public.wiki_pages WHERE slug = 'nordics-the-world-civilization-players'
); 