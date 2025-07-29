-- Add storage policies for company logos in the existing nation-town-images bucket
-- Migration: 20250129000000_add_companies_storage_policies.sql

-- Allow public read access to company logos
CREATE POLICY "Company logos are publicly readable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'nation-town-images' AND name LIKE 'companies/%');

-- Allow company owners and staff to upload company logos
CREATE POLICY "Company owners can upload logos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'nation-town-images' 
  AND name LIKE 'companies/%'
  AND (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.owner_uuid = auth.uid()
      AND c.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);

-- Allow company owners and staff to update company logos
CREATE POLICY "Company owners can update logos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'nation-town-images' 
  AND name LIKE 'companies/%'
  AND (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.owner_uuid = auth.uid()
      AND c.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);

-- Allow company owners and staff to delete company logos
CREATE POLICY "Company owners can delete logos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'nation-town-images' 
  AND name LIKE 'companies/%'
  AND (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.owner_uuid = auth.uid()
      AND c.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
); 