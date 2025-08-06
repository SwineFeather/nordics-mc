import { supabase } from '@/integrations/supabase/client';
import possibleStats from '../possible_stats.json';

// Cache configuration
const CACHE_CONFIG = {
  // Player stats cache settings
  PLAYER_STATS_TTL: 5 * 60, // 5 minutes
  PLAYER_PROFILE_TTL: 10 * 60, // 10 minutes
  LEADERBOARD_TTL: 15 * 60, // 15 minutes
  ACHIEVEMENTS_TTL: 30 * 60, // 30 minutes
  
  // Batch sizes for operations
  BATCH_SIZE: 50,
  
  // Cache keys
  KEYS: {
    PLAYER_STATS: 'player_stats',
    PLAYER_PROFILE: 'player_profile',
    LEADERBOARD: 'leaderboard',
    ACHIEVEMENTS: 'achievements',
    STATS_METADATA: 'stats_metadata',
  }
} as const;

// In-memory cache fallback (when Redis is not available)
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttlSeconds: number): void {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Redis client (with fallback to memory cache)
class RedisClient {
  private memoryCache = new MemoryCache();
  private isRedisAvailable = false;
  private redis: any = null;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Try to connect to Redis (you'll need to set up Redis connection)
      // For now, we'll use memory cache as fallback
      this.isRedisAvailable = false;
      console.log('Redis not available, using memory cache');
    } catch (error) {
      console.warn('Redis connection failed, using memory cache:', error);
      this.isRedisAvailable = false;
    }
  }

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
      } catch (error) {
        console.warn('Redis set failed, falling back to memory cache:', error);
        this.memoryCache.set(key, data, ttlSeconds);
      }
    } else {
      this.memoryCache.set(key, data, ttlSeconds);
    }
  }

  async get(key: string): Promise<any | null> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get failed, falling back to memory cache:', error);
        return this.memoryCache.get(key);
      }
    } else {
      return this.memoryCache.get(key);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.warn('Redis delete failed, falling back to memory cache:', error);
        this.memoryCache.delete(key);
      }
    } else {
      this.memoryCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.flushdb();
      } catch (error) {
        console.warn('Redis clear failed, falling back to memory cache:', error);
        this.memoryCache.clear();
      }
    } else {
      this.memoryCache.clear();
    }
  }

  // Clean up memory cache periodically
  startCleanup(): void {
    setInterval(() => {
      this.memoryCache.cleanup();
    }, 60000); // Clean up every minute
  }
}

// Cache service instance
const cacheClient = new RedisClient();
cacheClient.startCleanup();

/**
 * Player Stats Cache Service
 */
export class PlayerStatsCacheService {
  private static instance: PlayerStatsCacheService;
  private realtimeSubscription: any = null;

  private constructor() {
    this.initializeRealtimeSubscription();
  }

  static getInstance(): PlayerStatsCacheService {
    if (!PlayerStatsCacheService.instance) {
      PlayerStatsCacheService.instance = new PlayerStatsCacheService();
    }
    return PlayerStatsCacheService.instance;
  }

  /**
   * Initialize Supabase Realtime subscription for cache invalidation
   */
  private initializeRealtimeSubscription() {
    try {
      this.realtimeSubscription = supabase
        .channel('player_stats_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_stats'
          },
          (payload) => {
            this.handleStatsChange(payload);
          }
        )
        .subscribe();

      // Realtime subscription initialized for player stats
    } catch (error) {
      console.warn('Failed to initialize realtime subscription:', error);
    }
  }

  /**
   * Handle real-time changes to player stats
   */
  private async handleStatsChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const playerUuid = newRecord?.player_uuid;
      if (playerUuid) {
        // Invalidate related caches
        await this.invalidatePlayerCaches(playerUuid);
        console.log(`Cache invalidated for player: ${playerUuid}`);
      }
    } else if (eventType === 'DELETE') {
      const playerUuid = oldRecord?.player_uuid;
      if (playerUuid) {
        await this.invalidatePlayerCaches(playerUuid);
        console.log(`Cache invalidated for deleted player: ${playerUuid}`);
      }
    }
  }

  /**
   * Invalidate all caches related to a specific player
   */
  private async invalidatePlayerCaches(playerUuid: string) {
    const cacheKeys = [
      `${CACHE_CONFIG.KEYS.PLAYER_STATS}:${playerUuid}`,
      `${CACHE_CONFIG.KEYS.PLAYER_PROFILE}:${playerUuid}`,
      `${CACHE_CONFIG.KEYS.ACHIEVEMENTS}:${playerUuid}`,
    ];

    await Promise.all(
      cacheKeys.map(key => cacheClient.delete(key))
    );

    // Also invalidate leaderboard caches
    await this.invalidateLeaderboardCaches();
  }

  /**
   * Invalidate leaderboard caches
   */
  private async invalidateLeaderboardCaches() {
    const leaderboardKeys = [
      `${CACHE_CONFIG.KEYS.LEADERBOARD}:top_players`,
      `${CACHE_CONFIG.KEYS.LEADERBOARD}:recent_activity`,
      `${CACHE_CONFIG.KEYS.LEADERBOARD}:achievements`,
    ];

    await Promise.all(
      leaderboardKeys.map(key => cacheClient.delete(key))
    );
  }

  /**
   * Get player stats with caching
   */
  async getPlayerStats(playerUuid: string): Promise<Record<string, number> | null> {
    const cacheKey = `${CACHE_CONFIG.KEYS.PLAYER_STATS}:${playerUuid}`;
    
    // Try cache first
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for player stats: ${playerUuid}`);
      return cached;
    }

    // Cache miss - fetch from database
    const stats = await this.fetchPlayerStatsFromDb(playerUuid);
    
    if (stats) {
      // Cache the result
      await cacheClient.set(cacheKey, stats, CACHE_CONFIG.PLAYER_STATS_TTL);
    }

    return stats;
  }

  /**
   * Get player profile with caching
   */
  async getPlayerProfile(playerUuid: string): Promise<any | null> {
    const cacheKey = `${CACHE_CONFIG.KEYS.PLAYER_PROFILE}:${playerUuid}`;
    
    // Try cache first
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for player profile: ${playerUuid}`);
      return cached;
    }

    // Cache miss - fetch from database
    const profile = await this.fetchPlayerProfileFromDb(playerUuid);
    
    if (profile) {
      // Cache the result
      await cacheClient.set(cacheKey, profile, CACHE_CONFIG.PLAYER_PROFILE_TTL);
    }

    return profile;
  }

  /**
   * Get leaderboard data with caching
   */
  async getLeaderboard(type: string, limit: number = 50): Promise<any[] | null> {
    const cacheKey = `${CACHE_CONFIG.KEYS.LEADERBOARD}:${type}:${limit}`;
    
    // Try cache first
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for leaderboard: ${type}`);
      return cached;
    }

    // Cache miss - fetch from database
    const leaderboard = await this.fetchLeaderboardFromDb(type, limit);
    
    if (leaderboard) {
      // Cache the result
      await cacheClient.set(cacheKey, leaderboard, CACHE_CONFIG.LEADERBOARD_TTL);
    }

    return leaderboard;
  }

  /**
   * Batch get player stats for multiple players
   */
  async getPlayerStatsBatch(playerUuids: string[]): Promise<Map<string, Record<string, number>>> {
    const results = new Map<string, Record<string, number>>();
    const uncachedUuids: string[] = [];

    // Check cache for each player
    for (const uuid of playerUuids) {
      const cached = await this.getPlayerStats(uuid);
      if (cached) {
        results.set(uuid, cached);
      } else {
        uncachedUuids.push(uuid);
      }
    }

    // Fetch uncached players in batches
    if (uncachedUuids.length > 0) {
      const batches = this.chunkArray(uncachedUuids, CACHE_CONFIG.BATCH_SIZE);
      
      for (const batch of batches) {
        const batchResults = await this.fetchPlayerStatsBatchFromDb(batch);
        batchResults.forEach((stats, uuid) => {
          results.set(uuid, stats);
        });
      }
    }

    return results;
  }

  /**
   * Update player stats and invalidate cache
   */
  async updatePlayerStats(playerUuid: string, stats: Record<string, number>): Promise<void> {
    // Update database
    await this.updatePlayerStatsInDb(playerUuid, stats);
    
    // Invalidate cache
    await this.invalidatePlayerCaches(playerUuid);
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    await cacheClient.clear();
    console.log('All caches cleared');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    memoryUsage: number;
    cacheSize: number;
    hitRate: number;
  }> {
    // This would be implemented based on your cache implementation
    return {
      memoryUsage: 0,
      cacheSize: 0,
      hitRate: 0,
    };
  }

  // Database fetch methods (implement these based on your existing services)
  private async fetchPlayerStatsFromDb(playerUuid: string): Promise<Record<string, number> | null> {
    // Implement using your existing comprehensive stats service
    const { getComprehensivePlayerStats } = await import('./comprehensiveStatsService');
    return await getComprehensivePlayerStats(playerUuid);
  }

  private async fetchPlayerProfileFromDb(playerUuid: string): Promise<any | null> {
    // Implement using your existing player profile service
    const { data, error } = await supabase
      .rpc('get_player_profile', { player_uuid_param: playerUuid });
    
    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  private async fetchLeaderboardFromDb(type: string, limit: number): Promise<any[] | null> {
    // Implement based on your leaderboard requirements
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) return null;
    return data;
  }

  private async fetchPlayerStatsBatchFromDb(playerUuids: string[]): Promise<Map<string, Record<string, number>>> {
    const results = new Map<string, Record<string, number>>();
    
    // Implement batch fetch using your existing services
    const { getComprehensivePlayerStats } = await import('./comprehensiveStatsService');
    
    const promises = playerUuids.map(async (uuid) => {
      const stats = await getComprehensivePlayerStats(uuid);
      return { uuid, stats };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ uuid, stats }) => {
      results.set(uuid, stats);
    });

    return results;
  }

  private async updatePlayerStatsInDb(playerUuid: string, stats: Record<string, number>): Promise<void> {
    const { error } = await supabase
      .from('player_stats')
      .upsert({
        player_uuid: playerUuid,
        stats: stats,
        last_updated: Math.floor(Date.now() / 1000)
      });

    if (error) {
      throw new Error(`Failed to update player stats: ${error.message}`);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export singleton instance
export const playerStatsCache = PlayerStatsCacheService.getInstance(); 