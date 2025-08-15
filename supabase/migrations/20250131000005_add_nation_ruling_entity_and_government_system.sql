-- Add ruling_entity and government_system fields to nations table
-- Migration: 20250131000005_add_nation_ruling_entity_and_government_system.sql

-- Add ruling_entity column to the nations table
ALTER TABLE public.nations 
ADD COLUMN ruling_entity TEXT DEFAULT 'Monarch';

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.ruling_entity IS 'Who or what actually rules the nation (e.g., Monarch, President, Council, Parliament)';

-- Add government_system column to the nations table
ALTER TABLE public.nations 
ADD COLUMN government_system TEXT DEFAULT 'Monarchy';

-- Add a comment to explain the field
COMMENT ON COLUMN public.nations.government_system IS 'How the government is organized (e.g., Monarchy, Republic, Democracy, Federation)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nations_ruling_entity ON public.nations(ruling_entity);
CREATE INDEX IF NOT EXISTS idx_nations_government_system ON public.nations(government_system);
