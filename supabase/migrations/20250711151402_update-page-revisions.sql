-- Update existing page_revisions table to add missing columns for new versioning system

-- Add missing columns to existing page_revisions table
ALTER TABLE public.page_revisions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS revision_number INTEGER,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

-- Rename revision_note to comment for consistency
ALTER TABLE public.page_revisions 
RENAME COLUMN revision_note TO comment;

-- Update existing revisions to have proper revision numbers
-- This will set revision_number = 1 for all existing revisions
UPDATE public.page_revisions 
SET revision_number = 1 
WHERE revision_number IS NULL;

-- Make revision_number NOT NULL after setting default values
ALTER TABLE public.page_revisions 
ALTER COLUMN revision_number SET NOT NULL;

-- Set the most recent revision for each page as current
UPDATE public.page_revisions 
SET is_current = TRUE 
WHERE id IN (
  SELECT DISTINCT ON (page_id) id 
  FROM public.page_revisions 
  ORDER BY page_id, created_at DESC
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id ON public.page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_author_id ON public.page_revisions(author_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_created_at ON public.page_revisions(created_at);

-- Add unique constraint to ensure one current revision per page
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_revisions_current ON public.page_revisions(page_id) WHERE is_current = TRUE;

-- Drop old policies and create new ones
DROP POLICY IF EXISTS "Anyone can view revisions of accessible pages" ON public.page_revisions;
DROP POLICY IF EXISTS "System can create revisions" ON public.page_revisions;

-- Users can view all revisions
CREATE POLICY "Users can view page revisions" ON public.page_revisions
  FOR SELECT USING (true);

-- Staff can create revisions
CREATE POLICY "Staff can create page revisions" ON public.page_revisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator', 'editor')
    )
  );

-- Staff can update revisions
CREATE POLICY "Staff can update page revisions" ON public.page_revisions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator', 'editor')
    )
  );

-- Drop old function and create new one
DROP FUNCTION IF EXISTS public.create_page_revision() CASCADE;

-- Function to create a new revision
CREATE OR REPLACE FUNCTION create_page_revision(
  p_page_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_status TEXT DEFAULT 'draft',
  p_comment TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_revision_id UUID;
  next_revision_number INTEGER;
BEGIN
  -- Get the next revision number
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO next_revision_number
  FROM page_revisions
  WHERE page_id = p_page_id;
  
  -- Set all existing revisions as not current
  UPDATE page_revisions 
  SET is_current = FALSE 
  WHERE page_id = p_page_id;
  
  -- Create new revision
  INSERT INTO page_revisions (
    page_id, 
    title, 
    content, 
    status, 
    author_id, 
    revision_number, 
    comment, 
    is_current
  ) VALUES (
    p_page_id,
    p_title,
    p_content,
    p_status,
    auth.uid(),
    next_revision_number,
    p_comment,
    TRUE
  ) RETURNING id INTO new_revision_id;
  
  RETURN new_revision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a page to a specific revision
CREATE OR REPLACE FUNCTION restore_page_revision(p_revision_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  revision_record RECORD;
BEGIN
  -- Get the revision details
  SELECT * INTO revision_record
  FROM page_revisions
  WHERE id = p_revision_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the page with revision data
  UPDATE wiki_pages
  SET 
    title = revision_record.title,
    content = revision_record.content,
    status = revision_record.status,
    updated_at = NOW()
  WHERE id = revision_record.page_id;
  
  -- Create a new revision for the restore action
  PERFORM create_page_revision(
    revision_record.page_id,
    revision_record.title,
    revision_record.content,
    revision_record.status,
    'Restored from revision ' || revision_record.revision_number
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
