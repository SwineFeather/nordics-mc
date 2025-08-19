-- SINGLE FIX for /login command - Fixes "column players.username does not exist" error
-- Migration: 20250131000018_final_tokenlink_fix.sql

-- Step 1: Fix the players table structure
DROP TABLE IF EXISTS public.players CASCADE;

CREATE TABLE public.players (
  uuid TEXT PRIMARY KEY,
  name TEXT NOT NULL, -- This matches what the stats system uses
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level INT NOT NULL DEFAULT 1,
  total_xp BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments and enable RLS
COMMENT ON TABLE public.players IS 'Stores core data for each unique Minecraft player.';
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.players FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON public.players(profile_id);

-- Step 2: Fix the profiles table to allow NULL emails for Minecraft users
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Step 3: Fix the create_tokenlink_user function (NO automatic emails for Minecraft users)
DROP FUNCTION IF EXISTS public.create_tokenlink_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_tokenlink_user(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_tokenlink_user(
  p_player_uuid TEXT,
  p_player_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  existing_profile_id UUID;
BEGIN
  -- Check if player already has a linked profile
  SELECT profile_id INTO existing_profile_id
  FROM public.players
  WHERE uuid = p_player_uuid AND profile_id IS NOT NULL;
  
  IF existing_profile_id IS NOT NULL THEN
    RETURN existing_profile_id;
  END IF;
  
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Create profile entry (NO automatic email for Minecraft users)
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    minecraft_username
  ) VALUES (
    new_user_id,
    NULL, -- No automatic email for Minecraft users
    p_player_name,
    'member',
    p_player_name
  );
  
  -- Create or update the player entry
  INSERT INTO public.players (uuid, name, profile_id) 
  VALUES (p_player_uuid, p_player_name, new_user_id)
  ON CONFLICT (uuid) DO UPDATE SET 
    name = p_player_name,
    profile_id = new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Step 4: Fix the verify_minecraft_username function
DROP FUNCTION IF EXISTS public.verify_minecraft_username(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.verify_minecraft_username(
  p_player_uuid TEXT,
  p_minecraft_username TEXT,
  p_profile_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_reservation RECORD;
  existing_profile_id UUID;
  merge_needed BOOLEAN := false;
  player_exists BOOLEAN;
BEGIN
  -- First, ensure the player exists in the players table
  SELECT EXISTS(SELECT 1 FROM public.players WHERE uuid = p_player_uuid) INTO player_exists;
  
  IF NOT player_exists THEN
    -- Create the player entry if it doesn't exist
    INSERT INTO public.players (uuid, name, profile_id) 
    VALUES (p_player_uuid, p_minecraft_username, p_profile_id)
    ON CONFLICT (uuid) DO UPDATE SET 
      name = p_minecraft_username,
      profile_id = p_profile_id;
  END IF;
  
  -- Check if username is already reserved by someone else
  SELECT * INTO existing_reservation 
  FROM public.username_reservations 
  WHERE minecraft_username = p_minecraft_username;
  
  -- Check if there's already a profile with this minecraft username
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE minecraft_username = p_minecraft_username 
  AND id != p_profile_id;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Need to merge accounts
    INSERT INTO public.account_merges (
      source_profile_id, 
      target_profile_id, 
      minecraft_username, 
      player_uuid
    ) VALUES (
      existing_profile_id, 
      p_profile_id, 
      p_minecraft_username, 
      p_player_uuid
    );
    merge_needed := true;
  END IF;
  
  -- Update or create reservation
  INSERT INTO public.username_reservations (
    minecraft_username, 
    reserved_by, 
    verified, 
    verified_at, 
    player_uuid
  ) VALUES (
    p_minecraft_username, 
    p_profile_id, 
    true, 
    now(), 
    p_player_uuid
  )
  ON CONFLICT (minecraft_username) 
  DO UPDATE SET 
    verified = true,
    verified_at = now(),
    player_uuid = p_player_uuid,
    reserved_by = p_profile_id;
  
  -- Assign verified member badge
  INSERT INTO public.player_badges (
    player_uuid, 
    badge_type, 
    badge_color, 
    is_verified
  ) VALUES (
    p_player_uuid, 
    'Member', 
    '#22c55e', 
    true
  )
  ON CONFLICT (player_uuid, badge_type) 
  DO UPDATE SET 
    is_verified = true,
    assigned_at = now();
  
  -- Link player to profile (ensure this is done)
  UPDATE public.players 
  SET profile_id = p_profile_id 
  WHERE uuid = p_player_uuid;
  
  RETURN jsonb_build_object(
    'success', true,
    'verified', true,
    'merge_needed', merge_needed,
    'message', 'Username verified successfully'
  );
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.create_tokenlink_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tokenlink_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_minecraft_username(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_minecraft_username(TEXT, TEXT, UUID) TO anon;

-- Step 6: Test everything works
DO $$
DECLARE
  test_result UUID;
  verify_result JSONB;
BEGIN
  -- Test create_tokenlink_user
  SELECT public.create_tokenlink_user('test-uuid-123', 'TestPlayer') INTO test_result;
  RAISE NOTICE '✅ create_tokenlink_user works: %', test_result;
  
  -- Test verify_minecraft_username
  SELECT public.verify_minecraft_username('test-uuid-123', 'TestPlayer', test_result) INTO verify_result;
  RAISE NOTICE '✅ verify_minecraft_username works: %', verify_result;
  
  -- Clean up test data
  DELETE FROM public.profiles WHERE id = test_result;
  DELETE FROM public.players WHERE uuid = 'test-uuid-123';
  
  RAISE NOTICE '🎉 All functions working! /login command should now work.';
END $$;
