-- Add economic_system and vassal_of fields to nations table
-- Migration: 20250131000003_add_nation_economic_and_vassal_fields.sql

-- Add economic_system column to the nations table
ALTER TABLE public.nations 
ADD COLUMN economic_system TEXT DEFAULT 'Capitalist';

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.economic_system IS 'The economic system of the nation (e.g., Capitalist, Socialist, Mixed Economy, etc.)';

-- Add vassal_of column to the nations table
ALTER TABLE public.nations 
ADD COLUMN vassal_of TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.vassal_of IS 'The name of the nation this nation is a vassal of, or null if independent';

-- Create an index for better performance when querying by vassal status
CREATE INDEX IF NOT EXISTS idx_nations_vassal_of ON public.nations(vassal_of);

-- Create an index for better performance when querying by economic system
CREATE INDEX IF NOT EXISTS idx_nations_economic_system ON public.nations(economic_system);
