import { githubWikiService } from './githubWikiService';
import { localCacheService } from './localCacheService';
import { toast } from 'sonner';
import { WikiCategory } from '@/types/wiki';

export interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  syncInterval: number; // in minutes
  errorCount: number;
  lastError: string | null;
  syncHistory: SyncEvent[];
}

export interface SyncEvent {
  timestamp: Date;
  type: 'success' | 'error' | 'conflict' | 'warning';
  message: string;
  details?: any;
}

export interface ConflictResolution {
  strategy: 'local-wins' | 'remote-wins' | 'manual' | 'merge';
  resolvedItems: string[];
  conflicts: ConflictItem[];
}

export interface ConflictItem {
  id: string;
  type: 'page' | 'category';
  localVersion: any;
  remoteVersion: any;
  conflictType: 'content' | 'metadata' | 'structure';
  resolution?: 'local' | 'remote' | 'merged';
}

class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private status: SyncStatus = {
    isRunning: false,
    lastSync: null,
    nextSync: null,
    syncInterval: 30, // 30 minutes default
    errorCount: 0,
    lastError: null,
    syncHistory: []
  };

  private conflictResolutions: Map<string, ConflictResolution> = new Map();

  // Start background sync
  public async startBackgroundSync(intervalMinutes: number = 30): Promise<void> {
    try {
      console.log('🔄 Starting background sync service...');
      
      this.status.syncInterval = intervalMinutes;
      this.status.isRunning = true;
      
      // Perform initial sync
      await this.performSync();
      
      // Set up interval
      this.syncInterval = setInterval(async () => {
        await this.performSync();
      }, intervalMinutes * 60 * 1000);
      
      this.status.nextSync = new Date(Date.now() + intervalMinutes * 60 * 1000);
      
      console.log(`✅ Background sync started with ${intervalMinutes} minute interval`);
      this.addSyncEvent('success', 'Background sync service started');
      
    } catch (error) {
      console.error('❌ Failed to start background sync:', error);
      this.addSyncEvent('error', 'Failed to start background sync', error);
      throw error;
    }
  }

  // Stop background sync
  public stopBackgroundSync(): void {
    console.log('🛑 Stopping background sync service...');
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.status.isRunning = false;
    this.status.nextSync = null;
    
    this.addSyncEvent('success', 'Background sync service stopped');
    console.log('✅ Background sync stopped');
  }

  // Perform a single sync operation
  public async performSync(): Promise<void> {
    if (this.status.isRunning) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    try {
      console.log('🔄 Starting sync operation...');
      this.status.isRunning = true;
      
      // Check for conflicts first
      const conflicts = await this.detectConflicts();
      
      if (conflicts.length > 0) {
        console.log(`⚠️ Found ${conflicts.length} conflicts, resolving...`);
        await this.resolveConflicts(conflicts);
      }
      
      // Sync from GitHub to local cache
      await this.syncFromGitHub();
      
      // Sync local changes to GitHub (if any)
      await this.syncToGitHub();
      
      this.status.lastSync = new Date();
      this.status.errorCount = 0;
      this.status.lastError = null;
      this.status.nextSync = new Date(Date.now() + this.status.syncInterval * 60 * 1000);
      
      this.addSyncEvent('success', 'Sync completed successfully');
      console.log('✅ Sync operation completed');
      
    } catch (error) {
      console.error('❌ Sync operation failed:', error);
      this.status.errorCount++;
      this.status.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.addSyncEvent('error', 'Sync operation failed', error);
      
      // Show toast notification for errors
      toast.error(`Sync failed: ${this.status.lastError}`);
      
    } finally {
      this.status.isRunning = false;
    }
  }

  // Detect conflicts between local cache and GitHub
  private async detectConflicts(): Promise<ConflictItem[]> {
    const conflicts: ConflictItem[] = [];
    
    try {
      // Get local cache data
      const localData = await localCacheService.getWikiData();
      
      // Get GitHub data
      const githubData = await githubWikiService.syncFromGitHub();
      
      // Compare categories
      for (const localCategory of localData) {
        const remoteCategory = githubData.find(c => c.id === localCategory.id);
        
        if (remoteCategory) {
          // Check for metadata conflicts using lastEditedAt if available
          const localTime = localCategory.lastEditedAt || localCategory.id;
          const remoteTime = remoteCategory.lastEditedAt || remoteCategory.id;
          
          if (localTime !== remoteTime) {
            conflicts.push({
              id: localCategory.id,
              type: 'category',
              localVersion: localCategory,
              remoteVersion: remoteCategory,
              conflictType: 'metadata'
            });
          }
        }
      }
      
      // Compare pages within categories
      for (const localCategory of localData) {
        const remoteCategory = githubData.find(c => c.id === localCategory.id);
        
        if (remoteCategory) {
          for (const localPage of localCategory.pages || []) {
            const remotePage = remoteCategory.pages?.find(p => p.id === localPage.id);
            
            if (remotePage && localPage.updatedAt !== remotePage.updatedAt) {
              conflicts.push({
                id: localPage.id,
                type: 'page',
                localVersion: localPage,
                remoteVersion: remotePage,
                conflictType: 'content'
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error detecting conflicts:', error);
      this.addSyncEvent('error', 'Failed to detect conflicts', error);
    }
    
    return conflicts;
  }

  // Resolve conflicts using configured strategies
  private async resolveConflicts(conflicts: ConflictItem[]): Promise<void> {
    try {
      console.log(`🔧 Resolving ${conflicts.length} conflicts...`);
      
      for (const conflict of conflicts) {
        const resolution = this.getConflictResolution(conflict.id);
        
        switch (resolution.strategy) {
          case 'local-wins':
            await this.resolveLocalWins(conflict);
            break;
          case 'remote-wins':
            await this.resolveRemoteWins(conflict);
            break;
          case 'merge':
            await this.resolveMerge(conflict);
            break;
          case 'manual':
            // Mark for manual resolution
            this.addSyncEvent('warning', `Manual resolution required for ${conflict.id}`);
            break;
        }
      }
      
      this.addSyncEvent('success', `Resolved ${conflicts.length} conflicts`);
      
    } catch (error) {
      console.error('❌ Error resolving conflicts:', error);
      this.addSyncEvent('error', 'Failed to resolve conflicts', error);
      throw error;
    }
  }

  // Resolve conflict by keeping local version
  private async resolveLocalWins(conflict: ConflictItem): Promise<void> {
    try {
      if (conflict.type === 'page') {
        await githubWikiService.updatePage(conflict.id, conflict.localVersion);
      } else {
        await githubWikiService.updateCategory(conflict.id, conflict.localVersion);
      }
      
      conflict.resolution = 'local';
      console.log(`✅ Resolved conflict for ${conflict.id} (local wins)`);
      
    } catch (error) {
      console.error(`❌ Error resolving local wins for ${conflict.id}:`, error);
      throw error;
    }
  }

  // Resolve conflict by keeping remote version
  private async resolveRemoteWins(conflict: ConflictItem): Promise<void> {
    try {
      // For remote wins, we need to update the local cache
      // Since localCacheService doesn't have update methods, we'll refresh from GitHub
      await localCacheService.clearWikiData();
      const githubData = await githubWikiService.syncFromGitHub();
      await localCacheService.setWikiData(githubData);
      
      conflict.resolution = 'remote';
      console.log(`✅ Resolved conflict for ${conflict.id} (remote wins)`);
      
    } catch (error) {
      console.error(`❌ Error resolving remote wins for ${conflict.id}:`, error);
      throw error;
    }
  }

  // Resolve conflict by merging changes
  private async resolveMerge(conflict: ConflictItem): Promise<void> {
    try {
      if (conflict.type === 'page') {
        const mergedPage = this.mergePageContent(conflict.localVersion, conflict.remoteVersion);
        await githubWikiService.updatePage(conflict.id, mergedPage);
      } else {
        const mergedCategory = this.mergeCategoryContent(conflict.localVersion, conflict.remoteVersion);
        await githubWikiService.updateCategory(conflict.id, mergedCategory);
      }
      
      // Refresh local cache after merge
      await localCacheService.clearWikiData();
      const githubData = await githubWikiService.syncFromGitHub();
      await localCacheService.setWikiData(githubData);
      
      conflict.resolution = 'merged';
      console.log(`✅ Resolved conflict for ${conflict.id} (merged)`);
      
    } catch (error) {
      console.error(`❌ Error merging conflict for ${conflict.id}:`, error);
      throw error;
    }
  }

  // Merge page content intelligently
  private mergePageContent(local: any, remote: any): any {
    // Simple merge strategy - take the most recent content
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    
    if (localTime > remoteTime) {
      return { ...local, updatedAt: new Date().toISOString() };
    } else {
      return { ...remote, updatedAt: new Date().toISOString() };
    }
  }

  // Merge category content intelligently
  private mergeCategoryContent(local: any, remote: any): any {
    // Merge children and pages arrays
    const mergedChildren = [...new Set([...(local.children || []), ...(remote.children || [])])];
    const mergedPages = [...new Set([...(local.pages || []), ...(remote.pages || [])])];
    
    return {
      ...local,
      children: mergedChildren,
      pages: mergedPages,
      updatedAt: new Date().toISOString()
    };
  }

  // Sync data from GitHub to local cache
  private async syncFromGitHub(): Promise<void> {
    try {
      console.log('⬇️ Syncing from GitHub to local cache...');
      
      const githubData = await githubWikiService.syncFromGitHub();
      
      // Update local cache with GitHub data
      await localCacheService.clearWikiData();
      await localCacheService.setWikiData(githubData);
      
      console.log('✅ GitHub to local sync completed');
      
    } catch (error) {
      console.error('❌ Error syncing from GitHub:', error);
      throw error;
    }
  }

  // Sync local changes to GitHub
  private async syncToGitHub(): Promise<void> {
    try {
      console.log('⬆️ Syncing local changes to GitHub...');
      
      const localData = await localCacheService.getWikiData();
      const githubData = await githubWikiService.syncFromGitHub();
      
      // Find local changes that need to be synced
      const localChanges = this.findLocalChanges(localData, githubData);
      
      if (localChanges.length > 0) {
        console.log(`📤 Syncing ${localChanges.length} local changes to GitHub...`);
        
        for (const change of localChanges) {
          if (change.type === 'page') {
            await githubWikiService.updatePage(change.data.id, change.data);
          } else {
            await githubWikiService.updateCategory(change.data.id, change.data);
          }
        }
        
        console.log('✅ Local to GitHub sync completed');
      } else {
        console.log('✅ No local changes to sync');
      }
      
    } catch (error) {
      console.error('❌ Error syncing to GitHub:', error);
      throw error;
    }
  }

  // Find local changes that differ from GitHub
  private findLocalChanges(localData: WikiCategory[], githubData: WikiCategory[]): Array<{ type: 'page' | 'category', data: any }> {
    const changes: Array<{ type: 'page' | 'category', data: any }> = [];
    
    // Check for category changes
    for (const localCategory of localData) {
      const githubCategory = githubData.find(c => c.id === localCategory.id);
      
      if (!githubCategory || localCategory.lastEditedAt !== githubCategory.lastEditedAt) {
        changes.push({ type: 'category', data: localCategory });
      }
      
      // Check for page changes within categories
      for (const localPage of localCategory.pages || []) {
        const githubPage = githubCategory?.pages?.find(p => p.id === localPage.id);
        
        if (!githubPage || localPage.updatedAt !== githubPage.updatedAt) {
          changes.push({ type: 'page', data: localPage });
        }
      }
    }
    
    return changes;
  }

  // Get conflict resolution strategy for an item
  private getConflictResolution(itemId: string): ConflictResolution {
    if (!this.conflictResolutions.has(itemId)) {
      // Default strategy
      this.conflictResolutions.set(itemId, {
        strategy: 'remote-wins',
        resolvedItems: [],
        conflicts: []
      });
    }
    
    return this.conflictResolutions.get(itemId)!;
  }

  // Set conflict resolution strategy for an item
  public setConflictResolution(itemId: string, strategy: ConflictResolution['strategy']): void {
    const resolution = this.getConflictResolution(itemId);
    resolution.strategy = strategy;
    this.conflictResolutions.set(itemId, resolution);
  }

  // Add sync event to history
  private addSyncEvent(type: SyncEvent['type'], message: string, details?: any): void {
    const event: SyncEvent = {
      timestamp: new Date(),
      type,
      message,
      details
    };
    
    this.status.syncHistory.unshift(event);
    
    // Keep only last 50 events
    if (this.status.syncHistory.length > 50) {
      this.status.syncHistory = this.status.syncHistory.slice(0, 50);
    }
  }

  // Get current sync status
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Force immediate sync
  public async forceSync(): Promise<void> {
    console.log('🚀 Force sync requested...');
    await this.performSync();
  }

  // Update sync interval
  public updateSyncInterval(minutes: number): void {
    console.log(`⏰ Updating sync interval to ${minutes} minutes...`);
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.status.syncInterval = minutes;
    
    if (this.status.isRunning) {
      this.syncInterval = setInterval(async () => {
        await this.performSync();
      }, minutes * 60 * 1000);
      
      this.status.nextSync = new Date(Date.now() + minutes * 60 * 1000);
    }
    
    this.addSyncEvent('success', `Sync interval updated to ${minutes} minutes`);
  }

  // Get sync statistics
  public getSyncStats(): {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageSyncTime: number;
    lastSyncDuration: number;
  } {
    const events = this.status.syncHistory;
    const totalSyncs = events.filter(e => e.message.includes('Sync completed')).length;
    const successfulSyncs = events.filter(e => e.type === 'success' && e.message.includes('Sync completed')).length;
    const failedSyncs = events.filter(e => e.type === 'error' && e.message.includes('Sync')).length;
    
    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageSyncTime: 0, // TODO: Implement timing tracking
      lastSyncDuration: 0 // TODO: Implement timing tracking
    };
  }
}

export const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService; 