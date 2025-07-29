-- Update Auto Wiki Functions with Correct Project Reference
-- Run this in your Supabase SQL Editor to enable the full automatic system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Update the function to call the wiki page creation edge function
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
  PERFORM
    net.http_post(
      url := 'https://erdconvorgecupvavlwv.supabase.co/functions/v1/create-wiki-page',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZGNvbnZvcmdlY3VwdmF2bHd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU4Mzg4NywiZXhwIjoyMDY1MTU5ODg3fQ.eQCYcODSB3Tb6z47iXMi_oqHmKaTqeVM1MGoSgx4MUk"}',
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

-- Update the function to manually sync all existing towns and nations
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
  PERFORM
    net.http_post(
      url := 'https://erdconvorgecupvavlwv.supabase.co/functions/v1/sync-all-wiki-pages',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZGNvbnZvcmdlY3VwdmF2bHd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU4Mzg4NywiZXhwIjoyMDY1MTU5ODg3fQ.eQCYcODSB3Tb6z47iXMi_oqHmKaTqeVM1MGoSgx4MUk"}',
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

-- Test the functions
SELECT 'Auto Wiki functions updated successfully!' as status;
SELECT check_wiki_pages_status(); 