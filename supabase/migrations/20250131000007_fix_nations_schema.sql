-- Fix Nations Schema Migration
-- Migration: 20250131000007_fix_nations_schema.sql
-- This migration adds missing fields to match the frontend requirements

-- Add missing fields that the frontend expects
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS government TEXT DEFAULT 'Monarchy';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS lore TEXT DEFAULT '';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#1e40af';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS ruling_entity TEXT DEFAULT 'Monarch';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS government_system TEXT DEFAULT 'Monarchy';

-- Add banner customization fields
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_style TEXT DEFAULT 'solid';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_pattern TEXT DEFAULT 'none';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_gradient TEXT DEFAULT 'none';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_gradient_colors TEXT[] DEFAULT '{}';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_opacity REAL DEFAULT 1.0;

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_height INTEGER DEFAULT 128;

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text TEXT;

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_color TEXT DEFAULT '#ffffff';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_size INTEGER DEFAULT 16;

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_position TEXT DEFAULT 'center';

ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_style TEXT DEFAULT 'normal';

-- Add comments for documentation
COMMENT ON COLUMN public.nations.government IS 'Government type (e.g., Monarchy, Democracy, Republic)';
COMMENT ON COLUMN public.nations.lore IS 'Nation lore and description';
COMMENT ON COLUMN public.nations.color IS 'Primary color for the nation (hex color code)';
COMMENT ON COLUMN public.nations.ruling_entity IS 'Who or what actually rules the nation (e.g., Monarch, President, Council)';
COMMENT ON COLUMN public.nations.government_system IS 'How the government is organized (e.g., Monarchy, Republic, Democracy)';
COMMENT ON COLUMN public.nations.banner_image_url IS 'URL to a custom banner image for the nation card';
COMMENT ON COLUMN public.nations.banner_style IS 'Banner style: solid, gradient, pattern, or image';
COMMENT ON COLUMN public.nations.banner_pattern IS 'Banner pattern: none, stripes, checks, dots, etc.';
COMMENT ON COLUMN public.nations.banner_gradient IS 'Banner gradient: none, horizontal, vertical, diagonal, radial';
COMMENT ON COLUMN public.nations.banner_gradient_colors IS 'Array of colors for gradient banners';
COMMENT ON COLUMN public.nations.banner_opacity IS 'Banner opacity from 0.0 (transparent) to 1.0 (opaque)';
COMMENT ON COLUMN public.nations.banner_height IS 'Banner height in pixels';
COMMENT ON COLUMN public.nations.banner_text IS 'Text to display on the banner';
COMMENT ON COLUMN public.nations.banner_text_color IS 'Color of the text on the banner';
COMMENT ON COLUMN public.nations.banner_text_size IS 'Size of the text on the banner in pixels';
COMMENT ON COLUMN public.nations.banner_text_position IS 'Position of text on banner: left, center, right';
COMMENT ON COLUMN public.nations.banner_text_style IS 'Style of text on banner: normal, bold, italic, underline';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nations_government ON public.nations(government);
CREATE INDEX IF NOT EXISTS idx_nations_ruling_entity ON public.nations(ruling_entity);
CREATE INDEX IF NOT EXISTS idx_nations_government_system ON public.nations(government_system);
CREATE INDEX IF NOT EXISTS idx_nations_banner_image_url ON public.nations(banner_image_url);
CREATE INDEX IF NOT EXISTS idx_nations_banner_style ON public.nations(banner_style);

-- Update RLS policies to allow nation leaders to update their own nation's customization
DROP POLICY IF EXISTS "Staff and nation leaders can manage nations" ON public.nations;

CREATE POLICY "Staff and nation leaders can manage nations"
  ON public.nations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
    OR
    leader_name = (
      SELECT full_name FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
    OR
    leader_name = (
      SELECT full_name FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.nations TO authenticated;

-- Create a view for easy access to nation customization data
CREATE OR REPLACE VIEW public.nation_customization AS
SELECT 
  id,
  name,
  leader_uuid,
  king_uuid,
  king_name,
  leader_name,
  capital_town_id,
  capital_town_name,
  capital_name,
  capital_uuid,
  balance,
  board,
  tag,
  taxes,
  town_tax,
  max_towns,
  is_open,
  is_public,
  towns_count,
  residents_count,
  ally_count,
  enemy_count,
  last_activity,
  activity_score,
  growth_rate,
  created_at,
  last_updated,
  image_url,
  economic_system,
  vassal_of,
  theme_color,
  government,
  lore,
  color,
  ruling_entity,
  government_system,
  banner_image_url,
  banner_style,
  banner_pattern,
  banner_gradient,
  banner_gradient_colors,
  banner_opacity,
  banner_height,
  banner_text,
  banner_text_color,
  banner_text_size,
  banner_text_position,
  banner_text_style
FROM public.nations;

-- Grant access to the view
GRANT SELECT ON public.nation_customization TO authenticated;

-- Test the migration by checking if columns exist
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed. Checking columns...';
  
  -- Check if government column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'government') THEN
    RAISE NOTICE '✓ government column exists';
  ELSE
    RAISE NOTICE '✗ government column missing';
  END IF;
  
  -- Check if color column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'color') THEN
    RAISE NOTICE '✓ color column exists';
  ELSE
    RAISE NOTICE '✗ color column missing';
  END IF;
  
  -- Check if banner_image_url column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'banner_image_url') THEN
    RAISE NOTICE '✓ banner_image_url column exists';
  ELSE
    RAISE NOTICE '✗ banner_image_url column missing';
  END IF;
  
  -- Check if theme_color column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'theme_color') THEN
    RAISE NOTICE '✓ theme_color column exists';
  ELSE
    RAISE NOTICE '✗ theme_color column missing';
  END IF;
  
  RAISE NOTICE 'Migration check complete.';
END $$;
