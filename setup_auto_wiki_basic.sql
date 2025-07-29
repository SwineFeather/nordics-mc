-- Auto Wiki Page Creation Setup - Basic Version (No Edge Functions Required)
-- Run this in your Supabase SQL Editor to set up the database functions first

-- Create a function to check if wiki pages exist for all entities
CREATE OR REPLACE FUNCTION check_wiki_pages_status()
RETURNS TABLE(
  entity_type TEXT,
  total_count INTEGER,
  pages_exist INTEGER,
  missing_pages INTEGER
) AS $$
BEGIN
  -- Check towns
  RETURN QUERY
  SELECT 
    'towns'::TEXT as entity_type,
    COUNT(*)::INTEGER as total_count,
    COUNT(CASE WHEN EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'wiki' 
      AND name LIKE 'Nordics/Towns/' || REPLACE(t.name, ' ', '_') || '.md'
    ) THEN 1 END)::INTEGER as pages_exist,
    COUNT(CASE WHEN NOT EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'wiki' 
      AND name LIKE 'Nordics/Towns/' || REPLACE(t.name, ' ', '_') || '.md'
    ) THEN 1 END)::INTEGER as missing_pages
  FROM public.towns t;
  
  -- Check nations
  RETURN QUERY
  SELECT 
    'nations'::TEXT as entity_type,
    COUNT(*)::INTEGER as total_count,
    COUNT(CASE WHEN EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'wiki' 
      AND name LIKE 'Nordics/Nations/' || REPLACE(n.name, ' ', '_') || '.md'
    ) THEN 1 END)::INTEGER as pages_exist,
    COUNT(CASE WHEN NOT EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'wiki' 
      AND name LIKE 'Nordics/Nations/' || REPLACE(n.name, ' ', '_') || '.md'
    ) THEN 1 END)::INTEGER as missing_pages
  FROM public.nations n;
END;
$$ LANGUAGE plpgsql;

-- Create a placeholder function for manual sync (will be updated later)
CREATE OR REPLACE FUNCTION sync_all_wiki_pages()
RETURNS TEXT AS $$
DECLARE
  town_count INTEGER := 0;
  nation_count INTEGER := 0;
BEGIN
  -- Count existing towns and nations
  SELECT COUNT(*) INTO town_count FROM public.towns;
  SELECT COUNT(*) INTO nation_count FROM public.nations;
  
  -- For now, just return a message (edge function will be added later)
  RETURN 'Ready to sync ' || town_count || ' towns and ' || nation_count || ' nations. Edge functions need to be deployed first.';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_all_wiki_pages() TO authenticated;
GRANT EXECUTE ON FUNCTION check_wiki_pages_status() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION sync_all_wiki_pages() IS 'Manually syncs all existing towns and nations to wiki pages';
COMMENT ON FUNCTION check_wiki_pages_status() IS 'Checks the status of wiki pages for all towns and nations';

-- Test the functions
SELECT 'Basic database functions created successfully!' as status;
SELECT check_wiki_pages_status(); 