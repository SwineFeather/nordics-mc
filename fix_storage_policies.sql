-- Fix Storage Policies and Permissions
-- Run this in your Supabase SQL Editor

-- 1. Create wiki storage bucket with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  10485760, -- 10MB limit
  ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/markdown', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- 2. Create lovable-uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lovable-uploads',
  'lovable-uploads',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];

-- 3. Drop existing storage policies
DROP POLICY IF EXISTS "Wiki files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Public files are accessible by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 4. Create storage policies for wiki bucket
CREATE POLICY "Wiki files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'wiki');

CREATE POLICY "Authenticated users can upload wiki files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wiki' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own wiki files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wiki' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own wiki files" ON storage.objects
  FOR DELETE USING (bucket_id = 'wiki' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Create storage policies for lovable-uploads bucket
CREATE POLICY "Public files are accessible by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'lovable-uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lovable-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'lovable-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'lovable-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Create function to get file URL
CREATE OR REPLACE FUNCTION public.get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT storage.url(bucket_name, file_path);
$$;

-- 7. Create function to upload file to storage
CREATE OR REPLACE FUNCTION public.upload_file_to_storage(
  bucket_name TEXT,
  file_path TEXT,
  file_content BYTEA,
  content_type TEXT DEFAULT 'application/octet-stream'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_url TEXT;
BEGIN
  -- Insert file into storage
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (bucket_name, file_path, auth.uid(), jsonb_build_object('contentType', content_type))
  ON CONFLICT (bucket_id, name) DO UPDATE SET
    metadata = jsonb_build_object('contentType', content_type),
    updated_at = NOW();
  
  -- Get the file URL
  SELECT storage.url(bucket_name, file_path) INTO file_url;
  
  RETURN file_url;
END;
$$;

-- 8. Create function to delete file from storage
CREATE OR REPLACE FUNCTION public.delete_file_from_storage(bucket_name TEXT, file_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = bucket_name 
    AND name = file_path 
    AND owner = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- 9. Create function to list files in bucket
CREATE OR REPLACE FUNCTION public.list_storage_files(bucket_name TEXT, folder_path TEXT DEFAULT '')
RETURNS TABLE (
  name TEXT,
  id UUID,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    name,
    id,
    updated_at,
    created_at,
    last_accessed_at,
    metadata
  FROM storage.objects
  WHERE bucket_id = bucket_name
    AND (folder_path = '' OR name LIKE folder_path || '/%')
  ORDER BY updated_at DESC;
$$;

-- 10. Create function to get file metadata
CREATE OR REPLACE FUNCTION public.get_file_metadata(bucket_name TEXT, file_path TEXT)
RETURNS TABLE (
  name TEXT,
  id UUID,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  size BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    name,
    id,
    updated_at,
    created_at,
    last_accessed_at,
    metadata,
    octet_length(data) as size
  FROM storage.objects
  WHERE bucket_id = bucket_name
    AND name = file_path;
$$;

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects(owner);
CREATE INDEX IF NOT EXISTS idx_storage_objects_updated_at ON storage.objects(updated_at DESC);

-- 12. Create function to clean up orphaned files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete files older than 30 days that don't have an owner
  DELETE FROM storage.objects 
  WHERE owner IS NULL 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Success message
SELECT 'Storage policies and functions fixed successfully!' as status; 