-- Auto Wiki Page Creation Setup - Manual Installation
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Create function to call the wiki page creation edge function
CREATE OR REPLACE FUNCTION create_wiki_page_automatically()
RETURNS TRIGGER AS $$
DECLARE
  entity_type TEXT;
  entity_id TEXT;
  entity_name TEXT;
BEGIN
  -- Determine the entity type and get the necessary data
  IF TG_TABLE_NAME = 'towns' THEN
    entity_type := 'town';
    entity_id := NEW.id::TEXT;
    entity_name := NEW.name;
  ELSIF TG_TABLE_NAME = 'nations' THEN
    entity_type := 'nation';
    entity_id := NEW.id::TEXT;
    entity_name := NEW.name;
  ELSE
    RETURN NEW;
  END IF;

  -- Call the edge function to create the wiki page
  -- Note: You'll need to replace 'your-project-ref' with your actual project reference
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/create-wiki-page',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      body := json_build_object(
        'entity_type', entity_type,
        'entity_id', entity_id,
        'entity_name', entity_name,
        'table_name', TG_TABLE_NAME
      )::TEXT
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert/update
    RAISE WARNING 'Failed to create wiki page for % %: %', entity_type, entity_name, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for towns table
DROP TRIGGER IF EXISTS trigger_create_town_wiki_page ON public.towns;
CREATE TRIGGER trigger_create_town_wiki_page
  AFTER INSERT ON public.towns
  FOR EACH ROW
  EXECUTE FUNCTION create_wiki_page_automatically();

-- Create trigger for nations table
DROP TRIGGER IF EXISTS trigger_create_nation_wiki_page ON public.nations;
CREATE TRIGGER trigger_create_nation_wiki_page
  AFTER INSERT ON public.nations
  FOR EACH ROW
  EXECUTE FUNCTION create_wiki_page_automatically();

-- Create a function to manually sync all existing towns and nations
CREATE OR REPLACE FUNCTION sync_all_wiki_pages()
RETURNS TEXT AS $$
DECLARE
  town_count INTEGER := 0;
  nation_count INTEGER := 0;
  result TEXT;
BEGIN
  -- Count existing towns and nations
  SELECT COUNT(*) INTO town_count FROM public.towns;
  SELECT COUNT(*) INTO nation_count FROM public.nations;
  
  -- Call the edge function to sync all pages
  -- Note: You'll need to replace 'your-project-ref' with your actual project reference
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/sync-all-wiki-pages',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      body := json_build_object(
        'town_count', town_count,
        'nation_count', nation_count
      )::TEXT
    );
  
  result := 'Syncing ' || town_count || ' towns and ' || nation_count || ' nations to wiki pages';
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error syncing wiki pages: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_wiki_page_automatically() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_wiki_pages() TO authenticated;
GRANT EXECUTE ON FUNCTION check_wiki_pages_status() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION create_wiki_page_automatically() IS 'Automatically creates wiki pages when new towns or nations are added to the database';
COMMENT ON FUNCTION sync_all_wiki_pages() IS 'Manually syncs all existing towns and nations to wiki pages';
COMMENT ON FUNCTION check_wiki_pages_status() IS 'Checks the status of wiki pages for all towns and nations';

-- Test the functions
SELECT 'Database functions created successfully!' as status;
SELECT check_wiki_pages_status(); 