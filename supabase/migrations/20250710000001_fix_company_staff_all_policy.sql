-- Migration: 20250710000001_fix_company_staff_all_policy.sql
-- Fix company_staff RLS policy for UPDATE/DELETE to allow owners, admins, moderators, and managers to update/delete staff

-- Drop any old ALL policy
DROP POLICY IF EXISTS "Company owners can manage staff" ON company_staff;
DROP POLICY IF EXISTS "Admins have full access to company staff" ON company_staff;
DROP POLICY IF EXISTS "Managers can add staff" ON company_staff;

-- Add correct policy for ALL (UPDATE/DELETE)
CREATE POLICY "Managers, owners, admins can manage staff" ON company_staff
  FOR ALL
  USING (
    -- Manager of this company
    EXISTS (
      SELECT 1 FROM company_staff cs
      WHERE cs.company_id = company_staff.company_id
        AND cs.user_uuid = auth.uid()
        AND cs.role = 'Manager'
    )
    -- OR owner of this company
    OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_staff.company_id
        AND companies.owner_uuid = auth.uid()
    )
    -- OR admin/moderator
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  ); 