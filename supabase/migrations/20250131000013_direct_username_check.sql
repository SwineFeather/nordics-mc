-- Direct Username Check Migration
-- Migration: 20250131000013_direct_username_check.sql

-- Drop the existing function
DROP FUNCTION IF EXISTS public.check_username_conflict(TEXT);

-- Create a simple function that directly queries the tables
CREATE OR REPLACE FUNCTION public.check_username_conflict(p_username TEXT)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflict_type TEXT,
  message TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Check players table first (Minecraft players)
  SELECT 
    true, 
    'minecraft_player'::TEXT, 
    'Username is taken by a Minecraft player. Use /login in-game to claim your account.'::TEXT
  WHERE EXISTS (SELECT 1 FROM public.players WHERE name = p_username)
  
  UNION ALL
  
  -- Check profiles table for minecraft usernames
  SELECT 
    true, 
    'minecraft_reserved'::TEXT, 
    'Username is reserved for Minecraft players. Use /login in-game to claim your account.'::TEXT
  WHERE EXISTS (SELECT 1 FROM public.profiles WHERE minecraft_username = p_username)
  
  UNION ALL
  
  -- Check profiles table for website usernames
  SELECT 
    true, 
    'website_taken'::TEXT, 
    'Username is already taken by another website user'::TEXT
  WHERE EXISTS (SELECT 1 FROM public.profiles WHERE username = p_username)
  
  UNION ALL
  
  -- No conflicts (only if none of the above matched)
  SELECT 
    false, 
    'none'::TEXT, 
    'Username is available'::TEXT
  WHERE NOT EXISTS (
    SELECT 1 FROM public.players WHERE name = p_username
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE minecraft_username = p_username
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = p_username
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_conflict(TEXT) TO anon;

-- Test the function immediately with some real data
DO $$
DECLARE
  result RECORD;
  player_count INTEGER;
  sample_names TEXT[];
BEGIN
  -- First, let's see what's in the players table
  SELECT COUNT(*) INTO player_count FROM public.players;
  RAISE NOTICE 'Total players in table: %', player_count;
  
  -- Get some sample names
  SELECT ARRAY_AGG(name) INTO sample_names 
  FROM public.players 
  LIMIT 5;
  
  RAISE NOTICE 'Sample player names: %', sample_names;
  
  -- Test with the first player name we find
  IF array_length(sample_names, 1) > 0 THEN
    RAISE NOTICE 'Testing with player name: %', sample_names[1];
    
    SELECT * INTO result FROM public.check_username_conflict(sample_names[1]);
    RAISE NOTICE 'Result: has_conflict=%, conflict_type=%, message=%', 
      result.has_conflict, result.conflict_type, result.message;
  END IF;
  
  -- Test with a random username that shouldn't exist
  SELECT * INTO result FROM public.check_username_conflict('RandomUsername123456');
  RAISE NOTICE 'Random username result: has_conflict=%, conflict_type=%, message=%', 
    result.has_conflict, result.conflict_type, result.message;
    
  RAISE NOTICE 'Function test completed';
END $$;
