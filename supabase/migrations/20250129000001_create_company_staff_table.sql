-- Create company_staff table for managing company staff members
-- Migration: 20250129000001_create_company_staff_table.sql

CREATE TABLE IF NOT EXISTS company_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL DEFAULT 'member', -- e.g., 'ceo', 'manager', 'employee', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user per company
    UNIQUE(company_id, user_uuid)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_staff_company_id ON company_staff(company_id);
CREATE INDEX IF NOT EXISTS idx_company_staff_user_uuid ON company_staff(user_uuid);
CREATE INDEX IF NOT EXISTS idx_company_staff_role ON company_staff(role);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_company_staff_updated_at
    BEFORE UPDATE ON company_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_company_staff_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE company_staff ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view staff of public companies
CREATE POLICY "Users can view company staff" ON company_staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_staff.company_id 
            AND companies.is_public = true
        )
    );

-- Policy: Company owners can manage their company staff
CREATE POLICY "Company owners can manage staff" ON company_staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_staff.company_id 
            AND companies.owner_uuid = auth.uid()
        )
    );

-- Policy: Staff members can view their own records
CREATE POLICY "Staff can view own records" ON company_staff
    FOR SELECT USING (user_uuid = auth.uid());

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to company staff" ON company_staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Add comment to explain the table
COMMENT ON TABLE company_staff IS 'Stores staff members and their roles within companies';
COMMENT ON COLUMN company_staff.role IS 'Role within the company (e.g., ceo, manager, employee, member)'; 