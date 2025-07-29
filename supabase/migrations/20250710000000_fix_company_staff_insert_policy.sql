-- Migration: 20250710000000_fix_company_staff_insert_policy.sql
-- Fix company_staff RLS policy for INSERT to allow owners, admins, moderators, and managers to add staff

-- Drop any old insert policy
DROP POLICY IF EXISTS "Company owners can manage staff" ON company_staff;
DROP POLICY IF EXISTS "Managers can add staff" ON company_staff;

-- Add correct policy for INSERT
CREATE POLICY "Managers, owners, admins can add staff" ON company_staff
  FOR INSERT
  WITH CHECK (
    -- Manager of this company
    EXISTS (
      SELECT 1 FROM company_staff cs
      WHERE cs.company_id = company_id
        AND cs.user_uuid = auth.uid()
        AND cs.role = 'Manager'
    )
    -- OR owner of this company
    OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_id
        AND companies.owner_uuid = auth.uid()
    )
    -- OR admin/moderator
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  ); 