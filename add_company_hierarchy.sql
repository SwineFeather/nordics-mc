-- Add parent-child relationships and town location to companies table
-- Migration: Add company hierarchy and town location support

-- Add parent company relationship
ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Add town location
ALTER TABLE companies ADD COLUMN IF NOT EXISTS town_id UUID REFERENCES towns(id) ON DELETE SET NULL;

-- Add company type to distinguish between parent companies and subsidiaries
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_type VARCHAR(50) DEFAULT 'subsidiary' CHECK (company_type IN ('parent', 'subsidiary', 'independent'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_parent_id ON companies(parent_company_id);
CREATE INDEX IF NOT EXISTS idx_companies_town_id ON companies(town_id);
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);

-- Update existing companies to be independent by default
UPDATE companies SET company_type = 'independent' WHERE company_type IS NULL;

-- Add a function to get all child companies recursively
CREATE OR REPLACE FUNCTION get_company_hierarchy(company_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    level INTEGER,
    path TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE company_tree AS (
        -- Base case: the parent company
        SELECT 
            c.id,
            c.name,
            c.slug,
            0 as level,
            ARRAY[c.name] as path
        FROM companies c
        WHERE c.id = company_uuid
        
        UNION ALL
        
        -- Recursive case: child companies
        SELECT 
            child.id,
            child.name,
            child.slug,
            ct.level + 1,
            ct.path || child.name
        FROM companies child
        INNER JOIN company_tree ct ON child.parent_company_id = ct.id
    )
    SELECT 
        ct.id,
        ct.name,
        ct.slug,
        ct.level,
        array_to_string(ct.path, ' > ') as path
    FROM company_tree ct
    ORDER BY ct.level, ct.name;
END;
$$ LANGUAGE plpgsql;

-- Add a function to count child companies
CREATE OR REPLACE FUNCTION count_child_companies(parent_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM companies
        WHERE parent_company_id = parent_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Add a function to get all parent companies in hierarchy
CREATE OR REPLACE FUNCTION get_parent_hierarchy(company_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE parent_tree AS (
        -- Base case: the current company
        SELECT 
            c.id,
            c.name,
            c.slug,
            0 as level
        FROM companies c
        WHERE c.id = company_uuid
        
        UNION ALL
        
        -- Recursive case: parent companies
        SELECT 
            parent.id,
            parent.name,
            parent.slug,
            pt.level + 1
        FROM companies parent
        INNER JOIN parent_tree pt ON parent.id = pt.parent_company_id
    )
    SELECT 
        pt.id,
        pt.name,
        pt.slug,
        pt.level
    FROM parent_tree pt
    ORDER BY pt.level DESC;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to allow viewing company hierarchies
CREATE POLICY "Users can view company hierarchies" ON companies
    FOR SELECT USING (
        is_public = true 
        OR status = 'active'
        OR parent_company_id IS NOT NULL
    );

-- Insert some sample parent companies (Groups/Enterprises)
INSERT INTO companies (
    name, 
    slug, 
    tagline, 
    description, 
    owner_uuid, 
    industry, 
    business_type,
    company_type,
    primary_color,
    secondary_color,
    is_public,
    status
) VALUES 
(
    'Nordic Enterprises',
    'nordic-enterprises',
    'Leading business conglomerate across Nordics World',
    '# Nordic Enterprises

**The premier business group on Nordics World**

Our portfolio includes:
- Mining operations
- Trading networks
- Manufacturing facilities
- Service companies

> 🏢 **Parent Company**: Managing multiple subsidiaries across the server

Join our business network and grow with us!',
    '00000000-0000-0000-0000-000000000001',
    'Conglomerate',
    'Enterprise',
    'parent',
    '#1E40AF',
    '#F59E0B',
    true,
    'active'
),
(
    'Aqua Union Holdings',
    'aqua-union-holdings',
    'Uniting businesses under the banner of cooperation',
    '# Aqua Union Holdings

**Cooperative business development and management**

Our subsidiaries focus on:
- Maritime commerce
- Environmental services
- Community development
- Sustainable practices

> 🤝 **Cooperative Model**: Shared success through collaboration

Building a better future together!',
    '00000000-0000-0000-0000-000000000002',
    'Holding Company',
    'Enterprise',
    'parent',
    '#059669',
    '#7C3AED',
    true,
    'active'
);

-- Update existing companies to be subsidiaries of Nordic Enterprises
UPDATE companies 
SET parent_company_id = (SELECT id FROM companies WHERE slug = 'nordic-enterprises'),
    company_type = 'subsidiary'
WHERE slug IN ('nordic-mining-co', 'iron-forge-industries');

-- Update Aqua Union Trading to be subsidiary of Aqua Union Holdings
UPDATE companies 
SET parent_company_id = (SELECT id FROM companies WHERE slug = 'aqua-union-holdings'),
    company_type = 'subsidiary'
WHERE slug = 'aqua-union-trading';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated; 