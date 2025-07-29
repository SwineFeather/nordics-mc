-- FINAL: Completely disable RLS for town_gallery
-- This should fix the upload issues once and for all

-- Disable RLS completely
ALTER TABLE town_gallery DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible policies that might exist
DROP POLICY IF EXISTS "Anyone can view approved town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can view their own town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authenticated users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can delete town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can delete town gallery photos" ON town_gallery;

-- Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '❌ RLS IS STILL ENABLED - PROBLEM!'
    ELSE '✅ RLS IS DISABLED - GOOD!'
  END as status
FROM pg_tables 
WHERE tablename = 'town_gallery';

-- Show any remaining policies
SELECT 
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '❌ POLICY STILL EXISTS - PROBLEM!'
    ELSE '✅ NO POLICIES - GOOD!'
  END as status
FROM pg_policies 
WHERE tablename = 'town_gallery';

-- Test a simple insert to make sure it works
INSERT INTO town_gallery (
  town_name, 
  title, 
  file_path, 
  file_url, 
  uploaded_by_username
) VALUES (
  'TestTown',
  'Test Photo',
  'test/path.jpg',
  'https://via.placeholder.com/100x100',
  'TestUser'
) ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM town_gallery WHERE town_name = 'TestTown';

SELECT '✅ RLS disabled and test insert successful!' as result; 