-- Create nation gallery table for storing nation photos
-- Migration: 20250131000002_create_nation_gallery.sql

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

-- Create comprehensive security policies for nation_gallery

-- Allow anyone to view approved photos
CREATE POLICY "Nation gallery photos are publicly readable" 
  ON public.nation_gallery 
  FOR SELECT 
  USING (is_approved = true);

-- Allow users to view their own photos (even if not approved)
CREATE POLICY "Users can view their own nation gallery photos" 
  ON public.nation_gallery 
  FOR SELECT 
  USING (auth.uid() = uploaded_by);

-- Allow nation leaders, admins, and moderators to upload photos
CREATE POLICY "Nation leaders and staff can upload nation gallery photos" 
  ON public.nation_gallery 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM nations n
      WHERE n.name = nation_gallery.nation_name 
      AND n.leader_name = (
        SELECT minecraft_username FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Allow nation leaders, admins, and moderators to update photos
CREATE POLICY "Nation leaders and staff can update nation gallery photos" 
  ON public.nation_gallery 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM nations n
      WHERE n.name = nation_gallery.nation_name 
      AND n.leader_name = (
        SELECT minecraft_username FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Allow nation leaders, admins, and moderators to delete photos
CREATE POLICY "Nation leaders and staff can delete nation gallery photos" 
  ON public.nation_gallery 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM nations n
      WHERE n.name = nation_gallery.nation_name 
      AND n.leader_name = (
        SELECT minecraft_username FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Add comments to explain the table structure
COMMENT ON TABLE public.nation_gallery IS 'Stores nation gallery photos with proper Supabase storage integration';
COMMENT ON COLUMN public.nation_gallery.file_path IS 'Storage path in the nation-town-images bucket (e.g., nations/sweden/gallery/1234567890.jpg)';
COMMENT ON COLUMN public.nation_gallery.file_url IS 'Public URL for the image from Supabase storage';
COMMENT ON COLUMN public.nation_gallery.is_approved IS 'Whether the photo has been approved for public viewing';
