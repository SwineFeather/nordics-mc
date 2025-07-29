import { WikiCategory, WikiPage } from '@/types/wiki';
import { parseSummaryMd, generateSummaryMd } from '@/utils/summaryParser';
import { wikiCacheService } from './wikiCacheService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'SwineFeather';
const REPO_NAME = 'Nordics';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class EnhancedGitHubWikiService {
  private async getGitHubToken(): Promise<string> {
    console.log('🔑 Getting GitHub token...');
    try {
      const { data, error } = await supabase.functions.invoke('get-github-token');

      if (error || !data?.token) {
        console.error('❌ Error from edge function:', error);
        throw new Error('Failed to get GitHub token from edge function');
      }
      
      console.log('✅ GitHub token retrieved successfully');
      return data.token;
    } catch (error) {
      console.error('❌ Error getting GitHub token:', error);
      throw new Error('GitHub authentication failed');
    }
  }

  private async fetchFromGitHub(path: string, authenticated: boolean = true): Promise<any> {
    console.log(`🔍 Fetching from GitHub: ${path}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Nordics-Wiki-App'
    };

    if (authenticated) {
      try {
        const token = await this.getGitHubToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('❌ Failed to get token:', error);
        throw error;
      }
    }

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File not found: ${path}`);
        } else if (response.status === 401) {
          throw new Error('GitHub authentication failed');
        } else if (response.status === 403) {
          throw new Error('Access forbidden - check repository permissions');
        } else if (response.status === 429) {
          throw new Error('GitHub API rate limit exceeded');
        } else {
          throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Error fetching ${path}:`, error);
      throw error;
    }
  }

  private async updateFileOnGitHub(path: string, content: string, message: string, sha?: string): Promise<void> {
    console.log(`📝 Updating file on GitHub: ${path}`);
    
    try {
      const token = await this.getGitHubToken();
      
      const body: any = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        committer: {
          name: 'Nordics Wiki',
          email: 'wiki@nordics.dev'
        }
      };

      if (sha) {
        body.sha = sha;
      }

      const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Nordics-Wiki-App'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update ${path}: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Successfully updated ${path} on GitHub`);
    } catch (error) {
      console.error(`❌ Error updating ${path}:`, error);
      throw error;
    }
  }

  private decodeBase64Content(content: string): string {
    try {
      return atob(content.replace(/\n/g, ''));
    } catch (error) {
      console.error('❌ Error decoding base64 content:', error);
      throw new Error('Failed to decode file content from GitHub');
    }
  }

  // Main sync methods
  async syncFromGitHub(): Promise<SyncResult> {
    try {
      console.log('🔄 Starting sync from GitHub...');
      
      // Check if we have recent cache
      if (await wikiCacheService.isCacheRecent()) {
        console.log('✅ Using recent cache, skipping GitHub sync');
        return {
          success: true,
          message: 'Using recent cache data'
        };
      }

      // Fetch SUMMARY.md from GitHub
      console.log('📖 Fetching SUMMARY.md from GitHub...');
      const summaryFile = await this.fetchFromGitHub('SUMMARY.md');
      const summaryContent = this.decodeBase64Content(summaryFile.content);
      
      // Parse SUMMARY.md to get structure
      const summaryNodes = parseSummaryMd(summaryContent);
      console.log(`📚 Parsed ${summaryNodes.length} top-level nodes from SUMMARY.md`);

      // Fetch all pages mentioned in SUMMARY.md
      console.log('📄 Fetching pages from GitHub...');
      const pages: WikiPage[] = [];
      
      for (const node of summaryNodes) {
        if (node.type === 'page') {
          try {
            const pageContent = await this.fetchPageContent(node.slug);
            pages.push({
              id: node.slug,
              title: node.title,
              slug: node.slug,
              content: pageContent,
              status: 'published',
              authorId: '',
              authorName: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: node.parentId || '',
              order: node.order,
              githubPath: `${node.slug}.md`
            });
          } catch (error) {
            console.warn(`⚠️ Failed to fetch page ${node.slug}:`, error);
          }
        }
      }

      // Save to cache
      console.log('💾 Saving to local cache...');
      await wikiCacheService.setSummary(summaryContent);
      
      for (const page of pages) {
        await wikiCacheService.setPage(page);
      }

      // Update sync state
      await wikiCacheService.setSyncState({
        lastSyncAttempt: new Date().toISOString(),
        syncStatus: 'idle'
      });

      console.log(`✅ Sync completed: ${pages.length} pages cached`);
      return {
        success: true,
        message: `Successfully synced ${pages.length} pages from GitHub`,
        data: { pages, summaryNodes }
      };

    } catch (error) {
      console.error('❌ Sync from GitHub failed:', error);
      
      await wikiCacheService.setSyncState({
        lastSyncAttempt: new Date().toISOString(),
        syncStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to sync from GitHub',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncToGitHub(): Promise<SyncResult> {
    try {
      console.log('📤 Starting sync to GitHub...');
      
      await wikiCacheService.setSyncState({
        syncStatus: 'syncing'
      });

      // Get pending changes
      const syncState = await wikiCacheService.getSyncState();
      const pendingChanges = syncState.pendingChanges;

      if (pendingChanges.length === 0) {
        console.log('✅ No pending changes to sync');
        await wikiCacheService.setSyncState({
          syncStatus: 'idle'
        });
        return {
          success: true,
          message: 'No changes to sync'
        };
      }

      console.log(`📝 Syncing ${pendingChanges.length} pending changes...`);

      // Process each pending change
      let successCount = 0;
      let errorCount = 0;

      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'create':
            case 'update':
              if (change.data) {
                const page = change.data as WikiPage;
                await this.updateFileOnGitHub(
                  `${page.slug}.md`,
                  page.content,
                  `Update ${page.title} via web interface`
                );
                successCount++;
              }
              break;

            case 'delete':
              // Note: GitHub doesn't support file deletion via content API
              // We'll need to implement this differently if needed
              console.warn('⚠️ File deletion not implemented yet');
              break;
          }
        } catch (error) {
          console.error(`❌ Failed to sync change for ${change.slug}:`, error);
          errorCount++;
        }
      }

      // Clear pending changes if all were successful
      if (errorCount === 0) {
        await wikiCacheService.clearPendingChanges();
      }

      await wikiCacheService.setSyncState({
        lastSyncAttempt: new Date().toISOString(),
        syncStatus: 'idle'
      });

      const message = `Synced ${successCount} changes${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
      console.log(`✅ ${message}`);

      return {
        success: errorCount === 0,
        message,
        data: { successCount, errorCount }
      };

    } catch (error) {
      console.error('❌ Sync to GitHub failed:', error);
      
      await wikiCacheService.setSyncState({
        lastSyncAttempt: new Date().toISOString(),
        syncStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to sync to GitHub',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  private async fetchPageContent(slug: string): Promise<string> {
    try {
      const file = await this.fetchFromGitHub(`${slug}.md`);
      return this.decodeBase64Content(file.content);
    } catch (error) {
      console.error(`❌ Failed to fetch page content for ${slug}:`, error);
      return `# ${slug}\n\nContent could not be loaded from GitHub.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async checkRepoAccess(): Promise<boolean> {
    try {
      await this.fetchFromGitHub('', true);
      return true;
    } catch (error) {
      console.error('❌ Repository access check failed:', error);
      return false;
    }
  }

  async getCachedData(): Promise<{
    summary: string | null;
    pages: WikiPage[];
  }> {
    const summary = await wikiCacheService.getSummary();
    const pages = await wikiCacheService.getAllPages();
    
    return { summary, pages };
  }

  async hasCachedData(): Promise<boolean> {
    return await wikiCacheService.hasCachedData();
  }

  async clearCache(): Promise<void> {
    await wikiCacheService.clearCache();
  }

  async getCacheInfo(): Promise<{
    hasData: boolean;
    isRecent: boolean;
    size: any;
    lastSync: string | null;
  }> {
    const hasData = await wikiCacheService.hasCachedData();
    const isRecent = await wikiCacheService.isCacheRecent();
    const size = await wikiCacheService.getCacheSize();
    const lastSync = await wikiCacheService.getSummaryLastSync();
    
    return { hasData, isRecent, size, lastSync };
  }
}

// Export singleton instance
export const enhancedGitHubWikiService = new EnhancedGitHubWikiService(); 