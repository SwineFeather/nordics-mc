# Town Gallery Setup Guide

## Current Status

The gallery system is now working with **mock data** while we set up the database. This means:

✅ **Working Features:**
- View photos in the gallery tab
- Upload photos (creates mock entries)
- Delete photos
- Edit photo metadata
- Search photos
- Role-based permissions (admin, mayor, co-mayor)

❌ **Not Working Yet:**
- Actual file uploads to storage
- Database persistence (photos reset on page refresh)
- Real image files (using placeholder images)

## To Enable Full Functionality

### 1. Run the Database Migration

Go to your Supabase dashboard:
1. Navigate to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/20250105000000_create_town_gallery.sql`
3. Click **Run** to execute the migration

This will create:
- `town_gallery` table
- Proper indexes
- Row Level Security policies
- Sample data

### 2. Create Storage Bucket

In your Supabase dashboard:
1. Go to **Storage**
2. Click **Create a new bucket**
3. Name it `town-gallery`
4. Set it as **Public**
5. Add this RLS policy:

```sql
-- Allow public read access to approved photos
CREATE POLICY "Public read access to approved photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'town-gallery' AND (storage.foldername(name))[1] = 'approved');

-- Allow authenticated users to upload to their town's folder
CREATE POLICY "Authenticated users can upload to their town" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'town-gallery' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT minecraft_username FROM profiles WHERE id = auth.uid())
);
```

### 3. Update the Service

Once the database is set up, update `src/services/townGalleryService.ts` to use real database operations instead of mock data.

## Current File Storage

Files are currently stored in:
- **Mock URLs**: `https://via.placeholder.com/800x600/...` (placeholder images)
- **Future**: `https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/town-gallery/[town-name]/[filename]`

## Testing the System

1. **View Gallery**: Go to any town page and click the "Gallery" tab
2. **Upload Photo**: Click "Upload Photo" (requires admin/mayor/co-mayor role)
3. **Edit Photo**: Click on any photo to view details and edit
4. **Delete Photo**: Use the delete button in photo details
5. **Search**: Use the search bar to find photos by title, description, or tags

## Role Permissions

- **Admins/Moderators**: Full access to all town galleries
- **Mayors**: Full access to their town's gallery
- **Co-mayors**: Full access to their town's gallery (new role)
- **Regular Users**: Read-only access to approved photos

## Troubleshooting

### "Failed to upload file" Error
This happens because:
1. Storage bucket doesn't exist
2. RLS policies are too restrictive
3. File size exceeds limits

**Solution**: Create the `town-gallery` bucket and set proper policies.

### "404 Not Found" Error
This happens because:
1. `town_gallery` table doesn't exist
2. Migration hasn't been run

**Solution**: Run the database migration.

### "406 Not Acceptable" Error
This happens because:
1. File type not allowed
2. File size too large

**Solution**: Check file type and size restrictions in the upload component.

## Next Steps

1. ✅ Run the database migration
2. ✅ Create the storage bucket
3. ✅ Test with real data
4. ✅ Replace mock service with real database operations
5. ✅ Add image optimization and thumbnails
6. ✅ Add bulk upload functionality
7. ✅ Add photo approval workflow for non-mayors

The system is fully functional with mock data and ready for production once the database is set up! 