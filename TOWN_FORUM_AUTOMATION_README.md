# Town Forum Automation System

This system automatically creates, updates, and archives forum categories for towns based on the `towns` table in your database.

## Features

- **Automatic Forum Creation**: Creates forum categories for new towns
- **Automatic Archiving**: Archives forum categories for deleted towns
- **Nation Updates**: Updates forum colors and nation associations when towns change nations
- **Scheduled Sync**: Runs automatically every 24 hours
- **Manual Sync**: Can be triggered manually via SQL function or Edge Function

## Files Created

### 1. Database Migration
- `supabase/migrations/20250127000002_add_town_forum_automation.sql`
  - Adds `is_archived` and `updated_at` columns to `forum_categories`
  - Creates `sync_town_forums()` function
  - Sets up automatic triggers
  - Creates scheduled cron job

### 2. Edge Function
- `supabase/functions/sync-town-forums/index.ts`
  - HTTP endpoint for manual sync
  - Can be called via API or webhook
  - Returns detailed results

### 3. Manual Scripts
- `manual_sync_town_forums.sql` - Immediate sync script
- `cleanup_duplicate_forums.sql` - Removes duplicate forum categories
- `add_north_sea_league_town_forums.sql` - Creates forums for specific nation

## Setup Instructions

### Step 1: Run the Migration
```sql
-- Run this in your Supabase SQL editor
-- This will set up the automation system
```

### Step 2: Enable pg_cron Extension (Optional)
If you want the automatic 24-hour sync:
1. Go to your Supabase Dashboard
2. Navigate to Database → Extensions
3. Enable the `pg_cron` extension

### Step 3: Deploy the Edge Function
```bash
# Deploy the sync function
supabase functions deploy sync-town-forums
```

### Step 4: Run Initial Sync
```sql
-- Run this to create forums for existing towns
SELECT sync_town_forums();
```

## How It Works

### Automatic Process
1. **Every 24 hours** (if pg_cron is enabled), the system:
   - Scans the `towns` table for towns in nations
   - Creates forum categories for towns without forums
   - Archives forum categories for towns that no longer exist
   - Updates nation associations and colors for towns that changed nations

### Manual Process
You can trigger the sync manually in several ways:

#### Option 1: SQL Function
```sql
SELECT sync_town_forums();
```

#### Option 2: Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/sync-town-forums \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### Option 3: Manual Script
Run `manual_sync_town_forums.sql` in your SQL editor

## Forum Category Structure

Each town forum category includes:
- **Name**: "{Town Name} Forum"
- **Description**: "Private forum for {Town Name} residents"
- **Slug**: "town-{town-name-lowercase}"
- **Icon**: "building"
- **Color**: Based on nation (see color mapping below)
- **Nation**: Associated nation name
- **Town**: Associated town name
- **Archived**: Boolean flag for deleted towns

## Nation Color Mapping

| Nation | Color |
|--------|-------|
| Skyward Sanctum | #3b82f6 (Blue) |
| North_Sea_League | #059669 (Green) |
| Kesko Corporation | #f59e0b (Yellow) |
| Aqua Union | #0ea5e9 (Cyan) |
| Constellation | #8b5cf6 (Purple) |

## Monitoring and Maintenance

### Check Sync Status
```sql
-- View recent sync results
SELECT * FROM forum_categories 
WHERE town_name IS NOT NULL 
ORDER BY updated_at DESC;
```

### View Archived Forums
```sql
-- See archived forums (deleted towns)
SELECT * FROM forum_categories 
WHERE is_archived = true;
```

### Manual Cleanup
```sql
-- Permanently delete archived forums (optional)
DELETE FROM forum_categories 
WHERE is_archived = true;
```

## Troubleshooting

### Common Issues

1. **Duplicate Forums**: Run `cleanup_duplicate_forums.sql`
2. **Missing Forums**: Run `manual_sync_town_forums.sql`
3. **Wrong Colors**: The system will fix this automatically on next sync
4. **Cron Not Working**: Check if pg_cron extension is enabled

### Debug Information
```sql
-- Check what towns need forums
SELECT 
    t.name as town_name,
    t.nation_name,
    CASE WHEN fc.id IS NULL THEN 'NEEDS FORUM' ELSE 'FORUM EXISTS' END as status
FROM towns t
LEFT JOIN forum_categories fc ON t.name = fc.town_name AND fc.is_archived = false
WHERE t.is_independent = false 
AND t.nation_name IS NOT NULL
ORDER BY t.nation_name, t.name;
```

## Security

- The sync function uses the service role key for database access
- Forum categories are created with appropriate permissions
- Archived forums are hidden from the UI but not deleted
- All operations are logged and can be audited

## Performance

- Indexes are created for optimal query performance
- The sync process is designed to be efficient for large numbers of towns
- Only changed records are updated
- Batch operations minimize database load 