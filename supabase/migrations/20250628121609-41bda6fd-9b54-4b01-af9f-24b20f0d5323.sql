
-- Add silent_join_leave column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN silent_join_leave boolean NOT NULL DEFAULT false;
