# Supabase Storage Setup Guide

## Overview
This guide will help you set up the Supabase storage bucket for town and nation images.

## Step 1: Create the Storage Bucket

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create the Bucket**
   - **Bucket name**: `nation-town-images`
   - **Public bucket**: ✅ Check this (images need to be publicly accessible)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`
   - Click "Create bucket"

## Step 2: Set Up Row Level Security (RLS) Policies

After creating the bucket, you need to set up RLS policies to control access:

### For Nations (nations folder)
```sql
-- Allow public read access to nation images
CREATE POLICY "Nation images are publicly readable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'nation-town-images' AND storage.foldername(name) = 'nations');

-- Allow nation leaders and staff to upload nation images
CREATE POLICY "Nation leaders can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'nation-town-images' 
  AND storage.foldername(name) = 'nations'
  AND (
    EXISTS (
      SELECT 1 FROM public.nations n 
      WHERE n.leader_name = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
      AND n.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);

-- Allow nation leaders and staff to update nation images
CREATE POLICY "Nation leaders can update images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'nation-town-images' 
  AND storage.foldername(name) = 'nations'
  AND (
    EXISTS (
      SELECT 1 FROM public.nations n 
      WHERE n.leader_name = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
      AND n.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);
```

### For Towns (towns folder)
```sql
-- Allow public read access to town images
CREATE POLICY "Town images are publicly readable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'nation-town-images' AND storage.foldername(name) = 'towns');

-- Allow town mayors and staff to upload town images
CREATE POLICY "Town mayors can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'nation-town-images' 
  AND storage.foldername(name) = 'towns'
  AND (
    EXISTS (
      SELECT 1 FROM public.towns t 
      WHERE t.mayor = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
      AND t.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);

-- Allow town mayors and staff to update town images
CREATE POLICY "Town mayors can update images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'nation-town-images' 
  AND storage.foldername(name) = 'towns'
  AND (
    EXISTS (
      SELECT 1 FROM public.towns t 
      WHERE t.mayor = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
      AND t.name = SPLIT_PART(name, '/', 2)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
);
```

## Step 3: Run the Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add image_url field to towns table
ALTER TABLE public.towns 
ADD COLUMN image_url TEXT;

-- Add a comment to explain the field
COMMENT ON COLUMN public.towns.image_url IS 'URL to the town image uploaded by the town mayor. Should be a direct link to an image hosted externally (e.g., Discord, Imgur, etc.) or Supabase storage.';

-- Create an index for better performance when querying by image_url
CREATE INDEX IF NOT EXISTS idx_towns_image_url ON public.towns(image_url);
```

## Step 4: Test the Setup

1. **Test Nation Image Upload**:
   - Go to `/towns` page
   - Click on a nation
   - Click "Update Image" button
   - Upload an image
   - Verify it appears correctly

2. **Test Town Image Upload**:
   - Go to `/town/Garvia` (or any town page)
   - Click "Update Image" button
   - Upload an image
   - Verify it appears correctly

## File Structure

After setup, your storage bucket will have this structure:
```
nation-town-images/
├── nations/
│   ├── north_sea_league.png
│   ├── constellation.png
│   └── ...
└── towns/
    ├── garvia.png
    ├── normannburg.png
    ├── goteborg.png (from Göteborg)
    ├── malmo.png (from Malmö)
    ├── arhus.png (from Århus)
    └── ...
```

## Nordic Character Support

The system now properly handles Nordic characters and other special characters:

### Character Mapping Examples:
- **Göteborg** → `goteborg.png`
- **Malmö** → `malmo.png`
- **Århus** → `arhus.png`
- **Örebro** → `orebro.png`
- **Ängelholm** → `angelholm.png`
- **Härnösand** → `harnosand.png`
- **Östersund** → `ostersund.png`
- **Åmål** → `amal.png`
- **Örnsköldsvik** → `ornskoldsvik.png`
- **Älvsbyn** → `alvsbyn.png`

### Other Special Characters:
- **São Paulo** → `sao_paulo.png`
- **München** → `munchen.png`
- **Córdoba** → `cordoba.png`
- **Liège** → `liege.png`
- **København** → `kobenhavn.png`

The system uses Unicode normalization and character mapping to ensure all special characters are handled correctly while maintaining readable filenames.

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**:
   - Make sure the bucket name is exactly `nation-town-images`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**:
   - Verify RLS policies are set up correctly
   - Check that the user has the correct role/permissions
   - Make sure the user is logged in

3. **"Column does not exist" error**:
   - Run the database migration to add the `image_url` column
   - Refresh your TypeScript types if needed

4. **Images not displaying**:
   - Check that the bucket is public
   - Verify the image URLs are correct
   - Check browser console for CORS errors

5. **Nordic characters not working**:
   - The system now supports Nordic characters (å, ä, ö, etc.)
   - Characters are automatically normalized to safe filenames
   - Example: "Göteborg" becomes "goteborg.png"
   - Check the character mapping examples above

### Debugging:

1. **Check bucket permissions**:
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'nation-town-images';
   ```

2. **Check RLS policies**:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'nation-town-images';
   ```

3. **Test file upload manually**:
   - Go to Storage in Supabase dashboard
   - Try uploading a file manually to test permissions

## Security Notes

- The bucket is public for read access (images need to be accessible)
- Upload/update permissions are restricted to appropriate users
- File size and type restrictions are enforced
- Consider implementing additional validation if needed

## Next Steps

After completing this setup:

1. Test both nation and town image uploads
2. Update your TypeScript types if needed
3. Consider adding image optimization features
4. Monitor storage usage and costs 