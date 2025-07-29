# Database Errors Fix Guide

This guide will help you fix the database errors you're seeing in your application console.

## Errors Being Fixed

1. **406 Not Acceptable** - `notification_settings` table permission issues
2. **404 Not Found** - `get_player_profile` function missing
3. **42P01** - `player_profiles_view` relation does not exist
4. **42703** - `profiles.username` column does not exist
5. **400 Bad Request** - Wiki storage and comment issues

## Quick Fix (Recommended)

### Option 1: Use Supabase SQL Editor (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `fix_database_errors_simple.sql`
4. Click **Run** to execute the script
5. Refresh your application

### Option 2: Use Supabase CLI

1. Make sure you have Supabase CLI installed
2. Run the shell script:
   ```bash
   chmod +x run_database_fix.sh
   ./run_database_fix.sh
   ```

### Option 3: Manual Migration

1. Copy the contents of `fix_database_errors.sql`
2. Run it in your Supabase SQL Editor
3. This is a more comprehensive fix that recreates tables

## What the Fix Does

### 1. Notification Settings
- Fixes permission issues with the `notification_settings` table
- Ensures authenticated users can read/write their own settings

### 2. Player Profile Function
- Recreates the `get_player_profile` function
- Ensures proper permissions for authenticated and anonymous users

### 3. Player Profiles View
- Creates the missing `player_profiles_view`
- Provides a unified view of player data

### 4. Profiles Table
- Adds the missing `username` column
- Populates it with `minecraft_username` or `full_name` values
- Creates proper indexes for performance

### 5. Wiki System
- Ensures all wiki tables exist (`wiki_comments`, `wiki_pages`, `wiki_categories`)
- Sets up proper Row Level Security (RLS) policies
- Grants necessary permissions

### 6. Players Table
- Adds missing columns (`username`, `first_joined`, `last_seen`, `is_online`, `profile_id`)
- Updates data consistency

## Verification

After running the fix, you should see:

1. ✅ No more 406 errors for notification settings
2. ✅ No more 404 errors for `get_player_profile`
3. ✅ No more 42P01 errors for `player_profiles_view`
4. ✅ No more 42703 errors for missing username column
5. ✅ Wiki comments and pages working properly

## Troubleshooting

### If you still see errors:

1. **Check Supabase Logs**: Go to your Supabase dashboard → Logs to see detailed error messages
2. **Verify Permissions**: Ensure your RLS policies are working correctly
3. **Check Data**: Make sure your tables have the expected data structure

### Common Issues:

1. **RLS Policies**: If you're still getting permission errors, check that your RLS policies are correctly configured
2. **Foreign Keys**: Ensure all foreign key relationships are properly set up
3. **Data Types**: Verify that column data types match what your application expects

## Rollback (If Needed)

If something goes wrong, you can:

1. Check your Supabase dashboard for any failed migrations
2. Use the Supabase CLI to reset your database: `supabase db reset --linked`
3. Restore from a backup if you have one

## Support

If you continue to experience issues after applying these fixes:

1. Check the Supabase documentation for your specific error codes
2. Review your application logs for additional context
3. Ensure your Supabase project is properly configured

---

**Note**: These fixes are designed to be safe and non-destructive. They add missing columns and functions without dropping existing data. 