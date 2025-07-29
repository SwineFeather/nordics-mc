-- Test Edge Function and Database Connectivity
-- Run this in Supabase SQL Editor

-- 1. Check if towns table exists and has data
SELECT 
  'towns' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as non_null_names
FROM towns;

-- 2. Check if nations table exists and has data
SELECT 
  'nations' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as non_null_names
FROM nations;

-- 3. Test a simple town query
SELECT 
  name,
  mayor_name,
  residents_count,
  balance,
  nation_name
FROM towns 
LIMIT 5;

-- 4. Test a simple nation query
SELECT 
  name,
  leader_name,
  capital_name,
  towns_count,
  balance
FROM nations 
LIMIT 5;

-- 5. Check RLS policies on towns table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'towns';

-- 6. Check RLS policies on nations table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'nations';

-- 7. Check if get_player_profile function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_player_profile';

-- 8. Test get_player_profile function with a sample UUID
-- (Replace with an actual UUID from your players table)
SELECT get_player_profile('test-uuid-1234'); 