# Town Gallery System Setup Guide

## Overview
The Town Gallery System allows mayors, co-mayors, and admins to upload, manage, and display photos for their towns. Photos are stored in Supabase Storage and metadata is stored in the database.

## Features
- ✅ Real file upload to Supabase Storage
- ✅ Database storage for photo metadata
- ✅ Role-based permissions (mayor, co-mayor, admin)
- ✅ Photo management (upload, edit, delete)
- ✅ Search functionality
- ✅ View counting
- ✅ Responsive gallery display

## Setup Steps

### 1. Run the Database Migration

Go to your Supabase dashboard → SQL Editor and run the migration:

```sql
-- Run the migration file: 20250104000000_create_town_gallery_table.sql
```

This creates:
- `town_gallery` table with proper structure
- RLS policies for security
- Indexes for performance
- Sample data for testing

### 2. Create Storage Bucket

In your Supabase dashboard → Storage:

1. Create a new bucket called `town-gallery`
2. Set it to **Public** (photos need to be publicly accessible)
3. Configure RLS policies:

```sql
-- Allow public read access to approved photos
CREATE POLICY "Public read access to town gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'town-gallery');

-- Allow authenticated users to upload (permissions checked in app)
CREATE POLICY "Authenticated users can upload to town gallery" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'town-gallery' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploads or authorized users
CREATE POLICY "Authorized users can delete from town gallery" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'town-gallery' 
    AND auth.role() = 'authenticated'
  );
```

### 3. Verify Setup

After running the migration and creating the bucket, you should see:

1. **Database**: `town_gallery` table with sample data
2. **Storage**: `town-gallery` bucket ready for uploads
3. **RLS**: Proper policies for security

## How It Works

### Photo Storage Location
Photos are stored in Supabase Storage at:
```
town-gallery/towns/{town-name}/{timestamp}.{extension}
```

Example:
```
town-gallery/towns/normannburg/1703123456789.jpg
```

### Database Structure
The `town_gallery` table stores:
- Photo metadata (title, description, tags)
- File information (path, URL, size, dimensions)
- Upload information (user, timestamp)
- View count and approval status

### Permissions
- **Mayors**: Full access to their town's gallery
- **Co-mayors**: Full access to their town's gallery  
- **Admins/Moderators**: Full access to all galleries
- **Regular users**: View-only access to approved photos

## Testing the System

### 1. Test Upload
1. Go to any town page
2. Click "Upload Photo" (if you have permissions)
3. Select an image file
4. Fill in title, description, and tags
5. Click "Upload Photo"

### 2. Test Gallery Display
1. Navigate to a town's gallery
2. Photos should display in a grid
3. Click on photos to view details
4. Test search functionality

### 3. Test Permissions
1. Try uploading as different user roles
2. Verify only authorized users can upload/delete
3. Check that regular users can only view

## Troubleshooting

### Common Issues

#### "Table 'town_gallery' does not exist"
- **Solution**: Run the migration file in Supabase SQL Editor

#### "Bucket 'town-gallery' does not exist"
- **Solution**: Create the storage bucket in Supabase dashboard

#### "Permission denied" errors
- **Solution**: Check RLS policies and user roles

#### "Upload failed" errors
- **Solution**: Verify storage bucket permissions and file size limits

#### Photos not displaying
- **Solution**: Check if photos are approved and bucket is public

### File Size Limits
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Recommended dimensions: 800x600 or larger

### Performance Notes
- Photos are served via CDN for fast loading
- Thumbnails are generated automatically
- Database queries are optimized with indexes

## API Endpoints

The gallery system uses these service methods:

```typescript
// Get town photos
TownGalleryService.getTownPhotos(townName)

// Upload photo
TownGalleryService.uploadPhoto(uploadData, userId)

// Delete photo
TownGalleryService.deletePhoto(photoId, userId)

// Update photo
TownGalleryService.updatePhoto(photoId, updates, userId)

// Search photos
TownGalleryService.searchPhotos(townName, query)

// Check permissions
TownGalleryService.checkGalleryPermissions(townName, userId)
```

## Security Features

- **RLS Policies**: Database-level security
- **Storage Policies**: File-level security
- **Role-based Access**: User permission checks
- **File Validation**: Type and size restrictions
- **Cleanup**: Automatic file cleanup on deletion

## Future Enhancements

Potential improvements:
- Image compression and optimization
- Multiple image upload
- Photo albums/collections
- Advanced search filters
- Photo moderation queue
- Social features (likes, comments)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database and storage setup
3. Test with different user roles
4. Check Supabase logs for backend errors 