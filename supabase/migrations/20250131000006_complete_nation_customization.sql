-- Complete Nation Customization Migration
-- Migration: 20250131000006_complete_nation_customization.sql
-- This migration adds all the missing fields for complete nation customization

-- Ensure color column exists (it should be there from the base table)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'color') THEN
    ALTER TABLE public.nations ADD COLUMN color TEXT DEFAULT '#1e40af';
    RAISE NOTICE 'Added color column to nations table';
  END IF;
END $$;

-- Add comment to existing color column if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'color') THEN
    COMMENT ON COLUMN public.nations.color IS 'Primary color for the nation (hex color code)';
  END IF;
END $$;

-- Add ruling_entity field to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS ruling_entity TEXT DEFAULT 'Monarch';

COMMENT ON COLUMN public.nations.ruling_entity IS 'Who or what actually rules the nation (e.g., Monarch, President, Council, Parliament)';

-- Add government_system field to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS government_system TEXT DEFAULT 'Monarchy';

COMMENT ON COLUMN public.nations.government_system IS 'How the government is organized (e.g., Monarchy, Republic, Democracy, Federation)';

-- Add economic_system field to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS economic_system TEXT DEFAULT 'Capitalist';

COMMENT ON COLUMN public.nations.economic_system IS 'The economic system of the nation (e.g., Capitalist, Socialist, Mixed Economy, etc.)';

-- Add vassal_of field to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS vassal_of TEXT;

COMMENT ON COLUMN public.nations.vassal_of IS 'The name of the nation this nation is a vassal of, or null if independent';

-- Add theme_color field to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'text-blue-500';

COMMENT ON COLUMN public.nations.theme_color IS 'Theme color for the nation (e.g., text-blue-500, text-red-500) used for crown icons and decorative elements';

-- Add banner_image_url field to nations table for custom banner images
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

COMMENT ON COLUMN public.nations.banner_image_url IS 'URL to a custom banner image for the nation card';

-- Add banner_style field to nations table for banner customization
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_style TEXT DEFAULT 'solid';

COMMENT ON COLUMN public.nations.banner_style IS 'Banner style: solid, gradient, pattern, or image';

-- Add banner_pattern field to nations table for banner patterns
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_pattern TEXT DEFAULT 'none';

COMMENT ON COLUMN public.nations.banner_pattern IS 'Banner pattern: none, stripes, checks, dots, etc.';

-- Add banner_gradient field to nations table for gradient banners
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_gradient TEXT DEFAULT 'none';

COMMENT ON COLUMN public.nations.banner_gradient IS 'Banner gradient: none, horizontal, vertical, diagonal, radial';

-- Add banner_gradient_colors field to nations table for gradient colors
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_gradient_colors TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.nations.banner_gradient_colors IS 'Array of colors for gradient banners';

-- Add banner_opacity field to nations table for banner transparency
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_opacity REAL DEFAULT 1.0;

COMMENT ON COLUMN public.nations.banner_opacity IS 'Banner opacity from 0.0 (transparent) to 1.0 (opaque)';

-- Add banner_height field to nations table for banner height
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_height INTEGER DEFAULT 128;

COMMENT ON COLUMN public.nations.banner_height IS 'Banner height in pixels';

-- Add banner_text field to nations table for banner text
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text TEXT;

COMMENT ON COLUMN public.nations.banner_text IS 'Text to display on the banner';

-- Add banner_text_color field to nations table for banner text color
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_color TEXT DEFAULT '#ffffff';

COMMENT ON COLUMN public.nations.banner_text_color IS 'Color of the text on the banner';

-- Add banner_text_size field to nations table for banner text size
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_size INTEGER DEFAULT 16;

COMMENT ON COLUMN public.nations.banner_text_size IS 'Size of the text on the banner in pixels';

-- Add banner_text_position field to nations table for banner text position
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_position TEXT DEFAULT 'center';

COMMENT ON COLUMN public.nations.banner_text_position IS 'Position of text on banner: left, center, right';

-- Add banner_text_style field to nations table for banner text styling
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS banner_text_style TEXT DEFAULT 'normal';

COMMENT ON COLUMN public.nations.banner_text_style IS 'Style of text on banner: normal, bold, italic, underline';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nations_ruling_entity ON public.nations(ruling_entity);
CREATE INDEX IF NOT EXISTS idx_nations_government_system ON public.nations(government_system);
CREATE INDEX IF NOT EXISTS idx_nations_economic_system ON public.nations(economic_system);
CREATE INDEX IF NOT EXISTS idx_nations_vassal_of ON public.nations(vassal_of);
CREATE INDEX IF NOT EXISTS idx_nations_theme_color ON public.nations(theme_color);
CREATE INDEX IF NOT EXISTS idx_nations_banner_image_url ON public.nations(banner_image_url);
CREATE INDEX IF NOT EXISTS idx_nations_banner_style ON public.nations(banner_style);

-- Update RLS policies to allow nation leaders to update their own nation's customization
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Staff and nation leaders can manage nations" ON public.nations;

-- Create new comprehensive policy
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

-- Add comments for documentation
COMMENT ON TABLE public.nations IS 'Nations table with comprehensive customization options for banners, government systems, and more';

-- Create a view for easy access to nation customization data
-- This view will be created after all columns are added
DO $$ 
BEGIN
  -- Drop the view if it exists
  DROP VIEW IF EXISTS public.nation_customization;
  
  -- Create the view with safe column references
  EXECUTE 'CREATE VIEW public.nation_customization AS
  SELECT 
    id,
    name,
    type,
    description,
    capital,
    leader,
    population,
    bank,
    daily_upkeep,
    founded,
    lore,
    government,
    motto,
    specialties,
    history,
    created_at,
    updated_at,
    image_url,
    color,
    -- Only include banner fields if they exist
    COALESCE(banner_image_url, image_url) as banner_image_url,
    COALESCE(banner_style, ''solid'') as banner_style,
    COALESCE(banner_pattern, ''none'') as banner_pattern,
    COALESCE(banner_gradient, ''none'') as banner_gradient,
    COALESCE(banner_gradient_colors, ARRAY[]::TEXT[]) as banner_gradient_colors,
    COALESCE(banner_opacity, 1.0) as banner_opacity,
    COALESCE(banner_height, 128) as banner_height,
    COALESCE(banner_text, '''') as banner_text,
    COALESCE(banner_text_color, ''#ffffff'') as banner_text_color,
    COALESCE(banner_text_size, 16) as banner_text_size,
    COALESCE(banner_text_position, ''center'') as banner_text_position,
    COALESCE(banner_text_style, ''normal'') as banner_text_style,
    COALESCE(theme_color, ''text-blue-500'') as theme_color,
    COALESCE(ruling_entity, ''Monarch'') as ruling_entity,
    COALESCE(government_system, ''Monarchy'') as government_system,
    COALESCE(economic_system, ''Capitalist'') as economic_system,
    vassal_of
  FROM public.nations';
  
  RAISE NOTICE 'Created nation_customization view successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating view: %', SQLERRM;
END $$;

-- Grant access to the view
GRANT SELECT ON public.nation_customization TO authenticated;

-- Test the migration by checking if columns exist
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed. Checking columns...';
  
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
