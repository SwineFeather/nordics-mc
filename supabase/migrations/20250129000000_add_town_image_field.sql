-- Add image_url field to towns table for town mayor uploaded images
-- Migration: 20250129000000_add_town_image_field.sql

-- Add the image_url column to the towns table
ALTER TABLE public.towns 
ADD COLUMN image_url TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN public.towns.image_url IS 'URL to the town image uploaded by the town mayor. Should be a direct link to an image hosted externally (e.g., Discord, Imgur, etc.) or Supabase storage.';

-- Create an index for better performance when querying by image_url
CREATE INDEX IF NOT EXISTS idx_towns_image_url ON public.towns(image_url);

-- Update RLS policies to allow town mayors to update their own town's image
-- Note: This assumes you have existing RLS policies for towns
-- You may need to adjust these based on your existing policies

-- Example policy for town mayors to update their own town's image_url
-- (Uncomment and modify as needed based on your existing RLS setup)
/*
CREATE POLICY "Town mayors can update their own town image" 
  ON public.towns 
  FOR UPDATE 
  USING (
    mayor = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
  );
*/ 