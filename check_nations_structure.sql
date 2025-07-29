-- Check the actual structure of the nations table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show a sample of nations data
SELECT * FROM public.nations LIMIT 3; 