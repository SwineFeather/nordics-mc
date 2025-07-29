import { WikiCategory } from '@/types/wiki';

const DB_NAME = 'NordicsWikiCache';
const DB_VERSION = 1;
const STORE_NAME = 'wikiData';

interface CacheEntry {
  id: string;
  data: WikiCategory[];
  timestamp: number;
  expiresAt: number;
}

class LocalCacheService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(new Error('Failed to initialize local cache'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ Local cache initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 Created IndexedDB store for wiki cache');
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  async setWikiData(data: WikiCategory[]): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const entry: CacheEntry = {
        id: 'wiki-data',
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      const request = store.put(entry);

      request.onsuccess = () => {
        console.log('📦 Wiki data cached successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to cache wiki data:', request.error);
        reject(new Error('Failed to save to local cache'));
      };
    });
  }

  async getWikiData(): Promise<WikiCategory[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('wiki-data');

      request.onsuccess = () => {
        const entry: CacheEntry | undefined = request.result;
        
        if (!entry) {
          reject(new Error('No cached data found'));
          return;
        }

        // Check if cache is expired
        if (Date.now() > entry.expiresAt) {
          console.log('📦 Cache expired, removing old data');
          this.clearWikiData();
          reject(new Error('Cache expired'));
          return;
        }

        console.log('📦 Retrieved wiki data from cache');
        resolve(entry.data);
      };

      request.onerror = () => {
        console.error('❌ Failed to retrieve cached data:', request.error);
        reject(new Error('Failed to read from local cache'));
      };
    });
  }

  async clearWikiData(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('wiki-data');

      request.onsuccess = () => {
        console.log('📦 Wiki cache cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear cache:', request.error);
        reject(new Error('Failed to clear local cache'));
      };
    });
  }

  async hasCachedData(): Promise<boolean> {
    try {
      await this.getWikiData();
      return true;
    } catch {
      return false;
    }
  }

  async getCacheInfo(): Promise<{
    hasData: boolean;
    lastSync: Date | null;
    size: number;
    isExpired: boolean;
  }> {
    try {
      const data = await this.getWikiData();
      return {
        hasData: data.length > 0,
        lastSync: new Date(),
        size: data.length,
        isExpired: false
      };
    } catch (error) {
      return {
        hasData: false,
        lastSync: null,
        size: 0,
        isExpired: true
      };
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('📦 Local cache closed');
    }
  }
}

export const localCacheService = new LocalCacheService(); 