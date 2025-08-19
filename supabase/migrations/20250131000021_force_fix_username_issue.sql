-- Force Fix Username Issue
-- Migration: 20250131000021_force_fix_username_issue.sql

-- The issue is that somewhere in your code, there's still a reference to players.username
-- Let's create a view that will catch any attempts to access the old column name

-- First, let's check what's actually in your players table right now
DO $$
DECLARE
  col_count INTEGER;
  col_names TEXT[];
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_name = 'players' AND table_schema = 'public';
  
  SELECT ARRAY_AGG(column_name) INTO col_names
  FROM information_schema.columns 
  WHERE table_name = 'players' AND table_schema = 'public';
  
  RAISE NOTICE 'Current players table has % columns: %', col_count, col_names;
END $$;

-- Now let's create a view that will catch any attempts to access players.username
-- This will redirect them to players.name
CREATE OR REPLACE VIEW public.players_view AS
SELECT 
  uuid,
  name as username,  -- This creates a virtual 'username' column that points to 'name'
  name,
  profile_id,
  level,
  total_xp,
  last_level_up,
  last_seen,
  created_at,
  updated_at
FROM public.players;

-- Grant access to the view
GRANT SELECT ON public.players_view TO authenticated;
GRANT SELECT ON public.players_view TO anon;

-- Now let's also check if there are any functions that might be calling the wrong table
-- Let's search for any RPC calls that might be referencing the wrong column
DO $$
DECLARE
  func_record RECORD;
BEGIN
  RAISE NOTICE 'Checking for any functions that might be causing the issue...';
  
  FOR func_record IN 
    SELECT 
      p.proname as func_name,
      pg_get_functiondef(p.oid) as func_source
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%player%'
  LOOP
    IF func_record.func_source LIKE '%players.username%' THEN
      RAISE NOTICE 'FOUND PROBLEM FUNCTION: % - it references players.username', func_record.func_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Function check completed';
END $$;

-- Let's also check if there are any triggers or other database objects
DO $$
BEGIN
  RAISE NOTICE 'Checking for triggers on players table...';
  
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.players'::regclass
  ) THEN
    RAISE NOTICE 'Found triggers on players table';
  ELSE
    RAISE NOTICE 'No triggers found on players table';
  END IF;
END $$;

-- Finally, let's make sure our functions are working
DO $$
BEGIN
  RAISE NOTICE 'Testing if our functions exist...';
  
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_tokenlink_user'
  ) THEN
    RAISE NOTICE '✅ create_tokenlink_user function exists';
  ELSE
    RAISE NOTICE '❌ create_tokenlink_user function does not exist';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'verify_minecraft_username'
  ) THEN
    RAISE NOTICE '✅ verify_minecraft_username function exists';
  ELSE
    RAISE NOTICE '❌ verify_minecraft_username function does not exist';
  END IF;
END $$;
