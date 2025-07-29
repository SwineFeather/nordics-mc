-- Add image_url field to nations table for nation leader uploaded images
-- Migration: 20250128000000_add_nation_image_field.sql

-- Add the image_url column to the nations table
ALTER TABLE public.nations 
ADD COLUMN image_url TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.image_url IS 'URL to the nation image uploaded by the nation leader. Should be a direct link to an image hosted externally (e.g., Discord, Imgur, etc.)';

-- Create an index for better performance when querying by image_url
CREATE INDEX IF NOT EXISTS idx_nations_image_url ON public.nations(image_url);

-- Update RLS policies to allow nation leaders to update their own nation's image
-- First, drop the existing policy
DROP POLICY IF EXISTS "Staff can manage nations" ON public.nations;

-- Create new policy that allows both staff and nation leaders to manage nations
CREATE POLICY "Staff and nation leaders can manage nations" 
  ON public.nations 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE leader = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE leader = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  ); 