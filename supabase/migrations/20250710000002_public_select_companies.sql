-- Migration: 20250710000002_public_select_companies.sql
-- Allow anyone to view public, active companies

-- Enable RLS if not already enabled
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop any old public select policy
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Anyone can view public companies" ON companies;

-- Add new public select policy
CREATE POLICY "Anyone can view public, active companies" ON companies
  FOR SELECT
  USING (is_public = true AND status = 'active'); 