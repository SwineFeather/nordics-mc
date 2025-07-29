
-- Add bio and minecraft_username columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN bio text,
ADD COLUMN minecraft_username text;
