
-- Create the create_tokenlink_user function that handles TokenLink profile creation
CREATE OR REPLACE FUNCTION public.create_tokenlink_user(
  p_player_uuid TEXT,
  p_player_name TEXT,
  p_email TEXT DEFAULT NULL
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
  
  -- Create profile entry (without auth user for TokenLink)
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    minecraft_username
  ) VALUES (
    new_user_id,
    COALESCE(p_email, p_player_name || '@tokenlink.local'),
    p_player_name,
    'member',
    p_player_name
  );
  
  -- Link the player to the new profile
  UPDATE public.players
  SET profile_id = new_user_id
  WHERE uuid = p_player_uuid;
  
  RETURN new_user_id;
END;
$$;
