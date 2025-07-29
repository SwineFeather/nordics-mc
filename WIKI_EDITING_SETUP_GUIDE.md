# Wiki Editing Setup Guide

## 🚨 Current Issues & Solutions

### Issue 1: RLS Policy Error
**Error**: `new row violates row-level security policy`

**Solution**: Run the database migration to fix storage permissions:

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/20250116000000_fix_wiki_storage_rls.sql`
3. Click **Run** to execute the migration

This will create the necessary RLS policies for the `wiki` storage bucket.

### Issue 2: Edit Button Not Working
**Problem**: Edit button not showing up or not functional

**Solution**: The edit button is now available for all authenticated users during development.

## 🧪 Testing the Wiki Editing

### Step 1: Create a Test Page
1. Navigate to `/wiki` in your application
2. Click the **"🧪 Test Page"** button (if logged in)
3. Wait for the success message
4. Refresh the page to see the new test page

### Step 2: Test Editing
1. Find the test page in the sidebar (should be under "Nordics" category)
2. Click on the test page to open it
3. Click the **"Edit"** button in the page header
4. Make some changes to the content
5. Click **"Save"** to save your changes
6. Verify the changes are saved

### Step 3: Debug Information
1. Click the **"🔍 Debug"** button to see current user role and permissions
2. Check the browser console for detailed debug information
3. Use this to verify the user authentication and permissions

## 🔧 Development Features

### Current Implementation
- ✅ **Edit Mode**: Toggle between view and edit modes
- ✅ **Save Functionality**: Manual save and auto-save (30 seconds)
- ✅ **Supabase Storage**: Files saved directly to storage bucket
- ✅ **Markdown Support**: Full markdown editing with preview
- ✅ **Enhanced Toolbar**: Rich text editing shortcuts
- ✅ **Error Handling**: User-friendly error messages

### Debug Tools
- **Debug Button**: Shows current user role and permissions
- **Console Logging**: Detailed logs for troubleshooting
- **Toast Notifications**: Success/error feedback

## 🐛 Troubleshooting

### "Failed to create test page" Error
1. **Check RLS Migration**: Ensure the migration was run successfully
2. **Verify Authentication**: Make sure you're logged in
3. **Check Console**: Look for detailed error messages
4. **Storage Bucket**: Verify the `wiki` bucket exists in Supabase

### "Edit button not showing" Issue
1. **Check Authentication**: Ensure you're logged in
2. **User Role**: Check your user role in the debug info
3. **Permissions**: Verify `permissions.canEdit` is true
4. **Page Selection**: Make sure a page is selected

### "Save failed" Error
1. **Network Connection**: Check your internet connection
2. **Storage Permissions**: Verify RLS policies are correct
3. **File Path**: Check if the file path is valid
4. **Content Size**: Ensure content isn't too large

## 📋 Migration Status

### Required Migration
- [ ] Run `20250116000000_fix_wiki_storage_rls.sql`

### Optional Migrations
- [ ] Run any other wiki-related migrations if needed

## 🎯 Next Steps

1. **Run the RLS migration** to fix storage permissions
2. **Test the test page creation** functionality
3. **Test the editing and saving** functionality
4. **Verify auto-save** is working correctly
5. **Test with different user roles** if needed

## 🔒 Security Notes

- **Development Mode**: Currently allows all authenticated users to edit
- **Production**: Should implement proper role-based permissions
- **Storage**: Files are stored in Supabase storage with RLS policies
- **Validation**: Content validation should be added for production

---

*This guide covers the setup and testing of the wiki editing functionality. Once the RLS migration is run, the editing system should work properly.* 