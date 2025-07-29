-- Fix nations table schema mismatch
-- Migration: 20250105000000_fix_nations_leader_column.sql

-- Add missing columns to nations table
ALTER TABLE public.nations 
ADD COLUMN IF NOT EXISTS leader_name TEXT,
ADD COLUMN IF NOT EXISTS leader_uuid TEXT;

-- Update existing data to populate leader_name from leader column
UPDATE public.nations 
SET leader_name = leader 
WHERE leader_name IS NULL AND leader IS NOT NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN public.nations.leader IS 'Legacy leader column - use leader_name instead';
COMMENT ON COLUMN public.nations.leader_name IS 'Name of the nation leader';
COMMENT ON COLUMN public.nations.leader_uuid IS 'UUID of the nation leader';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nations_leader_name ON public.nations(leader_name);
CREATE INDEX IF NOT EXISTS idx_nations_leader_uuid ON public.nations(leader_uuid);

-- Update the RLS policy to use leader_name instead of leader
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
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE leader_name = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE leader_name = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  ); 