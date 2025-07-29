
import type { UnlockedAchievement } from './achievements';

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  title?: string;
  description?: string;
  color?: string;
}

export interface PlayerBadge {
  id: string;
  player_uuid: string;
  badge_type: string;
  badge_color: string;
  is_verified: boolean;
  assigned_at: string;
  assigned_by?: string;
  icon: string;
  icon_only: boolean;
}

export interface PlayerProfile {
  id: string; // In-game username, e.g., "SwineFeather"
  username: string;
  displayName?: string;
  avatar?: string;
  joinDate: string;
  lastSeen: string;
  nation?: string;
  town?: string;
  townName?: string;
  role?: string;
  serverRole?: string;
  isWebsiteUser: boolean;
  websiteUserId?: string; // This should be the auth.users.id if they are a website user
  minecraft_username?: string; // Added missing property
  stats: {
    blocksPlaced: number;
    blocksBroken: number;
    mobKills: number;
    balance?: number;
    medalPoints?: number;
    goldMedals?: number;
    silverMedals?: number;
    bronzeMedals?: number;
    ranks?: { [key: string]: number | undefined };
    monument_builds?: number;
    survivalStreak?: number; // Added survival streak in days
    itemsCrafted?: number;
    itemsDropped?: number;
    itemsPickedUp?: number;
    timesKilledBy?: number;
    [key: string]: number | { [key: string]: number | undefined } | undefined;
  };
  achievements: UnlockedAchievement[];
  levelInfo?: LevelInfo;
  bio?: string;
  discord?: string;
  isOnline: boolean;
  rank?: number;
  badges?: PlayerBadge[]; // Add badges to the profile
}
