-- Check Existing Fields and Add Missing Ones
-- Migration: 20250131000008_check_existing_fields.sql
-- This migration checks what fields exist and adds only the missing ones

-- First, let's see what fields we currently have
DO $$ 
BEGIN
  RAISE NOTICE 'Checking existing fields in nations table...';
  
  -- Check if color column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'color') THEN
    RAISE NOTICE '✓ color column exists';
  ELSE
    RAISE NOTICE '✗ color column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN color TEXT DEFAULT '#1e40af';
    COMMENT ON COLUMN public.nations.color IS 'Primary color for the nation (hex color code)';
  END IF;
  
  -- Check if theme_color column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'theme_color') THEN
    RAISE NOTICE '✓ theme_color column exists';
  ELSE
    RAISE NOTICE '✗ theme_color column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN theme_color TEXT DEFAULT 'text-blue-500';
    COMMENT ON COLUMN public.nations.theme_color IS 'Theme color for the nation (e.g., text-blue-500, text-red-500)';
  END IF;
  
  -- Check if economic_system column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'economic_system') THEN
    RAISE NOTICE '✓ economic_system column exists';
  ELSE
    RAISE NOTICE '✗ economic_system column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN economic_system TEXT DEFAULT 'Capitalist';
    COMMENT ON COLUMN public.nations.economic_system IS 'The economic system of the nation (e.g., Capitalist, Socialist, Mixed Economy)';
  END IF;
  
  -- Check if vassal_of column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'vassal_of') THEN
    RAISE NOTICE '✓ vassal_of column exists';
  ELSE
    RAISE NOTICE '✗ vassal_of column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN vassal_of TEXT;
    COMMENT ON COLUMN public.nations.vassal_of IS 'The name of the nation this nation is a vassal of, or null if independent';
  END IF;
  
  -- Check if government column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'government') THEN
    RAISE NOTICE '✓ government column exists';
  ELSE
    RAISE NOTICE '✗ government column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN government TEXT DEFAULT 'Monarchy';
    COMMENT ON COLUMN public.nations.government IS 'Government type (e.g., Monarchy, Democracy, Republic)';
  END IF;
  
  -- Check if lore column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'lore') THEN
    RAISE NOTICE '✓ lore column exists';
  ELSE
    RAISE NOTICE '✗ lore column missing - adding it';
    ALTER TABLE public.nations ADD COLUMN lore TEXT DEFAULT '';
    COMMENT ON COLUMN public.nations.lore IS 'Nation lore and description';
  END IF;
  
  RAISE NOTICE 'Field check complete!';
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nations_color ON public.nations(color);
CREATE INDEX IF NOT EXISTS idx_nations_theme_color ON public.nations(theme_color);
CREATE INDEX IF NOT EXISTS idx_nations_economic_system ON public.nations(economic_system);
CREATE INDEX IF NOT EXISTS idx_nations_vassal_of ON public.nations(vassal_of);
CREATE INDEX IF NOT EXISTS idx_nations_government ON public.nations(government);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.nations TO authenticated;

-- Test the migration
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'You can now edit nations with the new fields.';
END $$;
