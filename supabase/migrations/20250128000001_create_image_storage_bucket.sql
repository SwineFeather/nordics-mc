-- Create storage bucket for nation and town images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nation-town-images',
  'nation-town-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
);

-- Create RLS policies for the storage bucket
CREATE POLICY "Public read access for nation-town-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'nation-town-images');

CREATE POLICY "Authenticated users can upload nation-town-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'nation-town-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Nation leaders and staff can update nation-town-images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'nation-town-images' 
    AND (
      auth.role() = 'authenticated' 
      AND (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'moderator')
        )
        OR
        EXISTS (
          SELECT 1 FROM nations 
          WHERE nations.leader_name = (
            SELECT full_name FROM profiles WHERE profiles.id = auth.uid()
          )
          AND storage.objects.name LIKE '%' || LOWER(nations.name) || '.png'
        )
      )
    )
  );

CREATE POLICY "Nation leaders and staff can delete nation-town-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'nation-town-images' 
    AND (
      auth.role() = 'authenticated' 
      AND (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'moderator')
        )
        OR
        EXISTS (
          SELECT 1 FROM nations 
          WHERE nations.leader_name = (
            SELECT full_name FROM profiles WHERE profiles.id = auth.uid()
          )
          AND storage.objects.name LIKE '%' || LOWER(nations.name) || '.png'
        )
      )
    )
  ); 