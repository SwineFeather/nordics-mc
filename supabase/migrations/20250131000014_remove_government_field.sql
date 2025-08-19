-- Remove the redundant government field from nations table
-- The government_system field provides more detailed information

ALTER TABLE public.nations DROP COLUMN IF EXISTS government;

-- Add a comment to explain the change
COMMENT ON TABLE public.nations IS 'Nations table with government_system field for detailed government information';
