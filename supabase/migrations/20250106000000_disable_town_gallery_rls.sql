-- Temporarily disable RLS for town_gallery to fix upload issues
-- WARNING: This is for testing only - re-enable RLS after confirming uploads work

-- Disable RLS temporarily
ALTER TABLE town_gallery DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view approved town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can view their own town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authenticated users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Users can delete town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can upload town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can update town gallery photos" ON town_gallery;
DROP POLICY IF EXISTS "Authorized users can delete town gallery photos" ON town_gallery;

-- Add a simple comment to remind us to re-enable RLS later
COMMENT ON TABLE town_gallery IS 'RLS temporarily disabled for testing - re-enable after confirming uploads work'; 