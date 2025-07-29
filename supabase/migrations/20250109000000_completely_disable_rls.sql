-- Completely disable RLS and remove all policies for town_gallery
-- This is a nuclear option to get uploads working

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

-- Check if RLS is actually disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS IS STILL ENABLED - PROBLEM!'
    ELSE 'RLS IS DISABLED - GOOD!'
  END as status
FROM pg_tables 
WHERE tablename = 'town_gallery';

-- Show any remaining policies
SELECT 
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN 'POLICY STILL EXISTS - PROBLEM!'
    ELSE 'NO POLICIES - GOOD!'
  END as status
FROM pg_policies 
WHERE tablename = 'town_gallery'; 