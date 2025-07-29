-- Add Wiki Save Function Migration
-- This migration adds the save_wiki_page_to_db function needed for wiki editing

-- Create function to save wiki page to database
CREATE OR REPLACE FUNCTION public.save_wiki_page_to_db(
  page_slug TEXT,
  page_title TEXT,
  page_content TEXT,
  page_status TEXT DEFAULT 'published',
  page_category_id UUID DEFAULT NULL,
  page_description TEXT DEFAULT NULL,
  page_tags TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if page exists
  SELECT id INTO page_id FROM public.wiki_pages WHERE slug = page_slug;
  
  IF page_id IS NOT NULL THEN
    -- Update existing page
    UPDATE public.wiki_pages SET
      title = page_title,
      content = page_content,
      status = page_status,
      category_id = page_category_id,
      description = page_description,
      tags = page_tags,
      last_edited_by = current_user_id,
      last_edited_at = NOW(),
      updated_at = NOW()
    WHERE id = page_id;
    
    -- Create revision
    INSERT INTO public.page_revisions (
      page_id,
      title,
      content,
      author_id,
      revision_number,
      status
    ) VALUES (
      page_id,
      page_title,
      page_content,
      current_user_id,
      COALESCE((SELECT MAX(revision_number) FROM public.page_revisions WHERE page_id = page_id), 0) + 1,
      page_status
    );
  ELSE
    -- Create new page
    INSERT INTO public.wiki_pages (
      title,
      slug,
      content,
      status,
      category_id,
      description,
      tags,
      author_id,
      last_edited_by,
      is_public,
      allow_comments,
      allow_editing
    ) VALUES (
      page_title,
      page_slug,
      page_content,
      page_status,
      page_category_id,
      page_description,
      page_tags,
      current_user_id,
      current_user_id,
      true,
      true,
      true
    ) RETURNING id INTO page_id;
    
    -- Create initial revision
    INSERT INTO public.page_revisions (
      page_id,
      title,
      content,
      author_id,
      revision_number,
      status
    ) VALUES (
      page_id,
      page_title,
      page_content,
      current_user_id,
      1,
      page_status
    );
  END IF;
  
  RETURN page_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.save_wiki_page_to_db(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT[]) TO authenticated;

-- Drop existing function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS public.get_wiki_page_from_db(TEXT);

-- Create function to get wiki page from database
CREATE OR REPLACE FUNCTION public.get_wiki_page_from_db(page_slug TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  status TEXT,
  category_id UUID,
  description TEXT,
  tags TEXT[],
  author_id UUID,
  last_edited_by UUID,
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_public BOOLEAN,
  allow_comments BOOLEAN,
  allow_editing BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.id,
    wp.title,
    wp.slug,
    wp.content,
    wp.status,
    wp.category_id,
    wp.description,
    wp.tags,
    wp.author_id,
    wp.last_edited_by,
    wp.last_edited_at,
    wp.created_at,
    wp.updated_at,
    wp.is_public,
    wp.allow_comments,
    wp.allow_editing
  FROM public.wiki_pages wp
  WHERE wp.slug = page_slug
    AND (wp.is_public = true OR auth.uid() IS NOT NULL);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_wiki_page_from_db(TEXT) TO authenticated; 