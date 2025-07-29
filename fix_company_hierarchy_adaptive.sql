-- Adaptive migration that handles both UUID and INTEGER towns.id columns
-- This migration detects the actual towns table structure and adapts accordingly

-- Step 1: Check the towns table structure and determine the correct approach
DO $$
DECLARE
    towns_id_type text;
    companies_id_type text;
BEGIN
    -- Get the data type of towns.id
    SELECT data_type INTO towns_id_type
    FROM information_schema.columns 
    WHERE table_name = 'towns' AND column_name = 'id';
    
    -- Get the data type of companies.id
    SELECT data_type INTO companies_id_type
    FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'id';
    
    RAISE NOTICE 'Towns.id data type: %, Companies.id data type: %', towns_id_type, companies_id_type;
    
    -- Store the towns.id type in a temporary table for later use
    CREATE TEMP TABLE migration_info (
        towns_id_type text,
        companies_id_type text
    );
    INSERT INTO migration_info VALUES (towns_id_type, companies_id_type);
END $$;

-- Step 2: Drop existing columns if they exist
DO $$ 
BEGIN
    -- Drop town_id column if it exists (regardless of type)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'companies' AND column_name = 'town_id') THEN
        ALTER TABLE companies DROP COLUMN town_id;
        RAISE NOTICE 'Dropped existing town_id column';
    END IF;
    
    -- Drop parent_company_id column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'companies' AND column_name = 'parent_company_id') THEN
        ALTER TABLE companies DROP COLUMN parent_company_id;
        RAISE NOTICE 'Dropped existing parent_company_id column';
    END IF;
    
    -- Drop company_type column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'companies' AND column_name = 'company_type') THEN
        ALTER TABLE companies DROP COLUMN company_type;
        RAISE NOTICE 'Dropped existing company_type column';
    END IF;
END $$;

-- Step 3: Add columns with adaptive data types
DO $$
DECLARE
    towns_id_type text;
    companies_id_type text;
BEGIN
    -- Get the stored data types
    SELECT towns_id_type, companies_id_type INTO towns_id_type, companies_id_type
    FROM migration_info;
    
    -- Add parent company relationship (always UUID for companies)
    EXECUTE 'ALTER TABLE companies ADD COLUMN parent_company_id UUID REFERENCES companies(id) ON DELETE SET NULL';
    RAISE NOTICE 'Added parent_company_id column (UUID)';
    
    -- Add town location with matching data type
    IF towns_id_type = 'uuid' THEN
        EXECUTE 'ALTER TABLE companies ADD COLUMN town_id UUID REFERENCES towns(id) ON DELETE SET NULL';
        RAISE NOTICE 'Added town_id column (UUID) to match towns.id';
    ELSIF towns_id_type = 'integer' THEN
        EXECUTE 'ALTER TABLE companies ADD COLUMN town_id INTEGER REFERENCES towns(id) ON DELETE SET NULL';
        RAISE NOTICE 'Added town_id column (INTEGER) to match towns.id';
    ELSE
        RAISE EXCEPTION 'Unknown towns.id data type: %. Expected uuid or integer', towns_id_type;
    END IF;
    
    -- Add company type
    EXECUTE 'ALTER TABLE companies ADD COLUMN company_type VARCHAR(50) DEFAULT ''independent'' CHECK (company_type IN (''parent'', ''subsidiary'', ''independent''))';
    RAISE NOTICE 'Added company_type column';
END $$;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_parent_id ON companies(parent_company_id);
CREATE INDEX IF NOT EXISTS idx_companies_town_id ON companies(town_id);
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);

-- Step 5: Add database functions (these work regardless of data types)
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

-- Step 6: Update RLS policies
DROP POLICY IF EXISTS "Users can view company hierarchies" ON companies;
CREATE POLICY "Users can view company hierarchies" ON companies
    FOR SELECT USING (
        is_public = true 
        OR status = 'active'
        OR parent_company_id IS NOT NULL
    );

-- Step 7: Insert sample parent companies (only if they don't exist)
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
) 
SELECT * FROM (VALUES 
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
    )
) AS v(name, slug, tagline, description, owner_uuid, industry, business_type, company_type, primary_color, secondary_color, is_public, status)
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE slug = v.slug);

-- Step 8: Update existing companies to be subsidiaries (only if they exist)
UPDATE companies 
SET parent_company_id = (SELECT id FROM companies WHERE slug = 'nordic-enterprises'),
    company_type = 'subsidiary'
WHERE slug IN ('nordic-mining-co', 'iron-forge-industries')
  AND EXISTS (SELECT 1 FROM companies WHERE slug = 'nordic-enterprises');

UPDATE companies 
SET parent_company_id = (SELECT id FROM companies WHERE slug = 'aqua-union-holdings'),
    company_type = 'subsidiary'
WHERE slug = 'aqua-union-trading'
  AND EXISTS (SELECT 1 FROM companies WHERE slug = 'aqua-union-holdings');

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated;

-- Step 10: Final verification and cleanup
DO $$
DECLARE
    towns_id_type text;
    companies_id_type text;
    town_id_type text;
    parent_id_type text;
BEGIN
    -- Get the stored data types
    SELECT towns_id_type, companies_id_type INTO towns_id_type, companies_id_type
    FROM migration_info;
    
    -- Verify the columns were added correctly
    SELECT data_type INTO town_id_type
    FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'town_id';
    
    SELECT data_type INTO parent_id_type
    FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'parent_company_id';
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Towns.id type: %, Companies.town_id type: %', towns_id_type, town_id_type;
    RAISE NOTICE 'Companies.parent_company_id type: %', parent_id_type;
    
    -- Clean up temporary table
    DROP TABLE migration_info;
END $$; 