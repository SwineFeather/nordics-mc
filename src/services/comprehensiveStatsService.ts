import { supabase } from '@/integrations/supabase/client';
import possibleStats from '../possible_stats.json';

interface PlayerStatsData {
  player_uuid: string;
  stats: Record<string, any>;
  last_updated: number;
}

/**
 * Fetches comprehensive stats for a player from individual JSON files
 * and merges them with database stats to ensure all possible stats are included
 */
export const getComprehensivePlayerStats = async (uuid: string): Promise<Record<string, number>> => {
  try {
    // First, get stats from database
    const { data: dbStats, error: dbError } = await supabase
      .from('player_stats')
      .select('stats')
      .eq('player_uuid', uuid)
      .single();

    let databaseStats: Record<string, any> = {};
    if (!dbError && dbStats?.stats) {
      databaseStats = typeof dbStats.stats === 'string' 
        ? JSON.parse(dbStats.stats) 
        : dbStats.stats;
    }

    // Then, try to get detailed stats from JSON file
    let fileStats: Record<string, number> = {};
    try {
      // Try multiple possible paths for stats files
      const possiblePaths = [
        `/stats/data/playerdata/${uuid}.json`,
        `/data/playerdata/${uuid}.json`,
        `./stats/data/playerdata/${uuid}.json`
      ];
      
      let statsUrl = '';
      let response: Response | null = null;
      
      for (const path of possiblePaths) {
        try {
          console.debug(`Trying to fetch stats from: ${path}`);
          response = await fetch(path);
          if (response.ok) {
            statsUrl = path;
            break;
          }
        } catch (pathError) {
          console.debug(`Failed to fetch from ${path}:`, pathError);
          continue;
        }
      }
      
      if (response && response.ok) {
        console.debug(`Successfully fetched from: ${statsUrl}, status: ${response.status}`);
        
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        console.debug(`Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.debug(`Successfully parsed JSON for ${uuid}, data keys:`, Object.keys(data));
            Object.entries(data).forEach(([key, statData]: [string, any]) => {
              if (statData && typeof statData.value === 'number') {
                fileStats[key] = statData.value;
              }
            });
          } catch (jsonError) {
            console.warn(`Failed to parse JSON for ${uuid}:`, jsonError);
          }
        } else {
          console.warn(`Response for ${uuid} is not JSON, content-type: ${contentType}`);
          // Log a sample of the response to debug
          try {
            const textResponse = await response.text();
            console.warn(`Response preview for ${uuid}:`, textResponse.substring(0, 200));
          } catch (textError) {
            console.warn(`Could not read response text for ${uuid}:`, textError);
          }
        }
      } else if (response && response.status === 404) {
        // File doesn't exist, which is normal for some players
        console.debug(`No stats file found for ${uuid} at any path`);
      } else {
        console.warn(`Failed to fetch stats for ${uuid} from all paths`);
      }
    } catch (error) {
      console.warn(`Failed to fetch detailed stats for ${uuid}:`, error);
    }

    // Create comprehensive stats object with all possible stats initialized to 0
    const comprehensiveStats: Record<string, number> = {};
    
    // Initialize all possible stats to 0 using the correct stat names
    Object.entries(possibleStats).forEach(([category, categoryStats]) => {
      if (typeof categoryStats === 'object') {
        Object.keys(categoryStats).forEach(statName => {
          const flatStatName = getFlatStatName(category, statName);
          comprehensiveStats[flatStatName] = 0;
        });
      }
    });

    // Merge database stats (priority 1)
    Object.entries(databaseStats).forEach(([key, value]) => {
      if (typeof value === 'number') {
        comprehensiveStats[key] = value;
      }
    });

    // Merge file stats (priority 2 - overwrites database stats)
    Object.entries(fileStats).forEach(([key, value]) => {
      if (typeof value === 'number') {
        comprehensiveStats[key] = value;
      }
    });

    return comprehensiveStats;
  } catch (error) {
    console.error(`Error getting comprehensive stats for ${uuid}:`, error);
    return {};
  }
};

/**
 * Converts category and stat name to flat stat name
 * This function maps the possible_stats.json structure to the correct stat names
 */
const getFlatStatName = (category: string, statName: string): string => {
  switch (category) {
    case 'custom':
      return statName;
    case 'mined':
      return `${statName}_mined`;
    case 'used':
      return `${statName}_used`;
    case 'crafted':
      return `${statName}_crafted`;
    case 'killed':
      return `${statName}_killed`;
    case 'killed_by':
      return `killed_by_${statName}`;
    case 'picked_up':
      return `${statName}_picked_up`;
    case 'dropped':
      return `${statName}_dropped`;
    case 'broken':
      return `${statName}_broken`;
    default:
      return `${category}_${statName}`;
  }
};

/**
 * Updates player stats in database with comprehensive data
 */
export const updatePlayerStatsComprehensive = async (uuid: string): Promise<boolean> => {
  try {
    const comprehensiveStats = await getComprehensivePlayerStats(uuid);
    
    const { error } = await supabase
      .from('player_stats')
      .upsert({
        player_uuid: uuid,
        stats: comprehensiveStats,
        last_updated: Math.floor(Date.now() / 1000)
      });

    if (error) {
      console.error(`Error updating comprehensive stats for ${uuid}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in updatePlayerStatsComprehensive for ${uuid}:`, error);
    return false;
  }
};

/**
 * Batch updates stats for multiple players
 */
export const updatePlayerStatsBatch = async (uuids: string[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  // Process in batches of 10 to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < uuids.length; i += batchSize) {
    const batch = uuids.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (uuid) => {
      const result = await updatePlayerStatsComprehensive(uuid);
      return { uuid, success: result };
    });

    const results = await Promise.all(batchPromises);
    
    results.forEach(({ success: isSuccess }) => {
      if (isSuccess) {
        success++;
      } else {
        failed++;
      }
    });

    // Small delay between batches
    if (i + batchSize < uuids.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { success, failed };
};

/**
 * Gets all player UUIDs from the database
 */
export const getAllPlayerUUIDs = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('uuid');

    if (error) {
      console.error('Error fetching player UUIDs:', error);
      return [];
    }

    return data?.map(player => player.uuid) || [];
  } catch (error) {
    console.error('Error in getAllPlayerUUIDs:', error);
    return [];
  }
};

/**
 * Comprehensive stats update for all players
 */
export const updateAllPlayerStatsComprehensive = async (): Promise<{ success: number; failed: number; total: number }> => {
  console.log('Starting comprehensive stats update for all players...');
  
  const uuids = await getAllPlayerUUIDs();
  console.log(`Found ${uuids.length} players to update`);
  
  const { success, failed } = await updatePlayerStatsBatch(uuids);
  
  console.log(`Comprehensive stats update complete: ${success} successful, ${failed} failed`);
  
  return { success, failed, total: uuids.length };
};

/**
 * Creates a new comprehensive stats service that properly collects all stats
 * from possible_stats.json and individual player files
 */
export const createComprehensivePlayerStats = async (uuid: string): Promise<Record<string, number>> => {
  try {
    // Initialize with all possible stats from possible_stats.json
    const comprehensiveStats: Record<string, number> = {};
    
    // Initialize all possible stats to 0
    Object.entries(possibleStats).forEach(([category, categoryStats]) => {
      if (typeof categoryStats === 'object') {
        Object.keys(categoryStats).forEach(statName => {
          const flatStatName = getFlatStatName(category, statName);
          comprehensiveStats[flatStatName] = 0;
        });
      }
    });

    // Get stats from individual player JSON file (highest priority)
    try {
      const response = await fetch(`/stats/data/playerdata/${uuid}.json`);
      if (response.ok) {
        const data = await response.json();
        Object.entries(data).forEach(([key, statData]: [string, any]) => {
          if (statData && typeof statData.value === 'number') {
            comprehensiveStats[key] = statData.value;
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch detailed stats for ${uuid}:`, error);
    }

    // Get stats from database (medium priority)
    try {
      const { data: dbStats, error: dbError } = await supabase
        .from('player_stats')
        .select('stats')
        .eq('player_uuid', uuid)
        .single();

      if (!dbError && dbStats?.stats) {
        const databaseStats = typeof dbStats.stats === 'string' 
          ? JSON.parse(dbStats.stats) 
          : dbStats.stats;

        Object.entries(databaseStats).forEach(([key, value]) => {
          if (typeof value === 'number' && comprehensiveStats[key] === 0) {
            // Only use database stats if we don't have file stats
            comprehensiveStats[key] = value;
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch database stats for ${uuid}:`, error);
    }

    return comprehensiveStats;
  } catch (error) {
    console.error(`Error creating comprehensive stats for ${uuid}:`, error);
    return {};
  }
};

/**
 * Updates the database with comprehensive stats for a player
 */
export const updatePlayerStatsWithComprehensiveData = async (uuid: string): Promise<boolean> => {
  try {
    const comprehensiveStats = await createComprehensivePlayerStats(uuid);
    
    const { error } = await supabase
      .from('player_stats')
      .upsert({
        player_uuid: uuid,
        stats: comprehensiveStats,
        last_updated: Math.floor(Date.now() / 1000)
      });

    if (error) {
      console.error(`Error updating comprehensive stats for ${uuid}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in updatePlayerStatsWithComprehensiveData for ${uuid}:`, error);
    return false;
  }
}; 