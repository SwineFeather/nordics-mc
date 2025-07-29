
import { supabase } from '@/integrations/supabase/client';
import type { PlayerStatsForAchievements, UnlockedAchievement } from '@/types/achievements';
import { achievements } from '@/config/achievements';

// Mapping from achievement stat names to actual database stat names
const STAT_MAPPING: Record<string, string> = {
  'custom_minecraft_play_time': 'custom_minecraft_play_time',
  'blocksPlaced': 'use_dirt', // Primary block placement stat
  'blocksBroken': 'mine_ground', // Primary block breaking stat
  'mobKills': 'kill_any', // Total mob kills
  'custom_minecraft_boat_one_cm': 'custom_minecraft_boat_one_cm', // Boat riding stat
  'mined_minecraft_oak_log': 'mined_minecraft_oak_log',
  'balance': 'balance', // Balance stat
  'mined_minecraft_diamond_ore': 'mined_minecraft_diamond_ore', // Diamond ore stat
  'mined_minecraft_wheat': 'mined_minecraft_wheat', // Wheat stat
};

// Convert raw stat value based on stat type
const convertStatValue = (statKey: string, rawValue: number): number => {
  switch (statKey) {
    case 'custom_minecraft_play_time':
      // Convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      return Math.floor(rawValue / 72000);
    case 'custom_minecraft_boat_one_cm':
      // Convert centimeters to blocks (100 cm = 1 block)
      return Math.floor(rawValue / 100);
    default:
      return rawValue;
  }
};

export const getUnlockedAchievements = async (
  playerStats: any,
  playerUuid: string
): Promise<UnlockedAchievement[]> => {
  console.log('Getting unlocked achievements for player:', playerUuid);
  console.log('Player stats received:', playerStats);

  const unlockedAchievements: UnlockedAchievement[] = [];

  for (const achievement of achievements) {
    console.log(`Processing achievement: ${achievement.id} (stat: ${achievement.stat})`);
    
    // Get the actual database stat name
    const dbStatName = STAT_MAPPING[achievement.stat] || achievement.stat;
    const rawStatValue = playerStats[dbStatName] || 0;
    const actualStatValue = convertStatValue(achievement.stat, rawStatValue);
    
    console.log(`  - DB stat name: ${dbStatName}`);
    console.log(`  - Raw value: ${rawStatValue}`);
    console.log(`  - Converted value: ${actualStatValue}`);

    if (actualStatValue <= 0) {
      console.log(`  - Skipping achievement ${achievement.id} - no progress`);
      continue;
    }

    // Find the highest tier this player qualifies for
    let highestUnlockedTier = null;
    for (const tier of achievement.tiers.sort((a, b) => a.tier - b.tier)) {
      if (actualStatValue >= tier.threshold) {
        highestUnlockedTier = tier;
        console.log(`  - Qualifies for tier ${tier.tier}: ${tier.name} (threshold: ${tier.threshold})`);
      } else {
        break; // Tiers are sorted, so we can stop here
      }
    }

    if (highestUnlockedTier) {
      const unlockedAchievement: UnlockedAchievement = {
        ...highestUnlockedTier,
        achievementId: achievement.id,
        achievementName: achievement.name,
        stat: achievement.stat,
        currentValue: actualStatValue,
        color: achievement.color,
        icon: highestUnlockedTier.icon,
      };
      
      unlockedAchievements.push(unlockedAchievement);
      console.log(`  - Added achievement: ${achievement.name} - ${unlockedAchievement.name}`);
    }
  }

  console.log(`Total unlocked achievements: ${unlockedAchievements.length}`);
  return unlockedAchievements;
};

// Sync achievements for all players (used by admin sync function)
export const syncPlayerAchievements = async (playerUuid: string, playerStats: any) => {
  console.log(`Syncing achievements for player: ${playerUuid}`);
  
  // Get what achievements this player should have
  const shouldHaveAchievements = await getUnlockedAchievements(playerStats, playerUuid);
  
  if (shouldHaveAchievements.length === 0) {
    console.log(`No achievements to sync for player ${playerUuid}`);
    return;
  }

  // Get achievement tiers from database that match what the player should have
  const { data: tierData } = await supabase
    .from('achievement_tiers')
    .select('*')
    .in('achievement_id', shouldHaveAchievements.map(a => a.achievementId));

  if (!tierData) {
    console.error('Failed to fetch achievement tiers from database');
    return;
  }

  console.log(`Found ${tierData.length} tiers in database`);

  // For each achievement the player should have, check if they need it in the database
  for (const achievement of shouldHaveAchievements) {
    // Find the corresponding tier in the database
    const dbTier = tierData.find(t => 
      t.achievement_id === achievement.achievementId && 
      t.tier === achievement.tier
    );

    if (!dbTier) {
      console.warn(`Could not find database tier for ${achievement.achievementId} tier ${achievement.tier}`);
      continue;
    }

    // Check if player already has this achievement
    const { data: existingAchievement } = await supabase
      .from('unlocked_achievements')
      .select('id')
      .eq('player_uuid', playerUuid)
      .eq('tier_id', dbTier.id)
      .single();

    if (existingAchievement) {
      console.log(`Player already has achievement: ${achievement.achievementName} - ${achievement.name}`);
      continue;
    }

    // Award the achievement
    const { error } = await supabase
      .from('unlocked_achievements')
      .insert({
        player_uuid: playerUuid,
        tier_id: dbTier.id
      });

    if (error) {
      console.error(`Failed to award achievement ${achievement.achievementName} to ${playerUuid}:`, error);
    } else {
      console.log(`Awarded achievement: ${achievement.achievementName} - ${achievement.name} to ${playerUuid}`);
    }
  }
};
