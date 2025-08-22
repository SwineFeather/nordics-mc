-- Create nation collaborators table for managing collaboration access
-- Migration: 20250131000011_create_nation_collaborators.sql
-- This migration creates a table to track who has collaboration access to nations

CREATE TABLE IF NOT EXISTS public.nation_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nation_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('collaborator', 'moderator', 'admin')),
  permissions TEXT[] DEFAULT '{}',
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by_username TEXT NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nation_collaborators_nation_name ON public.nation_collaborators(nation_name);
CREATE INDEX IF NOT EXISTS idx_nation_collaborators_user_id ON public.nation_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_nation_collaborators_role ON public.nation_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_nation_collaborators_is_active ON public.nation_collaborators(is_active);

-- Enable RLS
ALTER TABLE public.nation_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for nation collaborators
-- Nation leaders can view all collaborators for their nation
CREATE POLICY "Nation leaders can view collaborators" 
  ON public.nation_collaborators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE name = nation_collaborators.nation_name 
      AND king_name = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Nation leaders can manage collaborators for their nation
CREATE POLICY "Nation leaders can manage collaborators" 
  ON public.nation_collaborators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.nations 
      WHERE name = nation_collaborators.nation_name 
      AND king_name = (
        SELECT full_name FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Collaborators can view their own collaboration status
CREATE POLICY "Collaborators can view own status" 
  ON public.nation_collaborators 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Staff can view all collaborators
CREATE POLICY "Staff can view all collaborators" 
  ON public.nation_collaborators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nation_collaborators TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.nation_collaborators IS 'Nation collaborators table for managing access permissions';
COMMENT ON COLUMN public.nation_collaborators.nation_name IS 'Name of the nation this collaboration is for';
COMMENT ON COLUMN public.nation_collaborators.user_id IS 'User ID of the collaborator';
COMMENT ON COLUMN public.nation_collaborators.username IS 'Username of the collaborator';
COMMENT ON COLUMN public.nation_collaborators.role IS 'Role of the collaborator (collaborator, moderator, admin)';
COMMENT ON COLUMN public.nation_collaborators.permissions IS 'Array of specific permissions granted to this collaborator';
COMMENT ON COLUMN public.nation_collaborators.invited_by IS 'User ID who invited this collaborator';
COMMENT ON COLUMN public.nation_collaborators.invited_by_username IS 'Username of the person who sent the invitation';
COMMENT ON COLUMN public.nation_collaborators.invited_at IS 'When the invitation was sent';
COMMENT ON COLUMN public.nation_collaborators.accepted_at IS 'When the invitation was accepted';
COMMENT ON COLUMN public.nation_collaborators.is_active IS 'Whether this collaboration is currently active';

-- Test the migration by checking if the table exists
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed. Checking nation_collaborators table...';
  
  -- Check if nation_collaborators table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nation_collaborators') THEN
    RAISE NOTICE '✓ nation_collaborators table exists';
  ELSE
    RAISE NOTICE '✗ nation_collaborators table missing';
  END IF;
  
  -- Check if indexes exist
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_nation_collaborators_nation_name') THEN
    RAISE NOTICE '✓ nation_name index exists';
  ELSE
    RAISE NOTICE '✗ nation_name index missing';
  END IF;
  
  RAISE NOTICE 'Migration check complete.';
END $$;
