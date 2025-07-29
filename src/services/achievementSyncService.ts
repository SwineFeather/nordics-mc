import { supabase } from '@/integrations/supabase/client';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  created_at: string;
}

export interface AchievementTier {
  id: string;
  achievement_id: string;
  tier: number;
  name: string;
  description: string;
  threshold: number;
  icon: string;
  points: number;
  created_at: string;
}

export interface UnlockedAchievement {
  id: string;
  player_uuid: string;
  tier_id: string;
  unlocked_at: string;
  claimed_at?: string;
  is_claimed?: boolean;
  tier?: AchievementTier;
}

export interface LevelDefinition {
  level: number;
  xp_required: number;
  title: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Initialize achievement definitions in the database
export const initializeAchievementDefinitions = async (): Promise<void> => {
  const achievementDefinitions = [
    {
      id: 'playtime',
      name: 'Time Lord',
      description: 'Accumulate playtime on the server',
      stat: 'custom_minecraft_play_time'
    },
    {
      id: 'blocks_placed',
      name: 'Master Builder',
      description: 'Place blocks to build amazing structures',
      stat: 'blocksPlaced'
    },
    {
      id: 'blocks_broken',
      name: 'Mining Master',
      description: 'Break blocks to gather resources',
      stat: 'blocksBroken'
    },
    {
      id: 'mob_kills',
      name: 'Combat Expert',
      description: 'Defeat hostile mobs',
      stat: 'mobKills'
    },
    {
      id: 'diamond_mining',
      name: 'Diamond Hunter',
      description: 'Mine diamond ores',
      stat: 'mined_minecraft_diamond_ore'
    },
    {
      id: 'fishing',
      name: 'Master Angler',
      description: 'Catch fish and treasures',
      stat: 'fishing_rod'
    },
    {
      id: 'woodcutting',
      name: 'Lumberjack',
      description: 'Cut down trees and gather wood',
      stat: 'mined_minecraft_oak_log'
    },
    {
      id: 'travel',
      name: 'Explorer',
      description: 'Travel across the world',
      stat: 'walk'
    },
    {
      id: 'combat_weapons',
      name: 'Weapon Master',
      description: 'Master different combat weapons',
      stat: 'netherite_sword'
    },
    {
      id: 'ranged_combat',
      name: 'Archer',
      description: 'Master ranged combat',
      stat: 'bow'
    }
  ];

  for (const achievement of achievementDefinitions) {
    const { error } = await supabase
      .from('achievement_definitions')
      .upsert(achievement, { onConflict: 'id' });

    if (error) {
      console.error(`Error upserting achievement ${achievement.id}:`, error);
    }
  }
};

// Initialize achievement tiers in the database
export const initializeAchievementTiers = async (): Promise<void> => {
  const tierDefinitions = [
    // Playtime tiers
    { achievement_id: 'playtime', tier: 1, name: 'Newcomer', description: 'Play for 1 hour', threshold: 1, icon: 'clock', points: 50 },
    { achievement_id: 'playtime', tier: 2, name: 'Regular', description: 'Play for 10 hours', threshold: 10, icon: 'clock', points: 100 },
    { achievement_id: 'playtime', tier: 3, name: 'Dedicated', description: 'Play for 50 hours', threshold: 50, icon: 'clock', points: 150 },
    { achievement_id: 'playtime', tier: 4, name: 'Veteran', description: 'Play for 100 hours', threshold: 100, icon: 'clock', points: 200 },
    { achievement_id: 'playtime', tier: 5, name: 'Time Lord', description: 'Play for 500 hours', threshold: 500, icon: 'clock', points: 250 },

    // Blocks placed tiers
    { achievement_id: 'blocks_placed', tier: 1, name: 'Builder', description: 'Place 1,000 blocks', threshold: 1000, icon: 'hammer', points: 50 },
    { achievement_id: 'blocks_placed', tier: 2, name: 'Constructor', description: 'Place 5,000 blocks', threshold: 5000, icon: 'hammer', points: 100 },
    { achievement_id: 'blocks_placed', tier: 3, name: 'Engineer', description: 'Place 25,000 blocks', threshold: 25000, icon: 'hammer', points: 150 },
    { achievement_id: 'blocks_placed', tier: 4, name: 'Master Builder', description: 'Place 100,000 blocks', threshold: 100000, icon: 'hammer', points: 200 },
    { achievement_id: 'blocks_placed', tier: 5, name: 'Architect', description: 'Place 500,000 blocks', threshold: 500000, icon: 'hammer', points: 250 },

    // Blocks broken tiers
    { achievement_id: 'blocks_broken', tier: 1, name: 'Miner', description: 'Break 1,000 blocks', threshold: 1000, icon: 'pickaxe', points: 50 },
    { achievement_id: 'blocks_broken', tier: 2, name: 'Excavator', description: 'Break 5,000 blocks', threshold: 5000, icon: 'pickaxe', points: 100 },
    { achievement_id: 'blocks_broken', tier: 3, name: 'Tunneler', description: 'Break 25,000 blocks', threshold: 25000, icon: 'pickaxe', points: 150 },
    { achievement_id: 'blocks_broken', tier: 4, name: 'Mining Master', description: 'Break 100,000 blocks', threshold: 100000, icon: 'pickaxe', points: 200 },
    { achievement_id: 'blocks_broken', tier: 5, name: 'Terraformer', description: 'Break 500,000 blocks', threshold: 500000, icon: 'pickaxe', points: 250 },

    // Mob kills tiers
    { achievement_id: 'mob_kills', tier: 1, name: 'Fighter', description: 'Kill 100 mobs', threshold: 100, icon: 'swords', points: 50 },
    { achievement_id: 'mob_kills', tier: 2, name: 'Warrior', description: 'Kill 500 mobs', threshold: 500, icon: 'swords', points: 100 },
    { achievement_id: 'mob_kills', tier: 3, name: 'Slayer', description: 'Kill 2,500 mobs', threshold: 2500, icon: 'swords', points: 150 },
    { achievement_id: 'mob_kills', tier: 4, name: 'Combat Expert', description: 'Kill 10,000 mobs', threshold: 10000, icon: 'swords', points: 200 },
    { achievement_id: 'mob_kills', tier: 5, name: 'Legendary Hunter', description: 'Kill 50,000 mobs', threshold: 50000, icon: 'swords', points: 250 },

    // Diamond mining tiers
    { achievement_id: 'diamond_mining', tier: 1, name: 'Prospector', description: 'Mine 10 diamond ores', threshold: 10, icon: 'gem', points: 100 },
    { achievement_id: 'diamond_mining', tier: 2, name: 'Diamond Hunter', description: 'Mine 50 diamond ores', threshold: 50, icon: 'gem', points: 200 },
    { achievement_id: 'diamond_mining', tier: 3, name: 'Diamond Master', description: 'Mine 200 diamond ores', threshold: 200, icon: 'gem', points: 300 },
    { achievement_id: 'diamond_mining', tier: 4, name: 'Diamond Baron', description: 'Mine 1,000 diamond ores', threshold: 1000, icon: 'gem', points: 400 },
    { achievement_id: 'diamond_mining', tier: 5, name: 'Diamond King', description: 'Mine 5,000 diamond ores', threshold: 5000, icon: 'gem', points: 500 },

    // Fishing tiers
    { achievement_id: 'fishing', tier: 1, name: 'Fisher', description: 'Use fishing rod 100 times', threshold: 100, icon: 'ship', points: 50 },
    { achievement_id: 'fishing', tier: 2, name: 'Angler', description: 'Use fishing rod 500 times', threshold: 500, icon: 'ship', points: 100 },
    { achievement_id: 'fishing', tier: 3, name: 'Master Angler', description: 'Use fishing rod 2,500 times', threshold: 2500, icon: 'ship', points: 150 },
    { achievement_id: 'fishing', tier: 4, name: 'Fishing Legend', description: 'Use fishing rod 10,000 times', threshold: 10000, icon: 'ship', points: 200 },
    { achievement_id: 'fishing', tier: 5, name: 'Sea Lord', description: 'Use fishing rod 50,000 times', threshold: 50000, icon: 'ship', points: 250 },

    // Woodcutting tiers
    { achievement_id: 'woodcutting', tier: 1, name: 'Woodcutter', description: 'Mine 100 oak logs', threshold: 100, icon: 'tree-deciduous', points: 50 },
    { achievement_id: 'woodcutting', tier: 2, name: 'Lumberjack', description: 'Mine 500 oak logs', threshold: 500, icon: 'tree-deciduous', points: 100 },
    { achievement_id: 'woodcutting', tier: 3, name: 'Forest Master', description: 'Mine 2,500 oak logs', threshold: 2500, icon: 'tree-deciduous', points: 150 },
    { achievement_id: 'woodcutting', tier: 4, name: 'Timber Baron', description: 'Mine 10,000 oak logs', threshold: 10000, icon: 'tree-deciduous', points: 200 },
    { achievement_id: 'woodcutting', tier: 5, name: 'Nature Guardian', description: 'Mine 50,000 oak logs', threshold: 50000, icon: 'tree-deciduous', points: 250 },

    // Travel tiers
    { achievement_id: 'travel', tier: 1, name: 'Wanderer', description: 'Walk 10,000 blocks', threshold: 10000, icon: 'footprints', points: 50 },
    { achievement_id: 'travel', tier: 2, name: 'Explorer', description: 'Walk 50,000 blocks', threshold: 50000, icon: 'footprints', points: 100 },
    { achievement_id: 'travel', tier: 3, name: 'Adventurer', description: 'Walk 250,000 blocks', threshold: 250000, icon: 'footprints', points: 150 },
    { achievement_id: 'travel', tier: 4, name: 'Voyager', description: 'Walk 1,000,000 blocks', threshold: 1000000, icon: 'footprints', points: 200 },
    { achievement_id: 'travel', tier: 5, name: 'World Walker', description: 'Walk 5,000,000 blocks', threshold: 5000000, icon: 'footprints', points: 250 },

    // Combat weapons tiers
    { achievement_id: 'combat_weapons', tier: 1, name: 'Swordsman', description: 'Use netherite sword 100 times', threshold: 100, icon: 'sword', points: 100 },
    { achievement_id: 'combat_weapons', tier: 2, name: 'Blade Master', description: 'Use netherite sword 500 times', threshold: 500, icon: 'sword', points: 200 },
    { achievement_id: 'combat_weapons', tier: 3, name: 'Weapon Master', description: 'Use netherite sword 2,500 times', threshold: 2500, icon: 'sword', points: 300 },
    { achievement_id: 'combat_weapons', tier: 4, name: 'Combat Legend', description: 'Use netherite sword 10,000 times', threshold: 10000, icon: 'sword', points: 400 },
    { achievement_id: 'combat_weapons', tier: 5, name: 'War God', description: 'Use netherite sword 50,000 times', threshold: 50000, icon: 'sword', points: 500 },

    // Ranged combat tiers
    { achievement_id: 'ranged_combat', tier: 1, name: 'Archer', description: 'Use bow 100 times', threshold: 100, icon: 'bow', points: 50 },
    { achievement_id: 'ranged_combat', tier: 2, name: 'Marksman', description: 'Use bow 500 times', threshold: 500, icon: 'bow', points: 100 },
    { achievement_id: 'ranged_combat', tier: 3, name: 'Sharpshooter', description: 'Use bow 2,500 times', threshold: 2500, icon: 'bow', points: 150 },
    { achievement_id: 'ranged_combat', tier: 4, name: 'Ranged Master', description: 'Use bow 10,000 times', threshold: 10000, icon: 'bow', points: 200 },
    { achievement_id: 'ranged_combat', tier: 5, name: 'Eagle Eye', description: 'Use bow 50,000 times', threshold: 50000, icon: 'bow', points: 250 }
  ];

  for (const tier of tierDefinitions) {
    const { error } = await supabase
      .from('achievement_tiers')
      .upsert(tier, { onConflict: 'achievement_id,tier' });

    if (error) {
      console.error(`Error upserting tier ${tier.achievement_id}-${tier.tier}:`, error);
    }
  }
};

// Initialize level definitions in the database
export const initializeLevelDefinitions = async (): Promise<void> => {
  const levelDefinitions = [
    { level: 1, xp_required: 0, title: 'Newcomer', description: 'Welcome to the server!', color: '#6b7280' },
    { level: 2, xp_required: 100, title: 'Novice', description: 'Getting started', color: '#10b981' },
    { level: 3, xp_required: 250, title: 'Apprentice', description: 'Learning the ropes', color: '#3b82f6' },
    { level: 4, xp_required: 500, title: 'Journeyman', description: 'Making progress', color: '#8b5cf6' },
    { level: 5, xp_required: 1000, title: 'Adventurer', description: 'Exploring the world', color: '#f59e0b' },
    { level: 6, xp_required: 1750, title: 'Explorer', description: 'Discovering new places', color: '#06b6d4' },
    { level: 7, xp_required: 2750, title: 'Veteran', description: 'Experienced player', color: '#84cc16' },
    { level: 8, xp_required: 4000, title: 'Expert', description: 'Skilled and knowledgeable', color: '#f97316' },
    { level: 9, xp_required: 6000, title: 'Master', description: 'Mastered the game', color: '#ef4444' },
    { level: 10, xp_required: 8500, title: 'Champion', description: 'Elite player', color: '#a855f7' },
    { level: 11, xp_required: 12000, title: 'Legend', description: 'Legendary status', color: '#dc2626' },
    { level: 12, xp_required: 16500, title: 'Mythic', description: 'Mythical prowess', color: '#9333ea' },
    { level: 13, xp_required: 22500, title: 'Ascended', description: 'Beyond mortal limits', color: '#1d4ed8' },
    { level: 14, xp_required: 30000, title: 'Divine', description: 'Divine power', color: '#059669' },
    { level: 15, xp_required: 40000, title: 'Transcendent', description: 'Transcended reality', color: '#be123c' }
  ];

  for (const level of levelDefinitions) {
    const { error } = await supabase
      .from('level_definitions')
      .upsert(level, { onConflict: 'level' });

    if (error) {
      console.error(`Error upserting level ${level.level}:`, error);
    }
  }
};

// Get all achievement definitions
export const getAchievementDefinitions = async (): Promise<AchievementDefinition[]> => {
  const { data, error } = await supabase
    .from('achievement_definitions')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching achievement definitions:', error);
    return [];
  }

  return data || [];
};

// Get all achievement tiers
export const getAchievementTiers = async (): Promise<AchievementTier[]> => {
  const { data, error } = await supabase
    .from('achievement_tiers')
    .select('*')
    .order('achievement_id, tier');

  if (error) {
    console.error('Error fetching achievement tiers:', error);
    return [];
  }

  return data || [];
};

// Get unlocked achievements for a player
export const getUnlockedAchievements = async (playerUuid: string): Promise<UnlockedAchievement[]> => {
  const { data, error } = await supabase
    .from('unlocked_achievements')
    .select(`
      *,
      tier:achievement_tiers(
        *,
        definition:achievement_definitions(*)
      )
    `)
    .eq('player_uuid', playerUuid)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching unlocked achievements:', error);
    return [];
  }

  return data || [];
};

// Get level definitions
export const getLevelDefinitions = async (): Promise<LevelDefinition[]> => {
  const { data, error } = await supabase
    .from('level_definitions')
    .select('*')
    .order('level');

  if (error) {
    console.error('Error fetching level definitions:', error);
    return [];
  }

  return data || [];
};

// Initialize the entire achievement system
export const initializeAchievementSystem = async (): Promise<void> => {
  console.log('Initializing achievement system...');
  
  try {
    await initializeAchievementDefinitions();
    await initializeAchievementTiers();
    await initializeLevelDefinitions();
    
    console.log('Achievement system initialized successfully');
  } catch (error) {
    console.error('Error initializing achievement system:', error);
  }
};

// Sync achievements for all players
export const syncAllPlayerAchievements = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('sync_all_achievements');
    
    if (error) {
      console.error('Error syncing achievements:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in syncAllPlayerAchievements:', error);
    return { success: false, error: 'Unknown error occurred' };
  }
}; 