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

-- Nation leaders and staff can update nation-town-images
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

-- Town mayors and co-mayors can update town images and gallery photos
CREATE POLICY "Town mayors and co-mayors can update town-town-images" ON storage.objects
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
          SELECT 1 FROM towns 
          WHERE towns.mayor_name = (
            SELECT minecraft_username FROM profiles WHERE profiles.id = auth.uid()
          )
          AND (
            storage.objects.name LIKE '%' || LOWER(towns.name) || '.png'
            OR storage.objects.name LIKE '%' || LOWER(towns.name) || '/gallery/%'
          )
        )
        OR
        EXISTS (
          SELECT 1 FROM towns t
          WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
            WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE profiles.id = auth.uid())
            AND (resident->>'is_co_mayor')::boolean = true
          )
          AND (
            storage.objects.name LIKE '%' || LOWER(t.name) || '.png'
            OR storage.objects.name LIKE '%' || LOWER(t.name) || '/gallery/%'
          )
        )
      )
    )
  );

-- Nation leaders and staff can delete nation-town-images
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

-- Town mayors and co-mayors can delete town images and gallery photos
CREATE POLICY "Town mayors and co-mayors can delete town-town-images" ON storage.objects
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
          SELECT 1 FROM towns 
          WHERE towns.mayor_name = (
            SELECT minecraft_username FROM profiles WHERE profiles.id = auth.uid()
          )
          AND (
            storage.objects.name LIKE '%' || LOWER(towns.name) || '.png'
            OR storage.objects.name LIKE '%' || LOWER(towns.name) || '/gallery/%'
          )
        )
        OR
        EXISTS (
          SELECT 1 FROM towns t
          WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.residents) AS resident
            WHERE resident->>'name' = (SELECT minecraft_username FROM profiles WHERE profiles.id = auth.uid())
            AND (resident->>'is_co_mayor')::boolean = true
          )
          AND (
            storage.objects.name LIKE '%' || LOWER(t.name) || '.png'
            OR storage.objects.name LIKE '%' || LOWER(t.name) || '/gallery/%'
          )
        )
      )
    )
  ); 