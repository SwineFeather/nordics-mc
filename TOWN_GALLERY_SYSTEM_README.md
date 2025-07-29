# Town Gallery System

A comprehensive photo gallery system for towns that allows mayors, co-mayors, and admins to upload, manage, and share photos of their towns.

## Features

### 🖼️ Photo Management
- **Upload Photos**: Drag-and-drop or click-to-upload interface
- **Photo Details**: Title, description, tags, and metadata
- **File Validation**: Image type and size validation (5MB limit)
- **Preview**: Real-time image preview before upload

### 👥 Role-Based Permissions
- **Mayors**: Full access to their town's gallery
- **Co-Mayors**: Full access to their town's gallery (new role)
- **Admins**: Full access to all town galleries
- **Regular Users**: View-only access to all galleries

### 🔍 Search & Discovery
- **Search Photos**: By title, description, or tags
- **View Modes**: Grid and list view options
- **Photo Details**: Full-screen view with metadata
- **Download**: Direct download of photos

### 📊 Analytics
- **View Counts**: Track how many times each photo is viewed
- **Upload Tracking**: Record who uploaded each photo and when
- **Activity Logging**: Comprehensive audit trail

## Database Schema

### `town_gallery` Table
```sql
CREATE TABLE public.town_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_username TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## File Structure

```
src/
├── services/
│   ├── townGalleryService.ts          # Main gallery service
│   └── supabaseTownService.ts         # Updated with co-mayor support
├── hooks/
│   └── useTownGallery.tsx             # Gallery state management
├── components/towns/
│   ├── TownPhotoGallery.tsx           # Main gallery component
│   ├── TownPhotoUploadDialog.tsx      # Upload dialog
│   └── TownPhotoDetailDialog.tsx      # Photo detail dialog
└── supabase/migrations/
    └── 20250105000000_create_town_gallery.sql  # Database migration
```

## Usage

### Basic Gallery Display
```tsx
import TownPhotoGallery from '@/components/towns/TownPhotoGallery';

<TownPhotoGallery townName="Normannburg" />
```

### Using the Gallery Hook
```tsx
import { useTownGallery } from '@/hooks/useTownGallery';

const { photos, permissions, uploadPhoto, deletePhoto } = useTownGallery('Normannburg');
```

### Uploading a Photo
```tsx
const uploadData = {
  town_name: 'Normannburg',
  title: 'Town Hall',
  description: 'The magnificent town hall building',
  tags: ['building', 'government'],
  file: imageFile
};

await uploadPhoto(uploadData);
```

## Co-Mayor Role System

The system includes a new co-mayor role that grants the same permissions as mayors:

### Database Integration
- Co-mayors are stored in the `residents` JSONB field with `is_co_mayor: true`
- The system checks for co-mayor status when determining permissions

### Permission Checking
```tsx
// Check if user is co-mayor
const isCoMayor = await SupabaseTownService.isUserCoMayor(townName, username);

// Check gallery permissions
const permissions = await TownGalleryService.checkGalleryPermissions(townName, userId);
```

## Security Features

### Row Level Security (RLS)
- Public read access for approved photos
- Authenticated users can only manage their authorized town galleries
- Admin and moderator roles have full access

### File Upload Security
- File type validation (images only)
- File size limits (5MB)
- Secure file storage in Supabase Storage
- Automatic cleanup on deletion

### Permission Validation
- Server-side permission checking
- Client-side permission display
- Audit trail for all actions

## Setup Instructions

### 1. Run Database Migration
```sql
-- Run the migration in your Supabase SQL Editor
-- File: supabase/migrations/20250105000000_create_town_gallery.sql
```

### 2. Configure Storage Bucket
Ensure your Supabase project has a `public` storage bucket configured for file uploads.

### 3. Update Environment Variables
Make sure your Supabase configuration is properly set up in your environment.

### 4. Test the System
1. Navigate to a town page
2. Click on the "Gallery" tab
3. Try uploading a photo (if you have permissions)
4. Test search and view functionality

## API Endpoints

The system uses the following Supabase operations:

### Photos
- `GET /town_gallery` - Fetch town photos
- `POST /town_gallery` - Upload new photo
- `PUT /town_gallery/:id` - Update photo metadata
- `DELETE /town_gallery/:id` - Delete photo

### Storage
- `POST /storage/public` - Upload file
- `DELETE /storage/public` - Delete file

## Error Handling

The system includes comprehensive error handling:

- **Upload Errors**: File validation, size limits, network issues
- **Permission Errors**: Unauthorized access attempts
- **Database Errors**: Connection issues, constraint violations
- **Storage Errors**: File upload/download failures

## Performance Considerations

- **Image Optimization**: Consider implementing image resizing for thumbnails
- **Lazy Loading**: Photos are loaded on demand
- **Caching**: Supabase handles caching automatically
- **Pagination**: Consider adding pagination for large galleries

## Future Enhancements

- **Image Editing**: Basic cropping and filters
- **Bulk Upload**: Multiple photo upload
- **Photo Albums**: Organize photos into collections
- **Social Features**: Likes, comments, sharing
- **Advanced Search**: Filter by date, size, uploader
- **Photo Contests**: Community voting system
- **Integration**: Connect with external photo services

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and type
2. **Permission Denied**: Verify user role and town association
3. **Photos Not Loading**: Check database connection and RLS policies
4. **Storage Errors**: Verify Supabase Storage configuration

### Debug Mode
Enable console logging to debug issues:
```tsx
// In townGalleryService.ts
console.log('Debug info:', { townName, userId, permissions });
```

## Contributing

When contributing to the gallery system:

1. Follow the existing code structure
2. Add proper error handling
3. Include permission checks
4. Update documentation
5. Test with different user roles

## License

This gallery system is part of the Nordics Nexus Forge project. 