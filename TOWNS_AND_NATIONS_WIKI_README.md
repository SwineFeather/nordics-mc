# Towns and Nations Wiki Pages

This feature automatically generates wiki pages for all towns and nations from the database, creating organized folders with placeholder content that editors can customize.

## Features

### Automatic Page Generation
- **Towns Folder**: Contains individual pages for each town in the database
- **Nations Folder**: Contains individual pages for each nation in the database
- **Index Pages**: README files that list all towns/nations with links and statistics

### Placeholder Content
Each generated page includes:

#### Town Pages
- **Quick Stats**: Mayor, population, balance, nation, status, type, founded date, level, XP
- **Location**: World, coordinates, spawn point
- **Structured Sections**: Description, history, notable locations, economy, government, culture
- **Town Board**: Current board message from database
- **Additional Info**: Tag, max residents, plot prices, taxes, etc.

#### Nation Pages
- **Quick Stats**: Leader, capital, population, balance, towns count, allies, enemies
- **Structured Sections**: Description, history, government, capital, economy, military, diplomacy, culture
- **Nation Board**: Current board message from database
- **Additional Info**: Motto, tag, color, daily upkeep, taxes, activity score, etc.
- **Specialties**: List of nation specialties

### Editor-Friendly
- All placeholder content is clearly marked with `[Add description here]` style placeholders
- Editors can easily identify and replace placeholder text
- Automatic data is clearly separated from editable content
- Pages include a note that they were auto-generated and can be modified

## Usage

### Creating Pages
1. Navigate to the Wiki page
2. Click "Create Towns Pages" button to generate all town wiki pages
3. Click "Create Nations Pages" button to generate all nation wiki pages
4. The pages will appear in the sidebar under "Towns" and "Nations" folders

### Folder Structure
```
Nordics/
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

### Data Sources
The pages are generated from the following database tables:
- **towns**: Contains all town information including mayor, population, balance, location, etc.
- **nations**: Contains all nation information including leader, capital, population, balance, etc.

### Customization
Editors can:
- Modify any placeholder text
- Add new sections
- Remove auto-generated content
- Add images and formatting
- Update information as needed

The automatic data (like balance, population, etc.) will remain accurate as long as the database is updated, but editors can override any information if needed.

## Technical Implementation

### Service Methods
- `SupabaseWikiService.createTownsWikiPages()`: Creates all town pages
- `SupabaseWikiService.createNationsWikiPages()`: Creates all nation pages
- `generateTownPlaceholderContent()`: Generates content for individual town pages
- `generateNationPlaceholderContent()`: Generates content for individual nation pages
- `generateTownsIndexContent()`: Generates the towns index page
- `generateNationsIndexContent()`: Generates the nations index page

### File Naming
- Town/Nation names are sanitized for file names (special characters replaced with underscores)
- Each page includes proper frontmatter with title and updated_at timestamp
- Files are saved in the appropriate subfolder structure

### Error Handling
- Graceful handling of missing data
- Fallback values for null/undefined fields
- Error logging for debugging
- User feedback via toast notifications

## Future Enhancements
- Automatic updates when database changes
- Scheduled regeneration of pages
- More detailed statistics and analytics
- Integration with town/nation management tools
- Custom templates for different town/nation types 