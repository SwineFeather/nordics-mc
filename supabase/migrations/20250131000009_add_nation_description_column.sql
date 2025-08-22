-- Add description column to nations table
-- Migration: 20250131000009_add_nation_description_column.sql
-- This migration adds a separate description column for editable nation descriptions

-- Add description column to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

COMMENT ON COLUMN public.nations.description IS 'Editable description for the nation (separate from board text which comes from ingame)';

-- No nation_customization view needed - we only use the nations table directly

-- Test the migration by checking if the description column exists
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed. Checking description column...';
  
  -- Check if description column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nations' AND column_name = 'description') THEN
    RAISE NOTICE '✓ description column exists';
  ELSE
    RAISE NOTICE '✗ description column missing';
  END IF;
  
  RAISE NOTICE 'Migration check complete.';
END $$;
