# Player Achievement and Leveling System

This document describes the comprehensive achievement and leveling system implemented for the Nordics Nexus Forge community.

## Overview

The achievement system provides players with a way to track their progress across various activities and earn experience points (XP) that contribute to their overall level. Players can manually claim achievements when they meet the requirements, creating an engaging and interactive experience.

## Features

### 🏆 Achievement Categories
- **Time Lord**: Playtime milestones
- **Master Builder**: Block placement achievements
- **Mining Master**: Block breaking achievements
- **Combat Expert**: Mob killing achievements
- **Diamond Hunter**: Diamond mining achievements
- **Master Angler**: Fishing achievements
- **Lumberjack**: Woodcutting achievements
- **Explorer**: Travel distance achievements
- **Weapon Master**: Combat weapon usage
- **Archer**: Ranged combat achievements

### 📊 Leveling System
- 15 levels with increasing XP requirements
- Unique titles and colors for each level
- Progress tracking with visual indicators
- Automatic level calculation based on total XP

### 🎮 Interactive Features
- Manual achievement claiming with hold-to-claim interaction
- Real-time progress tracking
- Visual feedback and animations
- Admin override capabilities

## Database Schema

### Core Tables

#### `achievement_definitions`
Stores the base achievement categories.
```sql
CREATE TABLE achievement_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  stat text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

#### `achievement_tiers`
Stores individual achievement tiers with thresholds and rewards.
```sql
CREATE TABLE achievement_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id text REFERENCES achievement_definitions(id),
  tier integer NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  threshold numeric NOT NULL,
  icon text NOT NULL,
  points integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(achievement_id, tier)
);
```

#### `unlocked_achievements`
Tracks which achievements each player has unlocked and claimed.
```sql
CREATE TABLE unlocked_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_uuid text REFERENCES players(uuid),
  tier_id uuid REFERENCES achievement_tiers(id),
  unlocked_at timestamp with time zone DEFAULT now(),
  claimed_at timestamp with time zone,
  is_claimed boolean DEFAULT false,
  UNIQUE(player_uuid, tier_id)
);
```

#### `level_definitions`
Defines the level progression system.
```sql
CREATE TABLE level_definitions (
  level integer PRIMARY KEY,
  xp_required bigint NOT NULL,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Key Functions

#### `calculate_level_from_xp(player_xp bigint)`
Calculates a player's current level, XP progress, and level information based on total XP.

#### `claim_achievement(p_player_uuid text, p_tier_id uuid)`
Claims an achievement for a player, awards XP, and updates their level.

#### `get_claimable_achievements(p_player_uuid text)`
Returns all achievements a player can claim based on their current stats.

#### `sync_all_achievements()`
Synchronizes achievements for all players based on their current stats.

## Stat Mapping

The system maps Minecraft statistics to achievement categories:

| Achievement | Stat Name | Conversion |
|-------------|-----------|------------|
| Time Lord | `custom_minecraft_play_time` | Ticks → Hours (÷72000) |
| Master Builder | `blocksPlaced` | Direct value |
| Mining Master | `blocksBroken` | Direct value |
| Combat Expert | `mobKills` | Direct value |
| Diamond Hunter | `mined_minecraft_diamond_ore` | Direct value |
| Master Angler | `fishing_rod` | Direct value |
| Lumberjack | `mined_minecraft_oak_log` | Direct value |
| Explorer | `walk` | Centimeters → Blocks (÷100) |
| Weapon Master | `netherite_sword` | Direct value |
| Archer | `bow` | Direct value |

## Level Progression

| Level | XP Required | Title | Description | Color |
|-------|-------------|-------|-------------|-------|
| 1 | 0 | Newcomer | Welcome to the server! | #6b7280 |
| 2 | 100 | Novice | Getting started | #10b981 |
| 3 | 250 | Apprentice | Learning the ropes | #3b82f6 |
| 4 | 500 | Journeyman | Making progress | #8b5cf6 |
| 5 | 1,000 | Adventurer | Exploring the world | #f59e0b |
| 6 | 1,750 | Explorer | Discovering new places | #06b6d4 |
| 7 | 2,750 | Veteran | Experienced player | #84cc16 |
| 8 | 4,000 | Expert | Skilled and knowledgeable | #f97316 |
| 9 | 6,000 | Master | Mastered the game | #ef4444 |
| 10 | 8,500 | Champion | Elite player | #a855f7 |
| 11 | 12,000 | Legend | Legendary status | #dc2626 |
| 12 | 16,500 | Mythic | Mythical prowess | #9333ea |
| 13 | 22,500 | Ascended | Beyond mortal limits | #1d4ed8 |
| 14 | 30,000 | Divine | Divine power | #059669 |
| 15 | 40,000 | Transcendent | Transcended reality | #be123c |

## Achievement Tiers

Each achievement category has 5 tiers with increasing requirements and rewards:

### Example: Time Lord Achievement
- **Tier 1**: Newcomer - Play for 1 hour (50 XP)
- **Tier 2**: Regular - Play for 10 hours (100 XP)
- **Tier 3**: Dedicated - Play for 50 hours (150 XP)
- **Tier 4**: Veteran - Play for 100 hours (200 XP)
- **Tier 5**: Time Lord - Play for 500 hours (250 XP)

## Usage

### For Players

1. **View Achievements**: Navigate to `/community` and click the "Achievements" tab
2. **Check Progress**: See your current progress for each achievement category
3. **Claim Achievements**: Hold the claim button when achievements are ready
4. **Track Level**: Monitor your level progression and XP requirements

### For Admins

1. **Initialize System**: Use the admin panel to initialize the achievement system
2. **Sync Achievements**: Run the sync function to process all players
3. **Monitor Progress**: View system statistics and player achievements
4. **Override Claims**: Use admin claim functionality when needed

## Components

### Frontend Components

- `CommunityAchievements.tsx`: Main achievement display component
- `ClaimButton.tsx`: Interactive claim button with hold-to-claim
- `AchievementSyncButton.tsx`: Admin management component
- `PlayerAchievements.tsx`: Player profile achievement display

### Services

- `achievementSyncService.ts`: Database operations and system management
- `useAchievementClaiming.tsx`: Hook for achievement claiming logic
- `leveling.ts`: Level calculation utilities

## Setup Instructions

### 1. Database Migration
Run the migration file to create all necessary tables and functions:
```sql
-- Run the migration file: supabase/migrations/20250104000000_setup_player_achievement_system.sql
```

### 2. Initialize System
Use the admin panel to initialize the achievement system:
1. Navigate to `/admin`
2. Click "Initialize System" in the Achievement System Management section
3. Wait for the initialization to complete

### 3. Sync Player Achievements
After initialization, sync achievements for all players:
1. Click "Sync All Players" in the admin panel
2. Monitor the sync progress
3. Verify that achievements are being awarded correctly

### 4. Test the System
1. Visit `/community` and check the Achievements tab
2. Verify that claimable achievements appear for players
3. Test the claim functionality
4. Check that XP and levels update correctly

## Troubleshooting

### Common Issues

1. **Achievements not appearing**: Ensure the system has been initialized and synced
2. **Stats not updating**: Check that player stats are being imported correctly
3. **Claim button not working**: Verify RLS policies and user permissions
4. **Level not calculating**: Check that the `calculate_level_from_xp` function exists

### Debug Steps

1. Check the browser console for error messages
2. Verify database tables exist and have data
3. Test database functions directly
4. Check RLS policies and permissions
5. Verify player UUID mapping

## Future Enhancements

- Additional achievement categories
- Seasonal/event achievements
- Achievement leaderboards
- Social features (achievement sharing)
- Advanced leveling mechanics
- Achievement rewards beyond XP

## Support

For issues or questions about the achievement system:
1. Check the admin panel for system status
2. Review database logs for errors
3. Test with a known player account
4. Contact the development team

---

**Last Updated**: January 2025
**Version**: 1.0.0 