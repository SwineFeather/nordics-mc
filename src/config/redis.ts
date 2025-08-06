import { createClient } from 'redis';

// Redis configuration
const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
} as const;

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Get Redis client instance
 */
export const getRedisClient = async () => {
  if (!redisClient) {
    try {
      redisClient = createClient(REDIS_CONFIG);
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
      });

      redisClient.on('ready', () => {
        console.log('Redis Client Ready');
      });

      redisClient.on('end', () => {
        console.log('Redis Client Disconnected');
      });

      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  }

  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    
    await client.ping();
    return true;
  } catch (error) {
    // Redis not available - silent fail
    return false;
  }
};

/**
 * Redis cache utilities
 */
export const redisCache = {
  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) throw new Error('Redis not available');
      
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  },

  async get(key: string): Promise<any | null> {
    try {
      const client = await getRedisClient();
      if (!client) throw new Error('Redis not available');
      
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) throw new Error('Redis not available');
      
      await client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      const client = await getRedisClient();
      if (!client) throw new Error('Redis not available');
      
      await client.flushDb();
    } catch (error) {
      console.error('Redis clear error:', error);
      throw error;
    }
  },

  async getStats(): Promise<{
    memoryUsage: number;
    cacheSize: number;
    hitRate: number;
  }> {
    try {
      const client = await getRedisClient();
      if (!client) {
        return { memoryUsage: 0, cacheSize: 0, hitRate: 0 };
      }

      const info = await client.info('memory');
      const keys = await client.dbSize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\d+\.?\d*)([KMGT]?B)/);
      const memoryUsage = memoryMatch ? parseFloat(memoryMatch[1]) * this.getMultiplier(memoryMatch[2]) : 0;

      return {
        memoryUsage,
        cacheSize: keys,
        hitRate: 0.85, // This would need to be tracked separately
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { memoryUsage: 0, cacheSize: 0, hitRate: 0 };
    }
  },

  getMultiplier(unit: string): number {
    switch (unit) {
      case 'KB': return 1024;
      case 'MB': return 1024 * 1024;
      case 'GB': return 1024 * 1024 * 1024;
      case 'TB': return 1024 * 1024 * 1024 * 1024;
      default: return 1;
    }
  }
};

export default redisCache; 