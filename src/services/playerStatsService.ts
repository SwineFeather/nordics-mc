import { supabase } from '@/integrations/supabase/client';
import { flattenNestedStats } from './newStatsService';
import { formatStatName, getStatCategory } from '@/utils/statCategories';
import { getComprehensivePlayerStats, createComprehensivePlayerStats } from './comprehensiveStatsService';

/**
 * Fetches all stats for a player, flattens them, and returns as a key-value object.
 * Optionally, returns metadata for each stat (readable name, category).
 * @param uuid Player UUID
 */
export const getAllStatsForPlayer = async (uuid: string) => {
  try {
    // Get comprehensive stats that include all possible stats
    const comprehensiveStats = await createComprehensivePlayerStats(uuid);
    
    // Optionally, add readable names and categories
    const statsWithMeta = Object.entries(comprehensiveStats).map(([key, value]) => ({
      key,
      value,
      name: formatStatName(key),
      category: getStatCategory(key).name,
    }));

    return {
      flatStats: comprehensiveStats, // { statKey: value, ... }
      statsWithMeta, // [{ key, value, name, category }, ...]
    };
  } catch (error) {
    console.error('Error fetching comprehensive player stats:', error);
    
    // Fallback to database-only approach
    const { data, error: dbError } = await supabase
      .from('player_stats')
      .select('stats')
      .eq('player_uuid', uuid)
      .single();

    if (dbError) {
      console.error('Error fetching player stats from database:', dbError);
      return { flatStats: {}, statsWithMeta: [] };
    }

    const nestedStats = data?.stats || {};
    const flatStats = flattenNestedStats(nestedStats);

    // Optionally, add readable names and categories
    const statsWithMeta = Object.entries(flatStats).map(([key, value]) => ({
      key,
      value,
      name: formatStatName(key),
      category: getStatCategory(key).name,
    }));

    return {
      flatStats, // { statKey: value, ... }
      statsWithMeta, // [{ key, value, name, category }, ...]
    };
  }
};

/**
 * Gets a specific stat for a player
 * @param uuid Player UUID
 * @param statName The stat name to fetch
 */
export const getPlayerStat = async (uuid: string, statName: string): Promise<number> => {
  try {
    const comprehensiveStats = await createComprehensivePlayerStats(uuid);
    return comprehensiveStats[statName] || 0;
  } catch (error) {
    console.error(`Error fetching stat ${statName} for player ${uuid}:`, error);
    return 0;
  }
};

/**
 * Gets multiple stats for a player
 * @param uuid Player UUID
 * @param statNames Array of stat names to fetch
 */
export const getPlayerStats = async (uuid: string, statNames: string[]): Promise<Record<string, number>> => {
  try {
    const comprehensiveStats = await createComprehensivePlayerStats(uuid);
    const result: Record<string, number> = {};
    
    statNames.forEach(statName => {
      result[statName] = comprehensiveStats[statName] || 0;
    });
    
    return result;
  } catch (error) {
    console.error(`Error fetching stats for player ${uuid}:`, error);
    return statNames.reduce((acc, statName) => {
      acc[statName] = 0;
      return acc;
    }, {} as Record<string, number>);
  }
};

/**
 * Gets stats summary for a player (key metrics)
 * @param uuid Player UUID
 */
export const getPlayerStatsSummary = async (uuid: string) => {
  try {
    const comprehensiveStats = await createComprehensivePlayerStats(uuid);
    
    return {
      blocksPlaced: comprehensiveStats.use_dirt || 0,
      blocksBroken: comprehensiveStats.mine_ground || 0,
      mobKills: comprehensiveStats.kill_any || 0,
      deaths: comprehensiveStats.death || 0,
      playtimeHours: Math.floor((comprehensiveStats.play_one_minute || 0) / 72000),
      jumps: comprehensiveStats.jump || 0,
      damageDealt: comprehensiveStats.damage_dealt || 0,
      survivalStreak: Math.floor((comprehensiveStats.time_since_death || 0) / 24000),
      totalStats: Object.keys(comprehensiveStats).length,
      nonZeroStats: Object.values(comprehensiveStats).filter(value => value > 0).length
    };
  } catch (error) {
    console.error(`Error fetching stats summary for player ${uuid}:`, error);
    return {
      blocksPlaced: 0,
      blocksBroken: 0,
      mobKills: 0,
      deaths: 0,
      playtimeHours: 0,
      jumps: 0,
      damageDealt: 0,
      survivalStreak: 0,
      totalStats: 0,
      nonZeroStats: 0
    };
  }
};
