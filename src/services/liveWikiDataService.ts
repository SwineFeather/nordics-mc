import { supabase } from '@/integrations/supabase/client';

export interface LiveWikiData {
  content: string;
  lastUpdated: string;
  entityData: any;
}

export class LiveWikiDataService {
  /**
   * Fetch live data for a town or nation wiki page
   */
  static async getLiveWikiData(entityType: 'town' | 'nation', entityName: string): Promise<LiveWikiData> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-live-wiki-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          entity_type: entityType,
          entity_name: entityName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch live data');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching live wiki data:', error);
      throw error;
    }
  }

  /**
   * Check if a wiki page should use live data
   */
  static shouldUseLiveData(pagePath: string): boolean {
    // Check if this is a town or nation page
    return pagePath.includes('/towns/') || pagePath.includes('/nations/') || pagePath.includes('/Nordics/towns/') || pagePath.includes('/Nordics/nations/');
  }

  /**
   * Extract entity type and name from a wiki page path
   */
  static extractEntityInfo(pagePath: string): { entityType: 'town' | 'nation' | null; entityName: string | null } {
    const pathParts = pagePath.split('/');
    
    if (pathParts.includes('towns') && pathParts.length > 0) {
      const fileName = pathParts[pathParts.length - 1];
      const entityName = fileName.replace('.md', '').replace(/_/g, ' ');
      return { entityType: 'town', entityName };
    }
    
    if (pathParts.includes('nations') && pathParts.length > 0) {
      const fileName = pathParts[pathParts.length - 1];
      const entityName = fileName.replace('.md', '').replace(/_/g, ' ');
      return { entityType: 'nation', entityName };
    }
    
    return { entityType: null, entityName: null };
  }

  /**
   * Get live content for a wiki page
   */
  static async getLiveContent(pagePath: string): Promise<string | null> {
    try {
      if (!this.shouldUseLiveData(pagePath)) {
        return null; // Not a live data page
      }

      const { entityType, entityName } = this.extractEntityInfo(pagePath);
      
      if (!entityType || !entityName) {
        return null; // Could not extract entity info
      }

      const liveData = await this.getLiveWikiData(entityType, entityName);
      return liveData.content;
    } catch (error) {
      console.error('Error getting live content:', error);
      return null; // Fall back to static content
    }
  }
} 