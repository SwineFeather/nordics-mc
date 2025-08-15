-- Add theme_color field to nations table
-- Migration: 20250131000004_add_nation_theme_color.sql

-- Add theme_color column to the nations table
ALTER TABLE public.nations 
ADD COLUMN theme_color TEXT DEFAULT 'text-blue-500';

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.theme_color IS 'Theme color for the nation (e.g., text-blue-500, text-red-500) used for crown icons and decorative elements';

-- Create an index for better performance when querying by theme color
CREATE INDEX IF NOT EXISTS idx_nations_theme_color ON public.nations(theme_color);
