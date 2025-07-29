import { supabase } from '@/integrations/supabase/client';
import { createComprehensivePlayerStats, updatePlayerStatsWithComprehensiveData } from './comprehensiveStatsService';
import possibleStats from '../possible_stats.json';

/**
 * Service to sync all player stats with comprehensive data
 * This ensures all players have all possible stats from possible_stats.json
 */
export class PlayerStatsSyncService {
  /**
   * Sync stats for a single player
   */
  static async syncPlayerStats(uuid: string): Promise<boolean> {
    try {
      console.log(`Syncing stats for player ${uuid}...`);
      
      // Create comprehensive stats for this player
      const comprehensiveStats = await createComprehensivePlayerStats(uuid);
      
      // Update the database
      const { error } = await supabase
        .from('player_stats')
        .upsert({
          player_uuid: uuid,
          stats: comprehensiveStats,
          last_updated: Math.floor(Date.now() / 1000)
        });

      if (error) {
        console.error(`Error syncing stats for ${uuid}:`, error);
        return false;
      }

      console.log(`Successfully synced stats for player ${uuid}`);
      return true;
    } catch (error) {
      console.error(`Error in syncPlayerStats for ${uuid}:`, error);
      return false;
    }
  }

  /**
   * Sync stats for multiple players in batches
   */
  static async syncMultiplePlayerStats(uuids: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    const batchSize = 5; // Process in smaller batches to avoid overwhelming the system

    console.log(`Starting sync for ${uuids.length} players...`);

    for (let i = 0; i < uuids.length; i += batchSize) {
      const batch = uuids.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (uuid) => {
        try {
          const success = await this.syncPlayerStats(uuid);
          return { uuid, success };
        } catch (error) {
          console.error(`Error processing ${uuid}:`, error);
          return { uuid, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ uuid, success, error }) => {
        if (success) {
          results.success++;
        } else {
          results.failed++;
          if (error) {
            results.errors.push(`${uuid}: ${error}`);
          }
        }
      });

      // Progress logging
      const processed = i + batch.length;
      console.log(`Processed ${processed}/${uuids.length} players (${results.success} success, ${results.failed} failed)`);

      // Small delay between batches
      if (i + batchSize < uuids.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Sync complete: ${results.success} successful, ${results.failed} failed`);
    return results;
  }

  /**
   * Sync stats for all players in the database
   */
  static async syncAllPlayerStats(): Promise<{ success: number; failed: number; total: number; errors: string[] }> {
    try {
      console.log('Starting comprehensive stats sync for all players...');
      
      // Get all player UUIDs
      const { data: players, error } = await supabase
        .from('players')
        .select('uuid');

      if (error) {
        console.error('Error fetching player UUIDs:', error);
        return { success: 0, failed: 0, total: 0, errors: [error.message] };
      }

      const uuids = players?.map(player => player.uuid) || [];
      console.log(`Found ${uuids.length} players to sync`);

      const { success, failed, errors } = await this.syncMultiplePlayerStats(uuids);
      
      return { success, failed, total: uuids.length, errors };
    } catch (error) {
      console.error('Error in syncAllPlayerStats:', error);
      return { success: 0, failed: 0, total: 0, errors: [error.message] };
    }
  }

  /**
   * Initialize player stats table with all possible stats
   */
  static async initializePlayerStatsTable(): Promise<boolean> {
    try {
      console.log('Initializing player stats table with all possible stats...');
      
      // Get all player UUIDs
      const { data: players, error } = await supabase
        .from('players')
        .select('uuid');

      if (error) {
        console.error('Error fetching player UUIDs:', error);
        return false;
      }

      const uuids = players?.map(player => player.uuid) || [];
      console.log(`Found ${uuids.length} players to initialize`);

      // Create comprehensive stats for each player
      const statsToUpsert = uuids.map(uuid => ({
        player_uuid: uuid,
        stats: this.createEmptyStatsObject(),
        last_updated: Math.floor(Date.now() / 1000)
      }));

      // Upsert all player stats
      const { error: upsertError } = await supabase
        .from('player_stats')
        .upsert(statsToUpsert, {
          onConflict: 'player_uuid',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting player stats:', upsertError);
        return false;
      }

      console.log(`Successfully initialized stats for ${uuids.length} players`);
      return true;
    } catch (error) {
      console.error('Error in initializePlayerStatsTable:', error);
      return false;
    }
  }

  /**
   * Create an empty stats object with all possible stats initialized to 0
   */
  private static createEmptyStatsObject(): Record<string, number> {
    const emptyStats: Record<string, number> = {};
    
    Object.entries(possibleStats).forEach(([category, categoryStats]) => {
      if (typeof categoryStats === 'object') {
        Object.keys(categoryStats).forEach(statName => {
          const flatStatName = this.getFlatStatName(category, statName);
          emptyStats[flatStatName] = 0;
        });
      }
    });

    return emptyStats;
  }

  /**
   * Converts category and stat name to flat stat name
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
   * Get stats summary for a player
   */
  static async getPlayerStatsSummary(uuid: string): Promise<{
    totalStats: number;
    nonZeroStats: number;
    categories: Record<string, number>;
  }> {
    try {
      const comprehensiveStats = await createComprehensivePlayerStats(uuid);
      
      const totalStats = Object.keys(comprehensiveStats).length;
      const nonZeroStats = Object.values(comprehensiveStats).filter(value => value > 0).length;
      
      // Count stats by category
      const categories: Record<string, number> = {};
      Object.entries(comprehensiveStats).forEach(([statName, value]) => {
        const category = this.getStatCategory(statName);
        categories[category] = (categories[category] || 0) + (value > 0 ? 1 : 0);
      });

      return {
        totalStats,
        nonZeroStats,
        categories
      };
    } catch (error) {
      console.error(`Error getting stats summary for ${uuid}:`, error);
      return {
        totalStats: 0,
        nonZeroStats: 0,
        categories: {}
      };
    }
  }

  /**
   * Get the category of a stat based on its name
   */
  private static getStatCategory(statName: string): string {
    if (statName.endsWith('_mined')) return 'mined';
    if (statName.endsWith('_used')) return 'used';
    if (statName.endsWith('_crafted')) return 'crafted';
    if (statName.endsWith('_killed')) return 'killed';
    if (statName.startsWith('killed_by_')) return 'killed_by';
    if (statName.endsWith('_picked_up')) return 'picked_up';
    if (statName.endsWith('_dropped')) return 'dropped';
    if (statName.endsWith('_broken')) return 'broken';
    return 'custom';
  }
} 