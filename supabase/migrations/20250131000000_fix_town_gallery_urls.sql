-- Fix town gallery URLs by converting old custom domain URLs to Supabase URLs
-- Migration: 20250131000000_fix_town_gallery_urls.sql

-- Update existing town gallery URLs that use the old custom domain
UPDATE town_gallery 
SET file_url = REPLACE(
  file_url, 
  'https://storage.nordics.world/storage/v1/object/public/nation-town-images/',
  'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/'
)
WHERE file_url LIKE 'https://storage.nordics.world/storage/v1/object/public/nation-town-images/%';

-- Log the number of updated records
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % town gallery URLs from custom domain to Supabase URLs', updated_count;
END $$;

