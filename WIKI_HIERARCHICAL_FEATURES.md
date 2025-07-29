# Advanced Hierarchical Wiki System

## Overview

The Nordics Nexus Forge wiki has been upgraded with a comprehensive hierarchical drag-and-drop system that supports up to 6 levels of nested pages and categories. This system provides extensive customization options, intuitive navigation, and powerful organization capabilities.

## 🚀 Key Features

### 1. Hierarchical Structure
- **6-Level Deep Nesting**: Categories and pages can be nested up to 6 levels deep
- **Parent-Child Relationships**: Both categories and pages support parent-child relationships
- **Automatic Depth Calculation**: The system automatically calculates and maintains depth levels
- **Circular Reference Prevention**: Built-in protection against circular references

### 2. Drag-and-Drop Interface
- **Visual Drag Handles**: Clear grip handles for easy dragging
- **Drop Zone Indicators**: Visual feedback during drag operations
- **Cross-Category Movement**: Move pages between categories seamlessly
- **Hierarchical Reordering**: Reorder items within their current level
- **Depth Validation**: Automatic validation to prevent invalid moves

### 3. Icon and Color Customization
- **Extensive Icon Library**: 100+ icons organized by categories
  - General: book-open, file-text, folder-open, home, settings, users
  - Navigation: map-pin, globe, compass, navigation, route, map
  - Content: file-text, book-open, edit, copy, link, external-link
  - Media: camera, video, music, headphones, gamepad, dice
  - Communication: message, mail, phone, calendar, clock, timer
  - Analytics: chart, bar-chart, pie-chart, trending-up, trending-down
  - Ideas: lightbulb, brain, help, star, heart, zap, flame
  - Status: check, x, alert, warning, info, success, error, bug
  - Technology: code, database, server, network, robot, ai, binary
  - Creative: palette, brush, star, heart, zap, flame
  - Commerce: shopping, store, wallet, money, coin
  - Food: food, coffee, cake, candy, wine, beer
  - Transportation: car, bike, plane, train, ship, rocket, satellite
  - Education: school, university, library, book, pen, pencil, ruler
  - Health: hospital, doctor, nurse, medicine, syringe
  - Buildings: house, building, office, factory, warehouse, shop
  - Nature: leaf, trees, mountain, sun, moon, cloud, garden, farm
  - Tools: tool, hammer, drill, wrench
  - Time: light, dark, sunrise, sunset

- **Color System**: 30+ colors organized by categories
  - Primary: blue, indigo, purple, pink, red, orange, yellow, lime, green, emerald, teal, cyan
  - Secondary: slate, gray, zinc, neutral, stone
  - Accent: rose, amber, violet, fuchsia, sky
  - Neutral: white, black, transparent
  - Semantic: success, warning, error, info

### 4. Individual Item Settings
Each category and page has comprehensive settings accessible via the settings button:

#### General Settings
- **Title**: Display name of the item
- **Slug**: URL-friendly identifier
- **Description**: Detailed description for SEO and context
- **Tags**: Custom tags for organization and search
- **Status**: For pages only (published, draft, review)

#### Appearance Settings
- **Icon Selection**: Choose from categorized icon library
- **Color Customization**: Select from categorized color palette
- **Expanded by Default**: Control initial expansion state

#### Organization Settings
- **Parent Selection**: Choose parent category or page
- **Order**: Manual ordering within the same level
- **Depth Validation**: Automatic validation of hierarchy depth

#### Permissions Settings
- **Public Visibility**: Control whether item is visible to all users
- **Comments**: Enable/disable comments
- **Editing**: Allow/disallow user editing
- **Approval Required**: Require approval for changes

#### SEO Settings
- **Meta Description**: Custom meta description for search engines
- **Keywords**: SEO keywords for better discoverability

#### Advanced Settings
- **Custom CSS**: Custom styling for the item
- **Creation Info**: View creation date and author
- **Last Modified**: Track modification history

### 5. Search and Navigation
- **Real-time Search**: Search across titles, content, and descriptions
- **Hierarchical Display**: Visual hierarchy with proper indentation
- **Expand/Collapse**: Individual control over expanded state
- **Breadcrumb Navigation**: Clear path indication
- **Quick Actions**: Context-sensitive action buttons

### 6. Role-Based Permissions
- **Admin**: Full access to all features
- **Moderator**: Can manage structure and content
- **Editor**: Can create and edit content
- **Member**: Read-only access with optional commenting

## 🎯 Usage Guide

### Creating Hierarchical Structure

1. **Create Root Categories**
   - Click "Add Category" button
   - Set title, slug, and description
   - Choose icon and color
   - Leave parent empty for root level

2. **Create Subcategories**
   - Click the "+" button next to a category
   - Or use "Add Category" and select a parent
   - The system will automatically calculate depth

3. **Create Pages**
   - Click the document icon next to a category
   - Or use "Add Page" and select a category
   - Pages can also have sub-pages

4. **Create Sub-pages**
   - Click the "+" button next to a page
   - Or use "Add Page" and select a parent page
   - Supports up to 6 levels deep

### Drag-and-Drop Operations

1. **Moving Items**
   - Drag the grip handle (⋮⋮) to move items
   - Drop on valid targets (categories or pages)
   - Visual feedback shows valid drop zones

2. **Reordering**
   - Drag items within the same level to reorder
   - Automatic order updates in the database

3. **Cross-Category Movement**
   - Drag pages between different categories
   - Automatic category association updates

### Customization

1. **Changing Icons**
   - Click settings button (⚙️) on any item
   - Go to "Appearance" tab
   - Browse icons by category
   - Click to select

2. **Changing Colors**
   - In settings, go to "Appearance" tab
   - Browse colors by category
   - Click to select
   - Colors appear as left border on items

3. **Advanced Settings**
   - Use the settings modal for comprehensive options
   - Configure permissions, SEO, and custom styling
   - Set parent relationships and ordering

### Recommended Structure

For the Nordics Nexus Forge wiki, we recommend this structure:

```
📚 The World (Root Category)
├── 🏛️ Nations
│   ├── Nation 1
│   ├── Nation 2
│   └── Nation 3
├── 🏘️ Towns
│   ├── Town 1
│   ├── Town 2
│   └── Town 3
├── 🏢 Companies
│   ├── Company 1
│   └── Company 2
└── 🗺️ Geography
    ├── Regions
    └── Landmarks

📖 Getting Started
├── 🎮 Welcome
├── 📋 Rules
└── 🚀 Quick Start Guide

🛠️ Game Mechanics
├── ⚔️ Combat
├── 🏗️ Building
└── 💰 Economy

📚 Documentation
├── 📖 API Reference
├── 🔧 Developer Guide
└── 🐛 Troubleshooting
```

## 🔧 Technical Implementation

### Database Schema

The system uses enhanced database tables with:

- **Hierarchical Fields**: `parent_id`, `parent_page_id`, `depth`
- **Customization Fields**: `icon`, `color`, `is_expanded`
- **Metadata Fields**: `description`, `tags`, `keywords`
- **Permission Fields**: `is_public`, `allow_comments`, `allow_editing`
- **SEO Fields**: `meta_description`, `custom_css`

### Performance Optimizations

- **Indexed Fields**: Database indexes on parent relationships and depth
- **Caching**: Intelligent caching of hierarchical data
- **Lazy Loading**: Load child items only when expanded
- **Batch Operations**: Efficient bulk updates for drag-and-drop

### Real-time Updates

- **WebSocket Integration**: Real-time updates across all connected clients
- **Optimistic Updates**: Immediate UI feedback during operations
- **Conflict Resolution**: Handle concurrent edits gracefully

## 🎨 Customization Examples

### Icon and Color Combinations

**Nations Category**: 🌍 Globe icon with blue color
**Towns Category**: 🏘️ Building icon with green color  
**Companies Category**: 🏢 Office icon with purple color
**Rules Category**: 📋 Clipboard icon with red color
**API Documentation**: 🔧 Wrench icon with orange color

### Permission Examples

**Public Pages**: Visible to all users, allow comments
**Staff Only**: Restricted visibility, no comments
**Editable Pages**: Allow user contributions with approval
**Locked Pages**: Read-only for all users

## 🚀 Future Enhancements

### Planned Features

1. **Bulk Operations**: Select multiple items for batch operations
2. **Advanced Search**: Filter by tags, authors, dates
3. **Version History**: Track changes to structure and content
4. **Export/Import**: Backup and restore wiki structure
5. **Templates**: Pre-defined structures for common use cases
6. **Analytics**: Track page views and user engagement
7. **Advanced Permissions**: Granular permission system
8. **Mobile Optimization**: Touch-friendly drag-and-drop

### Integration Possibilities

- **Discord Bot**: Sync wiki structure with Discord channels
- **GitHub Integration**: Sync with GitHub wiki repositories
- **API Access**: RESTful API for external integrations
- **Webhook Support**: Notify external systems of changes

## 🐛 Troubleshooting

### Common Issues

1. **Drag-and-Drop Not Working**
   - Check browser compatibility
   - Ensure JavaScript is enabled
   - Verify user permissions

2. **Depth Limit Reached**
   - Maximum depth is 6 levels
   - Move items to a higher level first
   - Consider restructuring the hierarchy

3. **Settings Not Saving**
   - Check network connection
   - Verify user permissions
   - Try refreshing the page

4. **Search Not Finding Items**
   - Check spelling and case sensitivity
   - Verify item visibility settings
   - Ensure content is properly indexed

### Performance Tips

1. **Limit Expansion**: Don't expand all categories at once
2. **Use Search**: Use search instead of browsing large hierarchies
3. **Regular Cleanup**: Archive or delete unused content
4. **Optimize Images**: Use appropriate image sizes for icons

## 📞 Support

For technical support or feature requests:

1. **GitHub Issues**: Create an issue in the repository
2. **Discord**: Join the community Discord server
3. **Documentation**: Check the wiki documentation
4. **Email**: Contact the development team

---

*This hierarchical wiki system represents a significant upgrade to the Nordics Nexus Forge platform, providing users with powerful tools for organizing and presenting information in an intuitive and visually appealing way.* 