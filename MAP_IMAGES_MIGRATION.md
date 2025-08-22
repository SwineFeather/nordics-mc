# Map Images Migration to Supabase Storage

This document outlines the migration of map images from the local project to Supabase storage to reduce project size and improve performance.

## What Was Changed

### 1. New Files Created
- `src/utils/supabaseStorage.ts` - Utility functions for managing map images in Supabase storage
- `supabase/migrations/20250131000023_create_map_images_storage.sql` - Database migration for storage bucket
- `scripts/upload-map-images.js` - Script to upload images to Supabase storage
- `MAP_IMAGES_MIGRATION.md` - This documentation file

### 2. Files Modified
- `src/components/nyrvalos/TextureSelector.tsx` - Updated to use Supabase storage URLs
- `src/pages/Nyrvalos.tsx` - Updated to use Supabase storage URLs
- `src/utils/processCoastalMask.ts` - Updated to use Supabase storage URLs
- `src/components/HeroSection.tsx` - Updated to use Supabase storage URLs
- `src/components/map/MapContainer.tsx` - Updated to use Supabase storage URLs for political maps

## Migration Steps

### Step 1: Set Up Environment Variables
Add the following to your `.env` file:
```bash
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Run the Database Migration
```bash
npx supabase db push
```

### Step 3: Install Required Dependencies
```bash
npm install dotenv
```

### Step 4: Upload Images to Supabase Storage
```bash
node scripts/upload-map-images.js
```

### Step 5: Test the Application
1. Start your development server
2. Navigate to the Nyrvalos page
3. Navigate to the Map page and test different political map dates
4. Verify that all textures and political maps are loading correctly from Supabase storage

### Step 6: Remove Local Images (Optional)
After confirming everything works correctly, you can remove the local images:
```bash
rm -rf nyrvalos/
rm -rf public/lovable-uploads/political-map/
```

## Storage Bucket Details

- **Bucket Name**: `map-images`
- **Public Access**: Yes (read-only for public)
- **File Size Limit**: 100MB per file
- **Supported Formats**: JPG, PNG, GIF, WebP

## Image Files Included

The following images are configured for migration:

### Nyrvalos Textures
- Base layer textures (low, med, full quality)
- Heightmap textures (low, med, full quality)
- Terrain textures (low, med, full quality)
- Misc textures (low, med, full quality)
- Heightmap vector textures (low, med, full quality)
- Legacy political map

### Political Maps
- 2025-04-20.jpg (8.7MB)
- 2024-02-24.png (19MB)
- 2024-01-06.png (18MB)
- 2023-12-21.jpg (7.4MB)
- 2023-11-12.png (19MB)
- 2023-10-29.png (19MB)
- 2023-10-10.png (8.6MB)
- 2023-10-08.png (6.2MB)
- 2023-10-02.png (9.7MB)
- 2023-10-01.png (4.7MB)

**Total Size Being Migrated**: Approximately 150MB+ of image files

## Benefits of This Migration

1. **Reduced Project Size**: Removes large image files from the repository
2. **Better Performance**: Images served from Supabase CDN
3. **Scalability**: Easier to manage and update images
4. **Version Control**: Cleaner git history without binary files
5. **Cost Effective**: Supabase storage is more cost-effective than serving large files

## Troubleshooting

### Images Not Loading
1. Check that the Supabase storage bucket exists
2. Verify that images were uploaded successfully
3. Check browser console for CORS errors
4. Ensure environment variables are set correctly

### Upload Script Errors
1. Verify you have the correct service role key
2. Check that the `nyrvalos/` and `public/lovable-uploads/political-map/` directories exist
3. Ensure you have sufficient storage quota in Supabase

### Performance Issues
1. Consider using image optimization services
2. Implement lazy loading for large images
3. Use appropriate quality settings based on user preferences

## Rollback Plan

If you need to rollback to local images:
1. Restore the original file paths in the modified components
2. Remove the Supabase storage utility imports
3. Restore the local image files

## Future Enhancements

1. **Image Optimization**: Implement automatic image resizing and compression
2. **CDN Integration**: Use Supabase's CDN for even better performance
3. **Image Management**: Create an admin interface for managing map images
4. **Caching**: Implement client-side caching for frequently used images
5. **Political Map Timeline**: Add more sophisticated date-based navigation for political maps
