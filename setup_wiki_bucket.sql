-- Setup Wiki Storage Bucket
-- Run this in your Supabase SQL Editor to ensure the wiki bucket exists

-- Create the wiki bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  10485760, -- 10MB limit
  ARRAY['text/markdown', 'text/plain', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the wiki bucket
-- Allow public read access to wiki files
CREATE POLICY "Public read access for wiki bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

-- Allow authenticated users to upload to wiki bucket
CREATE POLICY "Authenticated users can upload to wiki bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update wiki files
CREATE POLICY "Authenticated users can update wiki bucket" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete from wiki bucket
CREATE POLICY "Authenticated users can delete from wiki bucket" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Verify the bucket was created
SELECT 
  'Wiki bucket setup complete!' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'wiki'; 