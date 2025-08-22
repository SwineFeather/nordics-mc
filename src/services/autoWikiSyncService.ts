import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WikiSyncStatus {
  entity_type: string;
  total_count: number;
  pages_exist: number;
  missing_pages: number;
}

export interface WikiSyncResult {
  towns: { total: number; created: number; errors: number };
  nations: { total: number; created: number; errors: number };
  errors: string[];
}

export class AutoWikiSyncService {
  /**
   * Check the status of wiki pages for all towns and nations
   */
  static async checkWikiPagesStatus(): Promise<WikiSyncStatus[]> {
    try {
      // Get towns and nations
      const { data: towns } = await supabase.from('towns').select('name');
      const { data: nations } = await supabase.from('nations').select('name');
      
                // Check which pages exist in storage
          const { data: storageFiles } = await supabase.storage
            .from('wiki')
            .list('Nordics/towns');
          
          const { data: nationFiles } = await supabase.storage
            .from('wiki')
            .list('Nordics/nations');
      
      const townsList = towns || [];
      const nationsList = nations || [];
      const townFiles = storageFiles || [];
      const nationStorageFiles = nationFiles || [];
      
      const townsWithPages = townsList.filter(town => 
        townFiles.some(file => file.name === `${town.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`)
      ).length;
      
      const nationsWithPages = nationsList.filter(nation => 
        nationStorageFiles.some(file => file.name === `${nation.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`)
      ).length;
      
      return [
        {
          entity_type: 'towns',
          total_count: townsList.length,
          pages_exist: townsWithPages,
          missing_pages: townsList.length - townsWithPages
        },
        {
          entity_type: 'nations',
          total_count: nationsList.length,
          pages_exist: nationsWithPages,
          missing_pages: nationsList.length - nationsWithPages
        }
      ];
    } catch (error) {
      console.error('Error checking wiki pages status:', error);
      throw error;
    }
  }

  /**
   * Manually sync all existing towns and nations to wiki pages
   */
  static async syncAllWikiPages(): Promise<WikiSyncResult> {
    try {
      toast.info('🔄 Starting wiki pages sync...');

      // Call the edge function directly to create the pages
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-all-wiki-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', errorData);
        toast.error('❌ Failed to create wiki pages');
        throw new Error(errorData.error || 'Failed to create wiki pages');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Wiki pages sync completed! Created ${result.results.towns.created} towns and ${result.results.nations.created} nations`);
      } else {
        toast.error('❌ Wiki pages sync failed');
      }

      return result.results;
    } catch (error) {
      console.error('Error syncing wiki pages:', error);
      toast.error('❌ Failed to sync wiki pages');
      throw error;
    }
  }

  /**
   * Create a single wiki page for a town or nation
   */
  static async createSingleWikiPage(entityType: 'town' | 'nation', entityId: string, entityName: string): Promise<void> {
    try {
      toast.info(`🔄 Creating wiki page for ${entityType}: ${entityName}`);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-wiki-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', errorData);
        toast.error(`❌ Failed to create wiki page for ${entityName}`);
        throw new Error(errorData.error || `Failed to create wiki page for ${entityName}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Wiki page created for ${entityName}`);
      } else {
        toast.error(`❌ Failed to create wiki page for ${entityName}`);
      }
    } catch (error) {
      console.error(`Error creating wiki page for ${entityName}:`, error);
      toast.error(`❌ Failed to create wiki page for ${entityName}`);
      throw error;
    }
  }

  /**
   * Get a summary of the current wiki pages status
   */
  static async getWikiPagesSummary(): Promise<{
    totalTowns: number;
    totalNations: number;
    townsWithPages: number;
    nationsWithPages: number;
    missingTownPages: number;
    missingNationPages: number;
  }> {
    try {
      const status = await this.checkWikiPagesStatus();
      
      const townsStatus = status.find(s => s.entity_type === 'towns');
      const nationsStatus = status.find(s => s.entity_type === 'nations');

      return {
        totalTowns: townsStatus?.total_count || 0,
        totalNations: nationsStatus?.total_count || 0,
        townsWithPages: townsStatus?.pages_exist || 0,
        nationsWithPages: nationsStatus?.pages_exist || 0,
        missingTownPages: townsStatus?.missing_pages || 0,
        missingNationPages: nationsStatus?.missing_pages || 0
      };
    } catch (error) {
      console.error('Error getting wiki pages summary:', error);
      return {
        totalTowns: 0,
        totalNations: 0,
        townsWithPages: 0,
        nationsWithPages: 0,
        missingTownPages: 0,
        missingNationPages: 0
      };
    }
  }

  /**
   * Check if automatic wiki page creation is enabled
   */
  static async isAutoWikiEnabled(): Promise<boolean> {
    try {
      // Check if we can access the towns and nations tables
      const { data: towns } = await supabase.from('towns').select('name').limit(1);
      const { data: nations } = await supabase.from('nations').select('name').limit(1);
      
      // If we can access both tables, the system is set up
      return true;
    } catch (error) {
      console.error('Error checking auto wiki status:', error);
      return false;
    }
  }

  /**
   * Get recent wiki page creation activity
   */
  static async getRecentWikiActivity(): Promise<{
    recentTowns: any[];
    recentNations: any[];
  }> {
    try {
      // Get recently created towns (last 7 days)
      const { data: recentTowns } = await supabase
        .from('towns')
        .select('name, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recently created nations (last 7 days)
      const { data: recentNations } = await supabase
        .from('nations')
        .select('name, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        recentTowns: recentTowns || [],
        recentNations: recentNations || []
      };
    } catch (error) {
      console.error('Error getting recent wiki activity:', error);
      return {
        recentTowns: [],
        recentNations: []
      };
    }
  }
} 