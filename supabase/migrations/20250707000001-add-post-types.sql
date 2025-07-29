-- Add post types to forum posts
-- Migration: 20250707000001-add-post-types.sql

-- Create post_types enum
CREATE TYPE public.post_type AS ENUM (
  'discussion',
  'question', 
  'idea',
  'announcement',
  'guide',
  'showcase'
);

-- Add post_type column to forum_posts
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS post_type public.post_type DEFAULT 'discussion';

-- Create index for fast filtering by post type
CREATE INDEX IF NOT EXISTS forum_posts_post_type_idx ON public.forum_posts(post_type);

-- Update existing posts to have a default post type
UPDATE public.forum_posts SET post_type = 'discussion' WHERE post_type IS NULL; 