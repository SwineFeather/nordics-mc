-- Simple Username Check Migration
-- Migration: 20250131000012_simple_username_check.sql

-- Drop the existing function
DROP FUNCTION IF EXISTS public.check_username_conflict(TEXT);

-- Create a very simple, direct function
CREATE OR REPLACE FUNCTION public.check_username_conflict(p_username TEXT)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflict_type TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check players table first (Minecraft players)
  IF EXISTS (SELECT 1 FROM public.players WHERE name = p_username) THEN
    RETURN QUERY SELECT 
      true, 
      'minecraft_player'::TEXT, 
      'Username is taken by a Minecraft player. Use /login in-game to claim your account.'::TEXT;
    RETURN;
  END IF;
  
  -- Check profiles table for minecraft usernames
  IF EXISTS (SELECT 1 FROM public.profiles WHERE minecraft_username = p_username) THEN
    RETURN QUERY SELECT 
      true, 
      'minecraft_reserved'::TEXT, 
      'Username is reserved for Minecraft players. Use /login in-game to claim your account.'::TEXT;
    RETURN;
  END IF;
  
  -- Check profiles table for website usernames
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = p_username) THEN
    RETURN QUERY SELECT 
      true, 
      'website_taken'::TEXT, 
      'Username is already taken by another website user'::TEXT;
    RETURN;
  END IF;
  
  -- No conflicts
  RETURN QUERY SELECT 
    false, 
    'none'::TEXT, 
    'Username is available'::TEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO anon;

-- Test the function immediately
DO $$
DECLARE
  result RECORD;
BEGIN
  RAISE NOTICE 'Testing new function with "Aytte"...';
  
  -- Test with Aytte
  SELECT * INTO result FROM public.check_username_conflict('Aytte');
  RAISE NOTICE 'Result: has_conflict=%, conflict_type=%, message=%', 
    result.has_conflict, result.conflict_type, result.message;
    
  -- Test with a random username
  SELECT * INTO result FROM public.check_username_conflict('RandomUsername123');
  RAISE NOTICE 'Random username result: has_conflict=%, conflict_type=%, message=%', 
    result.has_conflict, result.conflict_type, result.message;
    
  RAISE NOTICE 'Function test completed';
END $$;
