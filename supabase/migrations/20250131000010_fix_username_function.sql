-- Fix Username Function Migration
-- Migration: 20250131000010_fix_username_function.sql

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.check_username_conflict(TEXT);

-- Create a new, simpler version of the function
CREATE OR REPLACE FUNCTION public.check_username_conflict(p_username TEXT)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflict_type TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_exists BOOLEAN;
  profile_exists BOOLEAN;
  website_exists BOOLEAN;
BEGIN
  -- Debug: Log the username being checked
  RAISE NOTICE 'Checking username: %', p_username;
  
  -- Check if username exists in players table (Minecraft players)
  SELECT EXISTS(SELECT 1 FROM public.players WHERE name = p_username) INTO player_exists;
  RAISE NOTICE 'Player exists: %', player_exists;
  
  -- Check if username exists in profiles table as minecraft_username
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE minecraft_username = p_username AND minecraft_username IS NOT NULL) INTO profile_exists;
  RAISE NOTICE 'Profile minecraft_username exists: %', profile_exists;
  
  -- Check if username exists in profiles table as website username
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = p_username AND minecraft_username IS NULL) INTO website_exists;
  RAISE NOTICE 'Website username exists: %', website_exists;
  
  -- If it's a Minecraft player (either in players table or profiles table)
  IF player_exists OR profile_exists THEN
    RAISE NOTICE 'Username is taken by Minecraft player';
    RETURN QUERY SELECT 
      true, 
      'minecraft_taken'::TEXT, 
      'Username is taken by a Minecraft player. Use /login in-game to claim your account.'::TEXT;
    RETURN;
  END IF;
  
  -- If it's a website username
  IF website_exists THEN
    RAISE NOTICE 'Username is taken by website user';
    RETURN QUERY SELECT 
      true, 
      'website_taken'::TEXT, 
      'Username is already taken by another website user'::TEXT;
    RETURN;
  END IF;
  
  -- No conflicts
  RAISE NOTICE 'Username is available';
  RETURN QUERY SELECT 
    false, 
    'none'::TEXT, 
    'Username is available'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO anon;

-- Test the function with a simple query
DO $$
BEGIN
  -- Test the function
  PERFORM * FROM public.check_username_conflict('test_username');
  RAISE NOTICE 'Function test completed';
END $$;
