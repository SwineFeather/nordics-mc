-- Add missing columns for town leveling system
ALTER TABLE public.towns 
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_xp BIGINT NOT NULL DEFAULT 0;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_towns_level ON public.towns(level);
CREATE INDEX IF NOT EXISTS idx_towns_total_xp ON public.towns(total_xp);

-- Update existing towns to have default values
UPDATE public.towns 
SET level = 1, total_xp = 0 
WHERE level IS NULL OR total_xp IS NULL; 