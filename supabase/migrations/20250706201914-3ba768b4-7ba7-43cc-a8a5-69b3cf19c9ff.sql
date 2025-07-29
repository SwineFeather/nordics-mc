
-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'helper';
ALTER TYPE public.app_role ADD VALUE 'vip';
ALTER TYPE public.app_role ADD VALUE 'kala';
ALTER TYPE public.app_role ADD VALUE 'fancy_kala';
ALTER TYPE public.app_role ADD VALUE 'golden_kala';

-- Update the has_role_or_higher function to include helper role
CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role app_role)
RETURNS BOOLEAN AS $$
  SELECT CASE 
    WHEN get_current_user_role() = 'admin' THEN true
    WHEN get_current_user_role() = 'moderator' AND required_role IN ('moderator', 'helper', 'editor', 'member', 'vip', 'kala', 'fancy_kala', 'golden_kala') THEN true
    WHEN get_current_user_role() = 'helper' AND required_role IN ('helper', 'editor', 'member', 'vip', 'kala', 'fancy_kala', 'golden_kala') THEN true
    WHEN get_current_user_role() = 'editor' AND required_role IN ('editor', 'member', 'vip', 'kala', 'fancy_kala', 'golden_kala') THEN true
    WHEN get_current_user_role() = 'member' AND required_role IN ('member', 'vip', 'kala', 'fancy_kala', 'golden_kala') THEN true
    WHEN get_current_user_role() IN ('vip', 'kala', 'fancy_kala', 'golden_kala') AND required_role IN ('vip', 'kala', 'fancy_kala', 'golden_kala') THEN true
    ELSE false
  END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update chat message policies to allow helpers to delete messages
DROP POLICY IF EXISTS "Moderators can delete messages" ON public.chat_messages;
CREATE POLICY "Staff can delete messages" ON public.chat_messages
FOR DELETE TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::app_role, 'moderator'::app_role, 'helper'::app_role])
  ))
);

-- Update chat user bans policies to allow helpers to manage bans
DROP POLICY IF EXISTS "Moderators can manage bans" ON public.chat_user_bans;
CREATE POLICY "Staff can manage bans" ON public.chat_user_bans
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::app_role, 'moderator'::app_role, 'helper'::app_role])
  )
);

DROP POLICY IF EXISTS "Moderators can view bans" ON public.chat_user_bans;
CREATE POLICY "Staff can view bans" ON public.chat_user_bans
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::app_role, 'moderator'::app_role, 'helper'::app_role])
  )
);
