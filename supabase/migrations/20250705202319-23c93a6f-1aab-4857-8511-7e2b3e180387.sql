
-- Add missing icon columns to player_badges table
ALTER TABLE public.player_badges 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'User',
ADD COLUMN IF NOT EXISTS icon_only BOOLEAN DEFAULT false;
