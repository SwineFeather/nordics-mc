-- Update town gallery table structure and policies for proper Supabase storage
-- Migration: 20250130000000_update_town_gallery_storage.sql

-- Ensure the town_gallery table exists with correct structure
CREATE TABLE IF NOT EXISTS public.town_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_name TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_town_gallery_town_name ON public.town_gallery(town_name);
CREATE INDEX IF NOT EXISTS idx_town_gallery_uploaded_by ON public.town_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_town_gallery_uploaded_at ON public.town_gallery(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_town_gallery_is_approved ON public.town_gallery(is_approved);
CREATE INDEX IF NOT EXISTS idx_town_gallery_tags ON public.town_gallery USING GIN(tags);

-- Enable RLS
ALTER TABLE public.town_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Town gallery photos are publicly readable" ON public.town_gallery;
DROP POLICY IF EXISTS "Users can view their own town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Authenticated users can upload town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Users can update town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Users can delete town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Anyone can view approved town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Authorized users can upload town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Authorized users can update town gallery photos" ON public.town_gallery;
DROP POLICY IF EXISTS "Authorized users can delete town gallery photos" ON public.town_gallery;

-- Create new RLS policies for the updated storage system

-- Allow anyone to view approved photos
CREATE POLICY "Town gallery photos are publicly readable" 
  ON public.town_gallery 
  FOR SELECT 
  USING (is_approved = true);

-- Allow users to view their own photos (even if not approved)
CREATE POLICY "Users can view their own town gallery photos" 
  ON public.town_gallery 
  FOR SELECT 
  USING (auth.uid() = uploaded_by);

-- Allow town mayors, co-mayors, and admins to upload photos
CREATE POLICY "Town mayors and co-mayors can upload town gallery photos" 
  ON public.town_gallery 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
  );

-- Allow town mayors, co-mayors, and admins to update photos
CREATE POLICY "Town mayors and co-mayors can update town gallery photos" 
  ON public.town_gallery 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
  );

-- Allow town mayors, co-mayors, and admins to delete photos
CREATE POLICY "Town mayors and co-mayors can delete town gallery photos" 
  ON public.town_gallery 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM towns t
      WHERE t.name = town_name 
      AND (
        t.mayor_name = (
          SELECT minecraft_username FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
          WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
          AND (resident->>'is_co_mayor')::boolean = true
        )
      )
    )
  );

-- Add comments to explain the table structure
COMMENT ON TABLE public.town_gallery IS 'Stores town gallery photos with proper Supabase storage integration';
COMMENT ON COLUMN public.town_gallery.file_path IS 'Storage path in the nation-town-images bucket (e.g., towns/stockholm/gallery/1234567890.jpg)';
COMMENT ON COLUMN public.town_gallery.file_url IS 'Public URL for the image from Supabase storage';
COMMENT ON COLUMN public.town_gallery.is_approved IS 'Whether the photo has been approved for public viewing'; 