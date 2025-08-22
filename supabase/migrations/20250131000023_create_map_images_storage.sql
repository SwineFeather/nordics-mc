-- Create storage bucket for map images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'map-images',
  'map-images',
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policy to allow public read access
CREATE POLICY "Public read access for map images" ON storage.objects
  FOR SELECT USING (bucket_id = 'map-images');

-- Create storage policy to allow authenticated users to upload (for admins)
CREATE POLICY "Authenticated users can upload map images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'map-images' 
    AND auth.role() = 'authenticated'
  );

-- Create storage policy to allow authenticated users to update (for admins)
CREATE POLICY "Authenticated users can update map images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'map-images' 
    AND auth.role() = 'authenticated'
  );

-- Create storage policy to allow authenticated users to delete (for admins)
CREATE POLICY "Authenticated users can delete map images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'map-images' 
    AND auth.role() = 'authenticated'
  );
