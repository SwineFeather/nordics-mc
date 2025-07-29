-- Diagnostic script to check towns table structure
-- Run this to see what's actually in your database

-- Check the data type of the towns.id column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'towns' 
  AND column_name = 'id';

-- Check if towns table exists and show its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'towns'
ORDER BY ordinal_position;

-- Check if there are any existing towns
SELECT COUNT(*) as town_count FROM towns;

-- Show a few sample towns with their ID type
SELECT 
    id,
    pg_typeof(id) as id_type,
    name,
    mayor
FROM towns 
LIMIT 5;

-- Check if the companies table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies'
ORDER BY ordinal_position; 