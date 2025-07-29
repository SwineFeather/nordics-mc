# Wiki Page Settings Feature

## Overview

The Wiki Page Settings feature provides comprehensive page management capabilities through an intuitive dropdown menu interface. This feature allows users to perform various actions on wiki pages based on their role permissions.

## Features

### 🔧 Page Actions
- **Rename Page**: Change the title of a wiki page
- **Move to Category**: Move a page to a different category
- **Duplicate Page**: Create a copy of the current page
- **Delete Page**: Permanently remove a page (with confirmation)

### 📁 Import/Export
- **Export Page**: Download the page content as a Markdown file
- **Import Page**: Upload and import page content from external files

### ⚙️ Advanced Settings
- **Page Settings Dialog**: Comprehensive settings management including:
  - Basic Information (description, tags)
  - Status & Publishing (draft, review, published)
  - Permissions (comments, editing, approval requirements)
  - Appearance (icon, color customization)

## User Interface

### Settings Button
The settings button appears in the page header next to other action buttons. It's only visible to authenticated users.

### Dropdown Menu
The settings dropdown provides organized access to all page management functions:

```
Page Actions
├── Rename Page
├── Move to Category
├── Duplicate Page
├── ──────────────────
├── Export Page
├── Import Page
├── ──────────────────
├── Page Settings
├── ──────────────────
└── Delete Page
```

### Dialog Modals
Each action opens appropriate confirmation or configuration dialogs:

1. **Delete Confirmation**: Requires explicit confirmation before deletion
2. **Rename Dialog**: Simple form to enter new page title
3. **Move Dialog**: Category selection dropdown
4. **Settings Dialog**: Comprehensive form with multiple sections

## Role-Based Permissions

The feature respects user role permissions:

| Role | Can Edit | Can Delete | Can Publish | Can Manage Settings |
|------|----------|------------|-------------|-------------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Moderator | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ❌ | ❌ | ❌ |
| Member | ❌ | ❌ | ❌ | ❌ |

## Implementation Details

### Components
- `PageSettings.tsx`: Main component with dropdown menu and dialogs
- Integrated into both `Wiki.tsx` and `OptimizedWiki.tsx`

### Handler Functions
Each action has a corresponding handler function:
- `handleDeletePage()`: Removes page and navigates away
- `handleRenamePage()`: Updates page title
- `handleMovePage()`: Changes page category
- `handleDuplicatePage()`: Creates page copy
- `handleExportPage()`: Downloads markdown file
- `handleImportPage()`: Processes uploaded files
- `handleUpdatePageSettings()`: Updates page metadata

### File Structure
```
src/
├── components/
│   └── wiki/
│       └── PageSettings.tsx
└── pages/
    ├── Wiki.tsx
    └── OptimizedWiki.tsx
```

## Usage Examples

### Renaming a Page
1. Click the "Settings" button in the page header
2. Select "Rename Page" from the dropdown
3. Enter the new title in the dialog
4. Click "Rename Page" to confirm

### Moving a Page to Another Category
1. Click "Settings" → "Move to Category"
2. Select the target category from the dropdown
3. Click "Move Page" to confirm

### Updating Page Settings
1. Click "Settings" → "Page Settings"
2. Configure various options in the dialog:
   - Add description and tags
   - Change page status
   - Modify permissions
   - Customize appearance
3. Click "Save Settings" to apply changes

### Exporting a Page
1. Click "Settings" → "Export Page"
2. The page content will be downloaded as a `.md` file

## Future Enhancements

- **Bulk Operations**: Select multiple pages for batch operations
- **Version History**: Track changes and allow rollbacks
- **Template System**: Save page configurations as templates
- **Advanced Permissions**: Granular permission controls
- **API Integration**: Connect to external systems for import/export
- **Audit Logging**: Track all page management actions

## Technical Notes

- All actions include proper error handling and user feedback
- Confirmation dialogs prevent accidental data loss
- Role-based access control ensures security
- Responsive design works on mobile and desktop
- Toast notifications provide user feedback
- Loading states prevent multiple simultaneous operations 