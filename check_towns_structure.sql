-- Check the actual structure of the towns table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'towns' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show a sample of town data
SELECT * FROM public.towns LIMIT 3; 