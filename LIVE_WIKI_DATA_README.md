# Live Wiki Data System

## Overview

The Live Wiki Data System automatically fetches fresh data from the database every time a town or nation wiki page is viewed. This ensures that wiki pages always display the most up-to-date information without requiring manual updates.

## Features

### 🔄 **Automatic Live Data Fetching**
- **Town pages**: Automatically fetch current mayor, population, balance, level, XP, nation, and other stats
- **Nation pages**: Automatically fetch current leader, capital, balance, towns count, residents count, and other stats
- **Real-time updates**: Data is fetched fresh from the database on every page view
- **Fallback system**: If live data fails, falls back to static content

### 📊 **Visual Indicators**
- **Live Data Badge**: Green badge showing "Live Data" when content is live
- **Timestamp**: Shows when the data was last updated (e.g., "Updated 2 minutes ago")
- **Refresh Button**: Manual refresh button to get the latest data
- **Loading States**: Visual feedback during data fetching

### 🛠 **Technical Implementation**

#### Backend (Supabase Edge Functions)
- **`get-live-wiki-data`**: Fetches live data from `towns` and `nations` tables
- **Database queries**: Uses Supabase client to get current entity data
- **Content generation**: Generates fresh markdown content with live data
- **Error handling**: Graceful fallback to static content if live data fails

#### Frontend (React Components)
- **`LiveDataIndicator`**: Visual component showing live data status
- **`LiveWikiDataService`**: Service for fetching live data from edge functions
- **`useSupabaseWikiData`**: Hook with enhanced `getFileContentWithMetadata` function
- **Automatic detection**: Automatically detects town/nation pages and fetches live data

## How It Works

### 1. **Page Detection**
When a wiki page is opened, the system checks if it's a town or nation page by looking at the URL path:
- `/Nordics/towns/Garvia.md` → Town page
- `/Nordics/nations/Constellation.md` → Nation page

### 2. **Live Data Fetching**
If it's a town/nation page, the system:
1. Calls the `get-live-wiki-data` edge function
2. Passes the entity type (`town` or `nation`) and name
3. Fetches current data from the database
4. Generates fresh markdown content with live data

### 3. **Content Display**
The system:
1. Displays the live content instead of static content
2. Shows the Live Data indicator with timestamp
3. Provides a refresh button for manual updates

### 4. **Fallback System**
If live data fails:
1. Falls back to static content from storage
2. Hides the Live Data indicator
3. Logs the error for debugging

## File Structure

```
src/
├── services/
│   ├── liveWikiDataService.ts          # Frontend service for live data
│   └── supabaseWikiService.ts          # Enhanced with live data support
├── components/
│   └── wiki/
│       └── LiveDataIndicator.tsx       # Visual indicator component
├── hooks/
│   └── useSupabaseWikiData.tsx         # Enhanced with metadata support
└── pages/
    └── Wiki.tsx                        # Updated to use live data

supabase/
└── functions/
    └── get-live-wiki-data/
        └── index.ts                    # Edge function for live data
```

## API Endpoints

### `POST /functions/v1/get-live-wiki-data`

**Request Body:**
```json
{
  "entity_type": "town" | "nation",
  "entity_name": "Garvia"
}
```

**Response:**
```json
{
  "success": true,
  "content": "# Garvia\n\n## Quick Stats\n- **Mayor**: _Bamson\n- **Population**: 5\n...",
  "lastUpdated": "2025-07-26T18:04:24.013Z",
  "entityData": { /* Full entity data from database */ }
}
```

## Database Fields Used

### Towns
- `name`, `mayor_name`, `residents_count`, `balance`
- `level`, `total_xp`, `nation_name`, `is_capital`
- `world_name`, `location_x`, `location_z`, `spawn_x`, `spawn_y`, `spawn_z`
- `tag`, `board`, `max_residents`, `max_plots`, `taxes`, `plot_tax`
- `created_at`

### Nations
- `name`, `leader_name`, `capital_town_name`, `balance`
- `towns_count`, `residents_count`, `tag`, `created_at`
- `board`, `taxes`, `town_tax`, `max_towns`
- `ally_count`, `enemy_count`, `activity_score`

## Benefits

### ✅ **Always Up-to-Date**
- No more stale data in wiki pages
- Automatic synchronization with database changes
- Real-time population, balance, and stats updates

### ✅ **User Experience**
- Clear visual indication of live data
- Manual refresh option for immediate updates
- Graceful fallback if live data is unavailable

### ✅ **Performance**
- Only fetches live data for town/nation pages
- Static content for other pages remains fast
- Efficient database queries with proper indexing

### ✅ **Maintainability**
- Clean separation of concerns
- Modular architecture
- Easy to extend for other entity types

## Future Enhancements

### 🔮 **Planned Features**
- **Auto-refresh**: Periodic automatic updates (every 5 minutes)
- **Caching**: Smart caching to reduce database load
- **Notifications**: Alert when data changes significantly
- **History**: Track data changes over time
- **Charts**: Visual graphs showing trends

### 🔮 **Additional Entity Types**
- **Player profiles**: Live player stats and achievements
- **Companies**: Live company data and rankings
- **Events**: Live event information and schedules

## Troubleshooting

### Common Issues

**Live data not showing:**
1. Check if the page is in `/Nordics/towns/` or `/Nordics/nations/`
2. Verify the edge function is deployed
3. Check browser console for errors
4. Ensure the entity name matches exactly

**Data showing as "(unknown)":**
1. Check if the database field names are correct
2. Verify the entity exists in the database
3. Check edge function logs for errors

**Refresh button not working:**
1. Check network connectivity
2. Verify edge function is accessible
3. Check browser console for errors

### Debug Mode
Enable debug logging by checking the browser console for:
- `📄 Loading file content with metadata:`
- `✅ Live content loaded:`
- `⚠️ Live data failed, falling back to static:`

## Deployment

### Edge Function Deployment
```bash
supabase functions deploy get-live-wiki-data --project-ref YOUR_PROJECT_REF
```

### Environment Variables
Ensure these are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing

### Manual Testing
1. Open a town page (e.g., `/wiki/Nordics/towns/Garvia`)
2. Verify the Live Data indicator appears
3. Check that data is current
4. Click the refresh button
5. Verify data updates

### Automated Testing
```bash
# Test town data
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/get-live-wiki-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"entity_type": "town", "entity_name": "Garvia"}'

# Test nation data
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/get-live-wiki-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"entity_type": "nation", "entity_name": "Constellation"}'
```

---

*This system ensures that your wiki pages always display the most current and accurate information from your database, providing users with reliable, up-to-date data about towns and nations.* 