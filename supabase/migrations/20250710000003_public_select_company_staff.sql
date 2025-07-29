-- Migration: 20250710000003_public_select_company_staff.sql
-- Allow anyone to view staff for public companies

-- Enable RLS if not already enabled
ALTER TABLE company_staff ENABLE ROW LEVEL SECURITY;

-- Drop any old public select policy
DROP POLICY IF EXISTS "Users can view company staff" ON company_staff;

-- Add new public select policy
CREATE POLICY "Anyone can view staff for public companies" ON company_staff
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_staff.company_id 
      AND companies.is_public = true
    )
  ); 