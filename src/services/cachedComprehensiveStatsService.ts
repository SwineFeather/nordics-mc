import { playerStatsCache } from './cacheService';
import { getComprehensivePlayerStats as getComprehensiveStats } from './comprehensiveStatsService';

/**
 * Cached version of comprehensive player stats service
 * This service provides the same functionality as comprehensiveStatsService
 * but with intelligent caching to reduce database egress
 */
export class CachedComprehensiveStatsService {
  private static instance: CachedComprehensiveStatsService;

  private constructor() {}

  static getInstance(): CachedComprehensiveStatsService {
    if (!CachedComprehensiveStatsService.instance) {
      CachedComprehensiveStatsService.instance = new CachedComprehensiveStatsService();
    }
    return CachedComprehensiveStatsService.instance;
  }

  /**
   * Get comprehensive stats for a player with caching
   */
  async getComprehensivePlayerStats(uuid: string): Promise<Record<string, number>> {
    try {
      // Try cache first
      const cachedStats = await playerStatsCache.getPlayerStats(uuid);
      if (cachedStats) {
        return cachedStats;
      }

      // Cache miss - fetch from comprehensive stats service
      const stats = await getComprehensiveStats(uuid);
      
      // Cache the result (this will be handled by the cache service)
      await playerStatsCache.updatePlayerStats(uuid, stats);
      
      return stats;
    } catch (error) {
      console.error(`Error getting cached comprehensive stats for ${uuid}:`, error);
      
      // Fallback to direct fetch
      return await getComprehensiveStats(uuid);
    }
  }

  /**
   * Get comprehensive stats for multiple players with batch caching
   */
  async getComprehensivePlayerStatsBatch(uuids: string[]): Promise<Map<string, Record<string, number>>> {
    try {
      return await playerStatsCache.getPlayerStatsBatch(uuids);
    } catch (error) {
      console.error('Error getting cached comprehensive stats batch:', error);
      
      // Fallback to individual fetches
      const results = new Map<string, Record<string, number>>();
      const promises = uuids.map(async (uuid) => {
        const stats = await this.getComprehensivePlayerStats(uuid);
        return { uuid, stats };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ uuid, stats }) => {
        results.set(uuid, stats);
      });

      return results;
    }
  }

  /**
   * Update player stats and invalidate cache
   */
  async updatePlayerStatsComprehensive(uuid: string): Promise<boolean> {
    try {
      const stats = await getComprehensiveStats(uuid);
      await playerStatsCache.updatePlayerStats(uuid, stats);
      return true;
    } catch (error) {
      console.error(`Error updating cached comprehensive stats for ${uuid}:`, error);
      return false;
    }
  }

  /**
   * Batch update stats for multiple players
   */
  async updatePlayerStatsBatch(uuids: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < uuids.length; i += batchSize) {
      const batch = uuids.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (uuid) => {
        const result = await this.updatePlayerStatsComprehensive(uuid);
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
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    memoryUsage: number;
    cacheSize: number;
    hitRate: number;
  }> {
    return await playerStatsCache.getCacheStats();
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    await playerStatsCache.clearAllCaches();
  }

  /**
   * Preload cache for frequently accessed players
   */
  async preloadCacheForPlayers(uuids: string[]): Promise<void> {
    console.log(`Preloading cache for ${uuids.length} players...`);
    
    const batchSize = 20;
    for (let i = 0; i < uuids.length; i += batchSize) {
      const batch = uuids.slice(i, i + batchSize);
      
      await this.getComprehensivePlayerStatsBatch(batch);
      
      // Small delay between batches
      if (i + batchSize < uuids.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log('Cache preloading completed');
  }
}

// Export singleton instance
export const cachedComprehensiveStats = CachedComprehensiveStatsService.getInstance();

// Convenience functions for backward compatibility
export const getComprehensivePlayerStats = (uuid: string) => 
  cachedComprehensiveStats.getComprehensivePlayerStats(uuid);

export const getComprehensivePlayerStatsBatch = (uuids: string[]) => 
  cachedComprehensiveStats.getComprehensivePlayerStatsBatch(uuids);

export const updatePlayerStatsComprehensive = (uuid: string) => 
  cachedComprehensiveStats.updatePlayerStatsComprehensive(uuid);

export const updatePlayerStatsBatch = (uuids: string[]) => 
  cachedComprehensiveStats.updatePlayerStatsBatch(uuids);

export const preloadCacheForPlayers = (uuids: string[]) => 
  cachedComprehensiveStats.preloadCacheForPlayers(uuids); 