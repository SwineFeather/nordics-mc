import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WikiCategory, WikiPage } from '@/types/wiki';

// IndexedDB Schema
interface WikiCacheDB extends DBSchema {
  summary: {
    key: string;
    value: {
      content: string;
      lastSync: string;
      version: string;
    };
  };
  pages: {
    key: string; // slug
    value: {
      content: string;
      metadata: {
        title: string;
        slug: string;
        categoryId?: string;
        order: number;
        lastModified: string;
        hash: string;
      };
    };
  };
  assets: {
    key: string; // path
    value: {
      data: Blob;
      type: string;
      lastModified: string;
    };
  };
  sync: {
    key: string;
    value: {
      pendingChanges: Array<{
        type: 'create' | 'update' | 'delete';
        slug: string;
        data?: any;
        timestamp: string;
      }>;
      lastSyncAttempt: string;
      syncStatus: 'idle' | 'syncing' | 'error';
      lastError?: string;
    };
  };
}

export class WikiCacheService {
  private db: IDBPDatabase<WikiCacheDB> | null = null;
  private readonly DB_NAME = 'wiki-cache';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<WikiCacheDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('summary')) {
            db.createObjectStore('summary');
          }
          if (!db.objectStoreNames.contains('pages')) {
            db.createObjectStore('pages');
          }
          if (!db.objectStoreNames.contains('assets')) {
            db.createObjectStore('assets');
          }
          if (!db.objectStoreNames.contains('sync')) {
            db.createObjectStore('sync');
          }
        },
      });
      console.log('✅ Wiki cache database initialized');
    } catch (error) {
      console.error('❌ Failed to initialize wiki cache:', error);
      throw new Error('Failed to initialize local cache');
    }
  }

  // Summary operations
  async getSummary(): Promise<string | null> {
    await this.init();
    const summary = await this.db!.get('summary', 'current');
    return summary?.content || null;
  }

  async setSummary(content: string): Promise<void> {
    await this.init();
    await this.db!.put('summary', {
      content,
      lastSync: new Date().toISOString(),
      version: '1.0'
    }, 'current');
  }

  async getSummaryLastSync(): Promise<string | null> {
    await this.init();
    const summary = await this.db!.get('summary', 'current');
    return summary?.lastSync || null;
  }

  // Page operations
  async getPage(slug: string): Promise<WikiPage | null> {
    await this.init();
    const cached = await this.db!.get('pages', slug);
    if (!cached) return null;

    return {
      id: slug, // Use slug as ID for cached pages
      title: cached.metadata.title,
      slug: cached.metadata.slug,
      content: cached.content,
      status: 'published' as const,
      authorId: '',
      authorName: 'System',
      createdAt: cached.metadata.lastModified,
      updatedAt: cached.metadata.lastModified,
      category: '',
      order: cached.metadata.order,
      githubPath: `${slug}.md`
    };
  }

  async setPage(page: WikiPage): Promise<void> {
    await this.init();
    const hash = await this.generateHash(page.content);
    
    await this.db!.put('pages', {
      content: page.content,
      metadata: {
        title: page.title,
        slug: page.slug,
        categoryId: page.category,
        order: page.order,
        lastModified: new Date().toISOString(),
        hash
      }
    }, page.slug);
  }

  async getAllPages(): Promise<WikiPage[]> {
    await this.init();
    const pages = await this.db!.getAll('pages');
    return pages.map(cached => ({
      id: cached.metadata.slug,
      title: cached.metadata.title,
      slug: cached.metadata.slug,
      content: cached.content,
      status: 'published' as const,
      authorId: '',
      authorName: 'System',
      createdAt: cached.metadata.lastModified,
      updatedAt: cached.metadata.lastModified,
      category: cached.metadata.categoryId || '',
      order: cached.metadata.order,
      githubPath: `${cached.metadata.slug}.md`
    }));
  }

  async deletePage(slug: string): Promise<void> {
    await this.init();
    await this.db!.delete('pages', slug);
  }

  async pageExists(slug: string): Promise<boolean> {
    await this.init();
    const page = await this.db!.get('pages', slug);
    return !!page;
  }

  async getPageHash(slug: string): Promise<string | null> {
    await this.init();
    const page = await this.db!.get('pages', slug);
    return page?.metadata.hash || null;
  }

  // Asset operations
  async getAsset(path: string): Promise<Blob | null> {
    await this.init();
    const asset = await this.db!.get('assets', path);
    return asset?.data || null;
  }

  async setAsset(path: string, data: Blob, type: string): Promise<void> {
    await this.init();
    await this.db!.put('assets', {
      data,
      type,
      lastModified: new Date().toISOString()
    }, path);
  }

  // Sync operations
  async getSyncState(): Promise<{
    pendingChanges: Array<any>;
    lastSyncAttempt: string | null;
    syncStatus: 'idle' | 'syncing' | 'error';
    lastError?: string;
  }> {
    await this.init();
    const sync = await this.db!.get('sync', 'state');
    return {
      pendingChanges: sync?.pendingChanges || [],
      lastSyncAttempt: sync?.lastSyncAttempt || null,
      syncStatus: sync?.syncStatus || 'idle',
      lastError: sync?.lastError
    };
  }

  async setSyncState(state: {
    pendingChanges?: Array<any>;
    lastSyncAttempt?: string;
    syncStatus?: 'idle' | 'syncing' | 'error';
    lastError?: string;
  }): Promise<void> {
    await this.init();
    const current = await this.getSyncState();
    await this.db!.put('sync', {
      ...current,
      ...state
    }, 'state');
  }

  async addPendingChange(change: {
    type: 'create' | 'update' | 'delete';
    slug: string;
    data?: any;
  }): Promise<void> {
    await this.init();
    const current = await this.getSyncState();
    const newChange = {
      ...change,
      timestamp: new Date().toISOString()
    };
    
    await this.setSyncState({
      pendingChanges: [...current.pendingChanges, newChange]
    });
  }

  async clearPendingChanges(): Promise<void> {
    await this.init();
    const current = await this.getSyncState();
    await this.setSyncState({
      ...current,
      pendingChanges: []
    });
  }

  // Utility methods
  private async generateHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async clearCache(): Promise<void> {
    await this.init();
    await this.db!.clear('summary');
    await this.db!.clear('pages');
    await this.db!.clear('assets');
    await this.db!.clear('sync');
    console.log('✅ Wiki cache cleared');
  }

  async getCacheSize(): Promise<{
    summary: number;
    pages: number;
    assets: number;
    sync: number;
  }> {
    await this.init();
    const summary = await this.db!.count('summary');
    const pages = await this.db!.count('pages');
    const assets = await this.db!.count('assets');
    const sync = await this.db!.count('sync');
    
    return { summary, pages, assets, sync };
  }

  // Check if cache is recent (within 5 minutes)
  async isCacheRecent(): Promise<boolean> {
    const lastSync = await this.getSummaryLastSync();
    if (!lastSync) return false;
    
    const lastSyncTime = new Date(lastSync);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return lastSyncTime > fiveMinutesAgo;
  }

  // Check if we have any cached data
  async hasCachedData(): Promise<boolean> {
    const summary = await this.getSummary();
    const pages = await this.getAllPages();
    return !!(summary && pages.length > 0);
  }
}

// Export singleton instance
export const wikiCacheService = new WikiCacheService(); 