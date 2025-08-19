-- Fix Username Conflict Checking Migration
-- Migration: 20250131000008_fix_username_conflict_checking.sql

-- Update the check_username_conflict function to also check the players table
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
  -- Check if username conflicts with existing Minecraft usernames in profiles table
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE minecraft_username = p_username 
    AND minecraft_username IS NOT NULL
  ) THEN
    RETURN QUERY SELECT 
      true, 
      'minecraft_reserved'::TEXT, 
      'Username is reserved for Minecraft players. Use /login in-game to claim your account.'::TEXT;
    RETURN;
  END IF;
  
  -- Check if username conflicts with existing Minecraft usernames in players table (using 'name' column)
  IF EXISTS (
    SELECT 1 FROM public.players 
    WHERE name = p_username
  ) THEN
    RETURN QUERY SELECT 
      true, 
      'minecraft_player_exists'::TEXT, 
      'Username is taken by a Minecraft player. Use /login in-game to claim your account.'::TEXT;
    RETURN;
  END IF;
  
  -- Check if username conflicts with existing website usernames
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = p_username 
    AND minecraft_username IS NULL
  ) THEN
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

-- Update the create_website_account function to also check players table
CREATE OR REPLACE FUNCTION public.create_website_account(
  p_email TEXT,
  p_username TEXT,
  p_full_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  profile_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile_id UUID;
  conflict_check RECORD;
BEGIN
  -- Check for username conflicts
  SELECT * INTO conflict_check 
  FROM public.check_username_conflict(p_username);
  
  IF conflict_check.has_conflict THEN
    RETURN QUERY SELECT 
      false, 
      NULL::UUID, 
      conflict_check.message;
    RETURN;
  END IF;
  
  -- Check if email is already in use
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE email = p_email
  ) THEN
    RETURN QUERY SELECT 
      false, 
      NULL::UUID, 
      'Email is already registered';
    RETURN;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    role,
    minecraft_username
  ) VALUES (
    gen_random_uuid(),
    p_email,
    p_username,
    COALESCE(p_full_name, p_username),
    'member',
    NULL -- Website users don't have Minecraft usernames
  ) RETURNING id INTO new_profile_id;
  
  RETURN QUERY SELECT 
    true, 
    new_profile_id, 
    'Account created successfully';
END;
$$;

-- Add comment for clarity
COMMENT ON FUNCTION public.check_username_conflict(TEXT) IS 'Check if a username conflicts with existing Minecraft players (both profiles and players tables) or website accounts';
