-- Fix All Username Column References
-- Migration: 20250131000020_fix_all_username_references.sql

-- First, let's check what functions might be referencing the old column name
DO $$
DECLARE
  func_name TEXT;
  func_source TEXT;
BEGIN
  RAISE NOTICE 'Searching for functions that might reference players.username...';
  
  -- Check for any functions that might have the old column reference
  FOR func_name IN 
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
  LOOP
    SELECT pg_get_functiondef(oid) INTO func_source
    FROM pg_proc 
    WHERE proname = func_name;
    
    IF func_source LIKE '%players.username%' THEN
      RAISE NOTICE 'Found function % that references players.username', func_name;
    END IF;
  END LOOP;
END $$;

-- Now let's check if there are any views or triggers that might be causing issues
DO $$
DECLARE
  view_name TEXT;
  view_source TEXT;
BEGIN
  RAISE NOTICE 'Checking for views that might reference players.username...';
  
  FOR view_name IN 
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
  LOOP
    SELECT pg_get_viewdef(view_name::regclass, true) INTO view_source;
    
    IF view_source LIKE '%players.username%' THEN
      RAISE NOTICE 'Found view % that references players.username', view_name;
    END IF;
  END LOOP;
END $$;

-- Let's also check if there are any stored procedures or other database objects
DO $$
DECLARE
  obj_name TEXT;
  obj_type TEXT;
BEGIN
  RAISE NOTICE 'Checking for other database objects...';
  
  -- Check for any constraints or indexes that might be problematic
  SELECT conname, 'constraint' INTO obj_name, obj_type
  FROM pg_constraint 
  WHERE conrelid = 'public.players'::regclass;
  
  IF obj_name IS NOT NULL THEN
    RAISE NOTICE 'Found constraint % on players table', obj_name;
  END IF;
END $$;

-- Now let's ensure the players table has the correct structure
DO $$
BEGIN
  -- Check if profile_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.players ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added profile_id column to players table';
  ELSE
    RAISE NOTICE 'profile_id column already exists in players table';
  END IF;
  
  -- Verify the name column exists and is correct
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'name'
  ) THEN
    RAISE NOTICE 'players.name column exists and is correct';
  ELSE
    RAISE NOTICE 'WARNING: players.name column does not exist!';
  END IF;
  
  -- Check if there's a username column that shouldn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'username'
  ) THEN
    RAISE NOTICE 'WARNING: players.username column still exists - this is the problem!';
    -- Don't drop it yet, just warn
  ELSE
    RAISE NOTICE 'Good: players.username column does not exist';
  END IF;
END $$;

-- Let's also check what's in the current players table
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
