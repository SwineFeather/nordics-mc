-- Debug Players Table Migration
-- Migration: 20250131000011_debug_players_table.sql

-- First, let's see what's actually in the players table
DO $$
DECLARE
  player_count INTEGER;
  sample_players TEXT[];
BEGIN
  -- Count total players
  SELECT COUNT(*) INTO player_count FROM public.players;
  RAISE NOTICE 'Total players in table: %', player_count;
  
  -- Get some sample player names
  SELECT ARRAY_AGG(name) INTO sample_players 
  FROM public.players 
  LIMIT 5;
  
  RAISE NOTICE 'Sample player names: %', sample_players;
  
  -- Check if 'Aytte' exists specifically
  IF EXISTS(SELECT 1 FROM public.players WHERE name = 'Aytte') THEN
    RAISE NOTICE 'Player "Aytte" EXISTS in players table';
  ELSE
    RAISE NOTICE 'Player "Aytte" does NOT exist in players table';
  END IF;
  
  -- Check if 'Aytte' exists in profiles table
  IF EXISTS(SELECT 1 FROM public.profiles WHERE minecraft_username = 'Aytte') THEN
    RAISE NOTICE 'Player "Aytte" EXISTS in profiles.minecraft_username';
  ELSE
    RAISE NOTICE 'Player "Aytte" does NOT exist in profiles.minecraft_username';
  END IF;
  
  IF EXISTS(SELECT 1 FROM public.profiles WHERE username = 'Aytte') THEN
    RAISE NOTICE 'Player "Aytte" EXISTS in profiles.username';
  ELSE
    RAISE NOTICE 'Player "Aytte" does NOT exist in profiles.username';
  END IF;
END $$;

-- Now let's test the function step by step
DO $$
DECLARE
  result RECORD;
BEGIN
  RAISE NOTICE 'Testing function step by step...';
  
  -- Test 1: Direct query to players table
  IF EXISTS(SELECT 1 FROM public.players WHERE name = 'Aytte') THEN
    RAISE NOTICE '✓ Direct query to players.name = "Aytte" returns TRUE';
  ELSE
    RAISE NOTICE '✗ Direct query to players.name = "Aytte" returns FALSE';
  END IF;
  
  -- Test 2: Direct query to profiles table
  IF EXISTS(SELECT 1 FROM public.profiles WHERE minecraft_username = 'Aytte') THEN
    RAISE NOTICE '✓ Direct query to profiles.minecraft_username = "Aytte" returns TRUE';
  ELSE
    RAISE NOTICE '✗ Direct query to profiles.minecraft_username = "Aytte" returns FALSE';
  END IF;
  
  -- Test 3: Call the function
  SELECT * INTO result FROM public.check_username_conflict('Aytte');
  RAISE NOTICE 'Function result: has_conflict=%, conflict_type=%, message=%', 
    result.has_conflict, result.conflict_type, result.message;
    
END $$;
