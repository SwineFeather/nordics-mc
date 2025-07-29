-- Database Diagnostic Script
-- Run this first to see what's missing

-- Check if notification_settings table exists
SELECT 
  'notification_settings' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'notification_settings'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'notification_settings'
    ) THEN 'Table exists'
    ELSE 'Table missing'
  END as status;

-- Check if get_player_profile function exists
SELECT 
  'get_player_profile' as function_name,
  EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'get_player_profile'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'get_player_profile'
    ) THEN 'Function exists'
    ELSE 'Function missing'
  END as status;

-- Check if player_profiles_view exists
SELECT 
  'player_profiles_view' as view_name,
  EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'player_profiles_view'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'player_profiles_view'
    ) THEN 'View exists'
    ELSE 'View missing'
  END as status;

-- Check if profiles table has username column
SELECT 
  'profiles.username' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
    ) THEN 'Column exists'
    ELSE 'Column missing'
  END as status;

-- Check if wiki_comments table exists
SELECT 
  'wiki_comments' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'wiki_comments'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'wiki_comments'
    ) THEN 'Table exists'
    ELSE 'Table missing'
  END as status;

-- Check if wiki_pages table exists
SELECT 
  'wiki_pages' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'wiki_pages'
  ) as exists,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'wiki_pages'
    ) THEN 'Table exists'
    ELSE 'Table missing'
  END as status;

-- Check notification_settings permissions
SELECT 
  'notification_settings permissions' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'notification_settings'
    ) THEN 'Table exists - check RLS policies'
    ELSE 'Table missing'
  END as status; 