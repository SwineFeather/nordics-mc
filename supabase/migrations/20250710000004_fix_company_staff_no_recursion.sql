-- Migration: 20250710000004_fix_company_staff_no_recursion.sql
-- Remove recursive RLS policy and add safe policy for company_staff

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Managers, owners, admins can manage staff" ON company_staff;
DROP POLICY IF EXISTS "Managers, owners, admins can add staff" ON company_staff;

-- Add a safe policy (no recursion)
CREATE POLICY "Owners, admins, mods can manage staff" ON company_staff
  FOR ALL
  USING (
    -- Owner of this company
    EXISTS (
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