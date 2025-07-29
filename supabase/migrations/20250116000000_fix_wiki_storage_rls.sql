-- Fix wiki storage RLS policies to allow file uploads
-- Migration: 20250116000000_fix_wiki_storage_rls.sql

-- Drop any existing policies for the wiki bucket
DROP POLICY IF EXISTS "Public read access for wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wiki" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from wiki" ON storage.objects;

-- Create new policies for the wiki bucket

-- Allow public read access to wiki files
CREATE POLICY "Public read access for wiki" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

-- Allow authenticated users to upload files to wiki
CREATE POLICY "Authenticated users can upload to wiki" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update files in wiki
CREATE POLICY "Authenticated users can update wiki" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete files from wiki
CREATE POLICY "Authenticated users can delete from wiki" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wiki' 
    AND auth.role() = 'authenticated'
  );

-- Verify the policies were created (using correct column names)
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%wiki%'
ORDER BY policyname; 