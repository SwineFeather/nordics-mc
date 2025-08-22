# Clear Town Wiki Pages

This document explains how to clear all town wiki pages content in the Nordics World wiki system.

## Overview

The system provides multiple ways to clear town wiki pages:

1. **Admin Panel Button** - A user-friendly button in the admin interface
2. **Service Method** - Programmatic access via `SupabaseWikiService.clearTownWikiPages()`
3. **SQL Migration** - Database migration script
4. **Command Line Script** - Node.js script for direct execution

## What Gets Cleared

The system identifies and clears town wiki pages using multiple criteria:

- Pages in the "towns" category
- Pages with slugs starting with "town-" or ending with "-town"
- Pages with titles matching actual town names from the database
- Pages in subcategories with "town" in their name or slug

## Method 1: Admin Panel Button

1. Navigate to `/admin` in your application
2. Look for the "Clear Town Wiki Pages" card
3. Click the "Clear All Town Wiki Pages" button
4. Confirm the action (requires double confirmation)
5. Wait for the process to complete

**Features:**
- Double confirmation to prevent accidental clearing
- Real-time feedback on success/failure
- Shows count of cleared pages
- Error handling with user-friendly messages

## Method 2: Service Method

```typescript
import { SupabaseWikiService } from '@/services/supabaseWikiService';

// Clear all town wiki pages
const result = await SupabaseWikiService.clearTownWikiPages();

if (result.success) {
  console.log(`Cleared ${result.clearedCount} town wiki pages`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

**Return Value:**
```typescript
{
  success: boolean;
  clearedCount: number;
  error?: string;
}
```

## Method 3: SQL Migration

Run the migration file: `supabase/migrations/20250131000005_clear_town_wiki_pages.sql`

This migration:
- Updates all town-related wiki pages to have empty content
- Updates timestamps to reflect the change
- Logs the number of pages cleared

## Method 4: Command Line Script

### Prerequisites

1. Install `tsx` for TypeScript execution:
   ```bash
   npm install -g tsx
   ```

2. Set environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Usage

```bash
npm run clear-town-wiki
```

Or directly:
```bash
tsx src/scripts/clearTownWikiPages.ts
```

### Output Example

```
🗑️ Starting to clear all town wiki pages content...
🔍 Looking for towns category...
✅ Found towns category, clearing pages...
✅ Cleared 15 pages in towns category
🔍 Clearing pages with town-related slugs...
✅ Cleared 3 pages with town-related slugs
🔍 Fetching town names from database...
🔍 Found 25 towns, clearing matching pages...
✅ Cleared 25 pages with town names as titles
🔍 Looking for town-related subcategories...
🔍 Found 2 town-related subcategories, clearing pages...
✅ Cleared 8 pages in town subcategories

🎉 Successfully cleared content for 51 town wiki pages!
📝 All town pages now have empty content and can be edited fresh.
✅ Script completed successfully
```

## Safety Features

- **Double Confirmation** in admin panel
- **Comprehensive Logging** for audit trails
- **Error Handling** with detailed error messages
- **Transaction Safety** - updates are atomic
- **Backup Friendly** - only clears content, preserves page structure

## What Happens After Clearing

1. **Page Structure Preserved** - All pages remain with their titles, slugs, and metadata
2. **Content Cleared** - All content is set to empty strings
3. **Timestamps Updated** - `last_edited_at` and `updated_at` are set to current time
4. **Ready for Editing** - Pages can be immediately edited with new content

## Recovery

If you need to restore content:

1. **Database Backup** - Restore from your latest database backup
2. **Git History** - If using Git, restore from previous commits
3. **Manual Recreation** - Recreate content manually through the wiki editor

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you have admin access
   - Check Supabase RLS policies
   - Verify service role key permissions

2. **Missing Environment Variables**
   - Check `.env` file configuration
   - Verify Supabase URL and service key

3. **Database Connection Issues**
   - Check Supabase service status
   - Verify network connectivity
   - Check firewall settings

### Error Messages

- **"Failed to find towns category"** - No towns category exists yet
- **"Permission denied"** - Insufficient database permissions
- **"Connection failed"** - Database connectivity issues

## Support

For issues or questions:
1. Check the application logs
2. Review Supabase dashboard logs
3. Contact the development team

---

**⚠️ Warning: This action cannot be undone. Always ensure you have backups before clearing wiki content.**






