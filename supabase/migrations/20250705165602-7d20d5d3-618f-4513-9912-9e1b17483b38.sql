-- Add verification tracking and badge management tables
CREATE TABLE public.username_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minecraft_username TEXT NOT NULL UNIQUE,
  reserved_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  player_uuid TEXT -- Will be set when verified via /login
);

-- Add player badges system
CREATE TABLE public.player_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_uuid TEXT NOT NULL,
  badge_type TEXT NOT NULL DEFAULT 'Player',
  badge_color TEXT DEFAULT '#6b7280',
  is_verified BOOLEAN DEFAULT false,
  icon TEXT DEFAULT NULL, -- icon name (e.g. 'Hammer', 'Star', etc.)
  icon_only BOOLEAN DEFAULT false, -- if true, only show icon
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_uuid, badge_type)
);

-- Add account merge tracking
CREATE TABLE public.account_merges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  minecraft_username TEXT NOT NULL,
  player_uuid TEXT NOT NULL,
  merged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  merged_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on new tables
ALTER TABLE public.username_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_merges ENABLE ROW LEVEL SECURITY;

-- RLS policies for username_reservations
CREATE POLICY "Anyone can view reservations" ON public.username_reservations
  FOR SELECT USING (true);

CREATE POLICY "Users can reserve usernames" ON public.username_reservations
  FOR INSERT WITH CHECK (auth.uid() = reserved_by);

CREATE POLICY "Admins can manage reservations" ON public.username_reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for player_badges
CREATE POLICY "Anyone can view badges" ON public.player_badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON public.player_badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- RLS policies for account_merges
CREATE POLICY "Users can view their merges" ON public.account_merges
  FOR SELECT USING (
    auth.uid() = source_profile_id OR 
    auth.uid() = target_profile_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage merges" ON public.account_merges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Function to handle username verification and badge assignment
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
BEGIN
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
  
  -- Link player to profile
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

-- Function to get player verification status
CREATE OR REPLACE FUNCTION public.get_player_verification_status(p_player_uuid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge_info RECORD;
  reservation_info RECORD;
BEGIN
  -- Get badge information
  SELECT * INTO badge_info 
  FROM public.player_badges 
  WHERE player_uuid = p_player_uuid 
  ORDER BY is_verified DESC, assigned_at DESC 
  LIMIT 1;
  
  -- Get reservation information
  SELECT * INTO reservation_info 
  FROM public.username_reservations ur
  JOIN public.players p ON p.uuid = p_player_uuid
  WHERE ur.minecraft_username = p.username;
  
  RETURN jsonb_build_object(
    'badge_type', COALESCE(badge_info.badge_type, 'Player'),
    'badge_color', COALESCE(badge_info.badge_color, '#6b7280'),
    'is_verified', COALESCE(badge_info.is_verified, false),
    'is_reserved', reservation_info.id IS NOT NULL,
    'verified_at', reservation_info.verified_at
  );
END;
$$;
