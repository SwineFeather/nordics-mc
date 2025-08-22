-- Add Profile Authentication Support
-- Migration: 20250131000022_add_profile_authentication.sql

-- 1. Add password hash column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS password_salt TEXT,
ADD COLUMN IF NOT EXISTS can_login_with_username BOOLEAN DEFAULT false;

-- 2. Create unique index on username for login purposes
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON public.profiles(username) 
WHERE username IS NOT NULL AND can_login_with_username = true;

-- 3. Create function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - in production you'd use a proper hashing library
  -- For now, we'll use a simple hash for demonstration
  RETURN encode(sha256((password || salt)::bytea), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, stored_hash TEXT, stored_salt TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN stored_hash = public.hash_password(password, stored_salt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to authenticate user by username and password
CREATE OR REPLACE FUNCTION public.authenticate_user_by_username(username TEXT, password TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role app_role,
  avatar_url TEXT,
  bio TEXT,
  minecraft_username TEXT,
  can_login_with_username BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.avatar_url,
    p.bio,
    p.minecraft_username,
    p.can_login_with_username
  FROM public.profiles p
  WHERE p.username = authenticate_user_by_username.username
    AND p.can_login_with_username = true
    AND p.password_hash IS NOT NULL
    AND p.password_salt IS NOT NULL
    AND public.verify_password(password, p.password_hash, p.password_salt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to set user password
CREATE OR REPLACE FUNCTION public.set_user_password(user_id UUID, new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  salt TEXT;
  hash TEXT;
BEGIN
  -- Generate a random salt
  salt := encode(gen_random_bytes(16), 'hex');
  
  -- Hash the password with the salt
  hash := public.hash_password(new_password, salt);
  
  -- Update the user's password
  UPDATE public.profiles 
  SET 
    password_hash = hash,
    password_salt = salt,
    can_login_with_username = true,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to create profile for TokenLink user
CREATE OR REPLACE FUNCTION public.create_tokenlink_profile(
  p_player_uuid TEXT,
  p_player_name TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  minecraft_username TEXT,
  role app_role
) AS $$
DECLARE
  profile_id UUID;
  generated_email TEXT;
BEGIN
  -- Generate email if not provided
  IF p_email IS NULL THEN
    generated_email := p_player_name || '@tokenlink.local';
  ELSE
    generated_email := p_email;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    minecraft_username,
    role,
    can_login_with_username
  ) VALUES (
    gen_random_uuid(),
    generated_email,
    p_player_name,
    p_player_name,
    p_player_name,
    'member',
    false
  ) RETURNING id INTO profile_id;
  
  -- Update player record to link to profile
  UPDATE public.players 
  SET profile_id = profile_id
  WHERE uuid = p_player_uuid;
  
  -- Return the created profile
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.full_name,
    p.minecraft_username,
    p.role
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.authenticate_user_by_username(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tokenlink_profile(TEXT, TEXT, TEXT) TO authenticated;

-- 9. Create RLS policies for the new functions
CREATE POLICY "Users can authenticate with username" ON public.profiles
  FOR SELECT TO authenticated
  USING (can_login_with_username = true);

-- 10. Add comments for documentation
COMMENT ON COLUMN public.profiles.password_hash IS 'Hashed password for username-based login';
COMMENT ON COLUMN public.profiles.password_salt IS 'Salt used for password hashing';
COMMENT ON COLUMN public.profiles.can_login_with_username IS 'Whether this user can login with username/password';
COMMENT ON FUNCTION public.authenticate_user_by_username(TEXT, TEXT) IS 'Authenticate user by username and password';
COMMENT ON FUNCTION public.set_user_password(UUID, TEXT) IS 'Set or update user password';
COMMENT ON FUNCTION public.create_tokenlink_profile(TEXT, TEXT, TEXT) IS 'Create profile for TokenLink user';
