-- Create nation gallery table for storing nation photos
-- Migration: 20250131000010_create_nation_gallery.sql
-- This migration creates a nation_gallery table similar to town_gallery

CREATE TABLE IF NOT EXISTS public.nation_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nation_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_username TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nation_gallery_nation_name ON public.nation_gallery(nation_name);
CREATE INDEX IF NOT EXISTS idx_nation_gallery_uploaded_by ON public.nation_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_nation_gallery_uploaded_at ON public.nation_gallery(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_nation_gallery_is_approved ON public.nation_gallery(is_approved);
CREATE INDEX IF NOT EXISTS idx_nation_gallery_tags ON public.nation_gallery USING GIN(tags);

-- Enable RLS
ALTER TABLE public.nation_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Nation gallery photos are publicly readable" 
  ON public.nation_gallery 
  FOR SELECT 
  USING (is_approved = true);

-- Create policies for nation management (nation leaders, admins)
CREATE POLICY "Nation management can manage gallery" 
  ON public.nation_gallery 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE name = nation_gallery.nation_name 
      AND (
        leader_name = (
          SELECT full_name FROM public.profiles WHERE id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'moderator')
        )
      )
    )
  );

-- Create policies for authenticated users to upload photos
CREATE POLICY "Authenticated users can upload nation gallery photos" 
  ON public.nation_gallery 
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.nations 
      WHERE name = nation_gallery.nation_name 
      AND (
        leader_name = (
          SELECT full_name FROM public.profiles WHERE id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'moderator')
        )
      )
    )
  );

-- Create policies for users to update their own photos
CREATE POLICY "Users can update their own nation gallery photos" 
  ON public.nation_gallery 
  FOR UPDATE 
  USING (
    uploaded_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Create policies for users to delete their own photos
CREATE POLICY "Users can delete their own nation gallery photos" 
  ON public.nation_gallery 
  FOR DELETE 
  USING (
    uploaded_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nation_gallery TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.nation_gallery IS 'Nation gallery table for storing nation photos';
COMMENT ON COLUMN public.nation_gallery.nation_name IS 'Name of the nation this photo belongs to';
COMMENT ON COLUMN public.nation_gallery.title IS 'Title of the photo';
COMMENT ON COLUMN public.nation_gallery.description IS 'Description of the photo';
COMMENT ON COLUMN public.nation_gallery.file_path IS 'Storage path of the photo file';
COMMENT ON COLUMN public.nation_gallery.file_url IS 'Public URL of the photo';
COMMENT ON COLUMN public.nation_gallery.tags IS 'Array of tags for the photo';
COMMENT ON COLUMN public.nation_gallery.uploaded_by IS 'User ID who uploaded the photo';
COMMENT ON COLUMN public.nation_gallery.uploaded_by_username IS 'Username of the uploader';
COMMENT ON COLUMN public.nation_gallery.is_approved IS 'Whether the photo is approved for public viewing';
COMMENT ON COLUMN public.nation_gallery.view_count IS 'Number of times the photo has been viewed';

-- Test the migration by checking if the table exists
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed. Checking nation_gallery table...';
  
  -- Check if nation_gallery table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nation_gallery') THEN
    RAISE NOTICE '✓ nation_gallery table exists';
  ELSE
    RAISE NOTICE '✗ nation_gallery table missing';
  END IF;
  
  -- Check if indexes exist
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_nation_gallery_nation_name') THEN
    RAISE NOTICE '✓ nation_name index exists';
  ELSE
    RAISE NOTICE '✗ nation_name index missing';
  END IF;
  
  RAISE NOTICE 'Migration check complete.';
END $$;
