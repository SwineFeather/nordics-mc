
-- Add github_path column to wiki_pages table
ALTER TABLE public.wiki_pages 
ADD COLUMN github_path text;
