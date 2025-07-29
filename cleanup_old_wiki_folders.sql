-- Cleanup old wiki folders
-- This script removes the old capitalized folders and the-world folders
-- Run this in your Supabase SQL Editor

-- Delete files from old capitalized Towns folder
DELETE FROM storage.objects 
WHERE bucket_id = 'wiki' 
AND name LIKE 'Nordics/Towns/%';

-- Delete files from old capitalized Nations folder  
DELETE FROM storage.objects 
WHERE bucket_id = 'wiki' 
AND name LIKE 'Nordics/Nations/%';

-- Delete files from old the-world/towns folder
DELETE FROM storage.objects 
WHERE bucket_id = 'wiki' 
AND name LIKE 'Nordics/the-world/towns/%';

-- Delete files from old the-world/nations folder
DELETE FROM storage.objects 
WHERE bucket_id = 'wiki' 
AND name LIKE 'Nordics/the-world/nations/%';

-- Verify cleanup
SELECT 
  'Remaining files in wiki bucket:' as status,
  COUNT(*) as total_files
FROM storage.objects 
WHERE bucket_id = 'wiki';

-- Show remaining structure
SELECT 
  name,
  created_at
FROM storage.objects 
WHERE bucket_id = 'wiki'
ORDER BY name; 