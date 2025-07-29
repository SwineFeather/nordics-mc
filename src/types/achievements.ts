
import type { LucideIcon } from 'lucide-react';
import type { PlayerProfile } from './player';

// A subset of player stats used for achievements
export type PlayerStatsForAchievements = Pick<PlayerProfile['stats'], 'blocksPlaced' | 'blocksBroken' | 'mobKills' | 'balance' | 'monument_builds'> & {
  // Additional stats from the detailed player data
  use_dirt?: number;
  mine_ground?: number;
  kill_any?: number;
  sprint?: number;
  mine_diamond_ore?: number;
  use_hoe?: number;
  ride_boat?: number;
  mine_wood?: number;
  death?: number;
  // Fixed and updated stats for achievements
  custom_minecraft_play_time?: number; // Fixed: was custom_minecraft_playtime
  custom_minecraft_boat_one_cm?: number;
  mined_minecraft_diamond_ore?: number;
  mined_minecraft_wheat?: number;
  mined_minecraft_oak_log?: number; // Added: for wood cutting achievement
};

export interface AchievementTier {
  tier: number;
  name: string;
  description: string;
  threshold: number;
  icon: LucideIcon;
  points: number;
}

export interface AchievementDefinition {
  id: string;
  name: string; // Overall achievement name e.g. "Time Lord"
  description: string; // Overall description
  stat: string; // Allow any string, including dot notation for nested stats
  color: string; // Gradient color classes for the achievement
  tiers: AchievementTier[];
}

export interface UnlockedAchievement extends AchievementTier {
  achievementId: string;
  achievementName: string;
  stat: string;
  currentValue: number;
  color: string; // Include the color in unlocked achievements
}
