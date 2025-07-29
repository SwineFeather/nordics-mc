# Wiki Editing Features

## Overview

The Nordics Nexus Forge wiki now supports full editing functionality, allowing users to edit wiki pages directly in the browser and save changes to Supabase storage. This provides a GitBook-like editing experience with real-time preview and auto-save capabilities.

## 🚀 Key Features

### 1. Edit Mode
- **Toggle Edit Mode**: Click the "Edit" button to enter edit mode
- **Real-time Preview**: Switch between edit and preview tabs
- **Enhanced Toolbar**: Rich text editing toolbar with markdown shortcuts
- **Auto-save**: Automatic saving every 30 seconds (configurable)

### 2. Enhanced Editor
- **Markdown Support**: Full markdown syntax highlighting and support
- **Toolbar Actions**: Quick buttons for common formatting (bold, italic, headings, etc.)
- **Code Blocks**: Syntax highlighting for various programming languages
- **Tables**: Visual table editor for creating and editing tables
- **Media Upload**: Drag & drop image and file uploads

### 3. Save Functionality
- **Manual Save**: Click "Save" button to save changes immediately
- **Auto-save**: Automatic saving to prevent data loss
- **Save Status**: Visual indicators for save status and last saved time
- **Error Handling**: Proper error messages for failed saves

### 4. File Management
- **Supabase Storage**: All files are stored in Supabase storage bucket
- **File Path Resolution**: Automatic file path detection for saving
- **Content Updates**: Real-time content updates after saving
- **Version Control**: Basic version tracking with timestamps

## 🛠️ Technical Implementation

### Backend Services
- **SupabaseWikiService**: Core service for file operations
- **Storage Integration**: Direct integration with Supabase storage
- **File Structure**: Hierarchical file organization in storage bucket

### Frontend Components
- **EnhancedWikiEditor**: Main editing component with toolbar and preview
- **Wiki Page**: Main wiki page with edit mode integration
- **useSupabaseWikiData**: Hook for data management and save operations

### Key Methods
```typescript
// Save a page
savePage(path: string, content: string, title?: string): Promise<void>

// Create a new page
createPage(path: string, title: string, content: string, category?: string): Promise<void>

// Delete a page
deletePage(path: string): Promise<void>

// Check edit permissions
checkEditPermission(): Promise<boolean>
```

## 📝 Usage Guide

### Editing a Page
1. **Navigate** to any wiki page
2. **Click "Edit"** button in the page header
3. **Make changes** in the editor
4. **Preview** changes using the preview tab
5. **Save** changes using the save button or auto-save

### Creating a Test Page
1. **Click "🧪 Test Page"** button (development only)
2. **Refresh** the page to see the new test page
3. **Navigate** to the test page
4. **Test editing** functionality

### Auto-save Configuration
- **Enable/Disable**: Toggle auto-save in the editor
- **Interval**: Currently set to 30 seconds
- **Status**: Visual indicator shows last save time

## 🔧 Development Features

### Test Page Creation
- **Development Button**: "🧪 Test Page" button for testing
- **Sample Content**: Pre-filled with markdown examples
- **Quick Testing**: Easy way to test editing functionality

### Debug Information
- **Console Logs**: Detailed logging for debugging
- **Error Handling**: Comprehensive error messages
- **Status Updates**: Real-time status updates

## 🔒 Permissions

### Current Implementation
- **Authenticated Users**: Can edit if they have a user account
- **Role-based**: Future implementation will support role-based permissions
- **File-based**: Permissions are checked per file operation

### Future Enhancements
- **Role-based Access**: Admin, moderator, editor, member roles
- **Page-level Permissions**: Individual page editing permissions
- **Approval Workflow**: Suggested edits and approval system

## 🎨 UI/UX Features

### Editor Interface
- **Clean Design**: Modern, clean editing interface
- **Responsive**: Works on desktop and mobile devices
- **Accessibility**: WCAG compliant design
- **Dark Mode**: Supports both light and dark themes

### Visual Feedback
- **Save Status**: Clear indicators for save status
- **Loading States**: Loading spinners for async operations
- **Error Messages**: User-friendly error messages
- **Success Notifications**: Toast notifications for successful operations

## 🚀 Future Enhancements

### Planned Features
- **Collaborative Editing**: Real-time collaborative editing
- **Version History**: Full version history and rollback
- **Advanced Permissions**: Granular permission system
- **Template System**: Page templates for common content types
- **Media Library**: Centralized media management
- **Export Options**: Export pages to various formats

### Technical Improvements
- **Performance**: Optimize for large files and many pages
- **Caching**: Implement intelligent caching strategies
- **Offline Support**: Basic offline editing capabilities
- **Sync**: Better synchronization between multiple editors

## 🐛 Troubleshooting

### Common Issues
1. **Save Fails**: Check network connection and permissions
2. **Content Not Loading**: Refresh the page and try again
3. **Edit Button Missing**: Ensure you're logged in and have permissions
4. **Auto-save Not Working**: Check if auto-save is enabled

### Debug Steps
1. **Check Console**: Look for error messages in browser console
2. **Verify Permissions**: Ensure user has edit permissions
3. **Test Network**: Check if Supabase storage is accessible
4. **Clear Cache**: Clear browser cache and try again

---

*This documentation covers the wiki editing features implemented for Nordics Nexus Forge. The system provides a modern, user-friendly editing experience similar to popular wiki platforms like GitBook and Notion.* 