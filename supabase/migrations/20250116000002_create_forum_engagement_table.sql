-- Create forum_post_engagement table for storing user engagement (likes/dislikes)
-- Migration: 20250116000002_create_forum_engagement_table.sql

-- Create the forum_post_engagement table
CREATE TABLE IF NOT EXISTS public.forum_post_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  liked BOOLEAN DEFAULT false,
  disliked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_post_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to manage their own engagement" ON public.forum_post_engagement
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to engagement data" ON public.forum_post_engagement
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_post_id ON public.forum_post_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_user_id ON public.forum_post_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_liked ON public.forum_post_engagement(liked);
CREATE INDEX IF NOT EXISTS idx_forum_post_engagement_disliked ON public.forum_post_engagement(disliked);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_post_engagement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_forum_post_engagement_updated_at
  BEFORE UPDATE ON public.forum_post_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_engagement_updated_at(); 