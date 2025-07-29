# Automatic Wiki Page Creation Setup Guide

This guide will help you set up the automatic wiki page creation system for towns and nations in the Nordics wiki.

## Overview

The automatic wiki page creation system consists of:

1. **Database Triggers**: Automatically create wiki pages when new towns/nations are added
2. **Supabase Edge Functions**: Handle the actual wiki page creation in the storage bucket
3. **Frontend Management**: Admin interface to monitor and manage the system
4. **Service Layer**: TypeScript services for integration

## Features

- ✅ **Automatic Creation**: Wiki pages are created instantly when new towns/nations are added
- ✅ **Organized Structure**: Pages are created in `Nordics/Towns/` and `Nordics/Nations/` folders
- ✅ **Index Pages**: README files with lists and statistics for all towns/nations
- ✅ **Placeholder Content**: Structured templates with database data and editable sections
- ✅ **Admin Interface**: Monitor progress, sync existing data, and manage the system
- ✅ **Error Handling**: Graceful handling of failures with detailed logging

## Setup Steps

### 1. Run the Database Migration

First, run the migration to create the necessary database functions and triggers:

```sql
-- Run the migration file: supabase/migrations/20250115000000_auto_wiki_pages.sql
```

This will create:
- Database triggers for automatic wiki page creation
- Functions to check wiki page status
- Functions to manually sync all pages
- Proper permissions and error handling

### 2. Deploy the Edge Functions

Deploy the two Supabase Edge Functions:

```bash
# Deploy the single page creation function
supabase functions deploy create-wiki-page

# Deploy the bulk sync function
supabase functions deploy sync-all-wiki-pages
```

### 3. Set Up Environment Variables

Make sure your Supabase project has the necessary environment variables:

```bash
# In your Supabase dashboard → Settings → Environment Variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Verify the Wiki Storage Bucket

Ensure the `wiki` storage bucket exists and has proper permissions:

```sql
-- Check if the wiki bucket exists
SELECT * FROM storage.buckets WHERE id = 'wiki';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('wiki', 'wiki', true)
ON CONFLICT (id) DO NOTHING;
```

### 5. Test the System

1. **Check the Admin Panel**: Go to `/admin` and look for the "Automatic Wiki Page Manager" section
2. **Test Manual Sync**: Click "Sync All Wiki Pages" to create pages for existing towns/nations
3. **Test Automatic Creation**: Add a new town or nation to the database and verify a wiki page is created

## File Structure

After setup, your wiki bucket will have this structure:

```
wiki/
└── Nordics/
    ├── Towns/
    │   ├── README.md (index page)
    │   ├── Town1.md
    │   ├── Town2.md
    │   └── ...
    └── Nations/
        ├── README.md (index page)
        ├── Nation1.md
        ├── Nation2.md
        └── ...
```

## Wiki Page Templates

### Town Pages
Each town page includes:
- **Quick Stats**: Mayor, population, type, status, founded date, nation
- **Structured Sections**: Description, history, notable locations, economy, government, culture
- **Auto-generated Data**: All data from the database
- **Editable Placeholders**: Clear sections for editors to add content

### Nation Pages
Each nation page includes:
- **Quick Stats**: Leader, capital, population, type, government, founded date, motto
- **Structured Sections**: Description, history, government, capital, economy, military, diplomacy, culture
- **Specialties**: List of nation specialties from the database
- **Auto-generated Data**: All data from the database
- **Editable Placeholders**: Clear sections for editors to add content

## Admin Interface

The admin interface provides:

### Status Overview
- Overall progress percentage
- Individual progress for towns and nations
- System status (enabled/disabled)

### Management Tools
- **Sync All Wiki Pages**: Create pages for all existing towns/nations
- **Refresh Status**: Update the current status
- **Progress Tracking**: Visual progress bars and statistics

### Recent Activity
- Recently created towns (last 7 days)
- Recently created nations (last 7 days)
- Creation dates and timestamps

## Database Functions

The system creates several database functions:

### `create_wiki_page_automatically()`
- Trigger function that runs when new towns/nations are added
- Calls the edge function to create the wiki page
- Handles errors gracefully without failing the insert

### `sync_all_wiki_pages()`
- Manually sync all existing towns and nations
- Returns a summary of the operation
- Can be called from the admin interface

### `check_wiki_pages_status()`
- Returns the status of wiki pages for all entities
- Shows total count, pages that exist, and missing pages
- Used by the admin interface for progress tracking

## Edge Functions

### `create-wiki-page`
- Creates a single wiki page for a town or nation
- Fetches data from the database
- Generates markdown content with proper frontmatter
- Uploads to the wiki storage bucket

### `sync-all-wiki-pages`
- Creates wiki pages for all existing towns and nations
- Creates index pages (README.md) for both folders
- Handles bulk operations with error reporting
- Returns detailed results of the operation

## Error Handling

The system includes comprehensive error handling:

- **Database Errors**: Logged but don't fail the main operation
- **Storage Errors**: Detailed error messages with specific file paths
- **Network Errors**: Retry logic and fallback mechanisms
- **User Feedback**: Toast notifications for success/failure states

## Monitoring and Maintenance

### Regular Checks
- Monitor the admin interface for missing pages
- Check edge function logs for errors
- Verify new towns/nations get wiki pages created

### Troubleshooting
- **Missing Pages**: Use "Sync All Wiki Pages" to create missing pages
- **Function Errors**: Check Supabase Edge Function logs
- **Database Issues**: Verify triggers and functions are properly installed

## Customization

### Modifying Templates
Edit the content generation functions in the edge functions:
- `generateTownContent()` in `create-wiki-page/index.ts`
- `generateNationContent()` in `create-wiki-page/index.ts`
- `generateTownsIndexContent()` in `sync-all-wiki-pages/index.ts`
- `generateNationsIndexContent()` in `sync-all-wiki-pages/index.ts`

### Adding New Fields
When adding new fields to towns or nations tables:
1. Update the database schema
2. Modify the content generation functions
3. Test with new data

### Changing File Structure
To change the folder structure:
1. Update the `folderPath` variables in both edge functions
2. Update the database function that checks for existing pages
3. Test the changes thoroughly

## Security Considerations

- **RLS Policies**: All database operations use proper RLS policies
- **Service Role**: Edge functions use service role for storage access
- **Input Validation**: All inputs are validated and sanitized
- **Error Logging**: Errors are logged but don't expose sensitive information

## Performance Considerations

- **Bulk Operations**: The sync function handles bulk operations efficiently
- **Error Isolation**: Individual page creation failures don't affect others
- **Progress Tracking**: Real-time progress updates for long operations
- **Caching**: Status information is cached to reduce database queries

## Future Enhancements

Potential improvements for the system:

- **Scheduled Sync**: Automatic periodic sync of all pages
- **Page Updates**: Update existing pages when database data changes
- **Image Integration**: Automatic inclusion of town/nation images
- **Advanced Templates**: More sophisticated content generation
- **Analytics**: Track page views and edits
- **Notifications**: Alert admins when pages are created or fail

## Support

If you encounter issues:

1. Check the Supabase Edge Function logs
2. Verify database functions are properly installed
3. Test the admin interface status
4. Review the error handling and logging
5. Check storage bucket permissions

The system is designed to be robust and self-healing, with comprehensive error handling and user feedback. 