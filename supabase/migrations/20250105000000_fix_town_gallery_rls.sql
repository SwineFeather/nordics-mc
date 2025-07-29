-- Fix town_gallery RLS policies with simpler logic

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can view their own town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can delete town gallery photos" ON town_gallery;

-- Create simplified RLS policies

-- Allow anyone to view approved photos
CREATE POLICY "Anyone can view approved town gallery photos" ON town_gallery
  FOR SELECT USING (is_approved = true);

-- Allow authenticated users to view their own photos (even if not approved)
CREATE POLICY "Users can view their own town gallery photos" ON town_gallery
  FOR SELECT USING (auth.uid() = uploaded_by);

-- Allow authenticated users to upload photos (permissions checked in application logic)
CREATE POLICY "Authenticated users can upload town gallery photos" ON town_gallery
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own photos or if they have admin/moderator role
CREATE POLICY "Users can update town gallery photos" ON town_gallery
  FOR UPDATE USING (
    auth.uid() = uploaded_by 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Allow users to delete their own photos or if they have admin/moderator role
CREATE POLICY "Users can delete town gallery photos" ON town_gallery
  FOR DELETE USING (
    auth.uid() = uploaded_by 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  ); 