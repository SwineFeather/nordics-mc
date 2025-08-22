import { supabase } from '@/integrations/supabase/client';

interface PlayerStatsData {
  player_uuid: string;
  stats: Record<string, any>;
  last_updated: number;
}

// Dynamic import for possible stats to avoid JSON import issues
let possibleStats: any = null;

async function loadPossibleStats() {
  if (!possibleStats) {
    try {
      possibleStats = await import('../../possible_stats.json');
    } catch (error) {
      console.error('Failed to load possible_stats.json:', error);
      possibleStats = {};
    }
  }
  return possibleStats;
}

/**
 * Comprehensive Stats Service
 * 
 * This service fetches and combines player statistics from multiple sources
 * including database, file system, and possible stats definitions.
 */

export class ComprehensiveStatsService {
  private static DEBUG = false; // Set to true to enable verbose logging
  
  /**
   * Toggle debug mode at runtime
   */
  static toggleDebugMode(): void {
    ComprehensiveStatsService.DEBUG = !ComprehensiveStatsService.DEBUG;
    console.log(`🔧 Comprehensive Stats debug mode ${ComprehensiveStatsService.DEBUG ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Set debug mode explicitly
   */
  static setDebugMode(enabled: boolean): void {
    ComprehensiveStatsService.DEBUG = enabled;
    console.log(`🔧 Comprehensive Stats debug mode ${ComprehensiveStatsService.DEBUG ? 'enabled' : 'disabled'}`);
  }

  /**
   * Fetches comprehensive stats for a player from individual JSON files
   * and merges them with database stats to ensure all possible stats are included
   */
  static async getComprehensivePlayerStats(uuid: string): Promise<Record<string, number>> {
    try {
      // Load possible stats dynamically
      const stats = await loadPossibleStats();
      
      // Debug logging for possibleStats import
      if (ComprehensiveStatsService.DEBUG) {
        console.debug('possibleStats import status:', {
          isDefined: typeof stats !== 'undefined',
          type: typeof stats,
          keys: stats ? Object.keys(stats) : 'undefined'
        });
      }
      
      // First, get stats from database
      const { data: dbStats, error: dbError } = await supabase
        .from('player_stats')
        .select('stats')
        .eq('player_uuid', uuid)
        .single();

      let databaseStats: Record<string, any> = {};
      if (!dbError && dbStats?.stats) {
        try {
          databaseStats = typeof dbStats.stats === 'string' 
            ? JSON.parse(dbStats.stats) 
            : dbStats.stats;
        } catch (parseError) {
          console.warn(`Failed to parse database stats for ${uuid}:`, parseError);
          databaseStats = {};
        }
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
            if (ComprehensiveStatsService.DEBUG) console.debug(`Trying to fetch stats from: ${path}`);
            response = await fetch(path);
            if (response.ok) {
              statsUrl = path;
              break;
            }
          } catch (pathError) {
            if (ComprehensiveStatsService.DEBUG) console.debug(`Failed to fetch from ${path}:`, pathError);
            continue;
          }
        }
        
        if (response && response.ok) {
          if (ComprehensiveStatsService.DEBUG) console.debug(`Successfully fetched from: ${statsUrl}, status: ${response.status}`);
          
          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (ComprehensiveStatsService.DEBUG) console.debug(`Content-Type: ${contentType}`);
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const data = await response.json();
              if (ComprehensiveStatsService.DEBUG) console.debug(`Successfully parsed JSON for ${uuid}, data keys:`, Object.keys(data));
              
              if (data && typeof data === 'object') {
                Object.entries(data).forEach(([key, statData]: [string, any]) => {
                  if (statData && typeof statData === 'object' && typeof statData.value === 'number') {
                    fileStats[key] = statData.value;
                  }
                });
              } else {
                console.warn(`Invalid data structure for ${uuid}, expected object but got:`, typeof data);
              }
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
          if (ComprehensiveStatsService.DEBUG) console.debug(`No stats file found for ${uuid} at any path`);
        } else {
          console.warn(`Failed to fetch stats for ${uuid} from all paths`);
        }
      } catch (error) {
        console.warn(`Failed to fetch detailed stats for ${uuid}:`, error);
      }

      // Create comprehensive stats object with all possible stats initialized to 0
      const comprehensiveStats: Record<string, number> = {};
      
      // Initialize all possible stats to 0 using the correct stat names
      if (stats && typeof stats === 'object') {
        Object.entries(stats).forEach(([category, categoryStats]) => {
          if (typeof categoryStats === 'object') {
            Object.keys(categoryStats).forEach(statName => {
              const flatStatName = ComprehensiveStatsService.getFlatStatName(category, statName);
              comprehensiveStats[flatStatName] = 0;
            });
          }
        });
      } else {
        console.warn('possibleStats is not available, skipping stat initialization');
      }

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
  }

  /**
   * Converts category and stat name to flat stat name
   * This function maps the possible_stats.json structure to the correct stat names
   */
  private static getFlatStatName(category: string, statName: string): string {
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
  }

  /**
   * Updates player stats in database with comprehensive data
   */
  static async updatePlayerStatsComprehensive(uuid: string): Promise<boolean> {
    try {
      const comprehensiveStats = await ComprehensiveStatsService.getComprehensivePlayerStats(uuid);
      
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
  }

  /**
   * Batch updates stats for multiple players
   */
  static async updatePlayerStatsBatch(uuids: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Process in batches of 10 to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < uuids.length; i += batchSize) {
      const batch = uuids.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (uuid) => {
        const result = await ComprehensiveStatsService.updatePlayerStatsComprehensive(uuid);
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
  }

  /**
   * Gets all player UUIDs from the database
   */
  static async getAllPlayerUUIDs(): Promise<string[]> {
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
  }

  /**
   * Comprehensive stats update for all players
   */
  static async updateAllPlayerStatsComprehensive(): Promise<{ success: number; failed: number; total: number }> {
    console.log('Starting comprehensive stats update for all players...');
    
    const uuids = await ComprehensiveStatsService.getAllPlayerUUIDs();
    console.log(`Found ${uuids.length} players to update`);
    
    const { success, failed } = await ComprehensiveStatsService.updatePlayerStatsBatch(uuids);
    
    console.log(`Comprehensive stats update complete: ${success} successful, ${failed} failed`);
    
    return { success, failed, total: uuids.length };
  }

  /**
   * Creates a new comprehensive stats service that properly collects all stats
   * from possible_stats.json and individual player files
   */
  static async createComprehensivePlayerStats(uuid: string): Promise<Record<string, number>> {
    try {
      // Load possible stats dynamically
      const stats = await loadPossibleStats();
      
      // Initialize with all possible stats from possible_stats.json
      const comprehensiveStats: Record<string, number> = {};
      
      // Initialize all possible stats to 0
      if (stats && typeof stats === 'object') {
        Object.entries(stats).forEach(([category, categoryStats]) => {
          if (typeof categoryStats === 'object') {
            Object.keys(categoryStats).forEach(statName => {
              const flatStatName = ComprehensiveStatsService.getFlatStatName(category, statName);
              comprehensiveStats[flatStatName] = 0;
            });
          }
        });
      } else {
        console.warn('possibleStats is not available, skipping stat initialization');
      }

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
  }

  /**
   * Updates the database with comprehensive stats for a player
   */
  static async updatePlayerStatsWithComprehensiveData(uuid: string): Promise<boolean> {
    try {
      const comprehensiveStats = await ComprehensiveStatsService.createComprehensivePlayerStats(uuid);
      
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
  }
} 

// Export individual functions for backward compatibility
export const getComprehensivePlayerStats = ComprehensiveStatsService.getComprehensivePlayerStats;
export const getAllPlayerUUIDs = ComprehensiveStatsService.getAllPlayerUUIDs;
export const updateAllPlayerStatsComprehensive = ComprehensiveStatsService.updateAllPlayerStatsComprehensive;
export const createComprehensivePlayerStats = ComprehensiveStatsService.createComprehensivePlayerStats;
export const updatePlayerStatsWithComprehensiveData = ComprehensiveStatsService.updatePlayerStatsWithComprehensiveData;
export const updatePlayerStatsComprehensive = ComprehensiveStatsService.updatePlayerStatsComprehensive;
export const updatePlayerStatsBatch = ComprehensiveStatsService.updatePlayerStatsBatch; 