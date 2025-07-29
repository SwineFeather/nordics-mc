import { supabase } from '@/integrations/supabase/client';
import { enhancedGitHubWikiService } from './enhancedGitHubWikiService';
import { wikiCacheService } from './wikiCacheService';
import { generateSummaryMd } from '@/utils/summaryParser';
import { toast } from 'sonner';

interface Nation {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  capital: string;
  leader: string;
  population: number;
  bank: string;
  daily_upkeep: string;
  founded: string;
  lore: string;
  government: string;
  motto: string;
  specialties: string[];
  history?: string;
}

interface Town {
  id: string;
  name: string;
  mayor: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
}

interface NationWithTowns extends Nation {
  towns: Town[];
}

export class EnhancedAutoWikiService {
  // Create a nation page and sync to GitHub
  private async createNationPage(nation: NationWithTowns): Promise<void> {
    try {
      const slug = `nation-${nation.name.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`🔍 Checking if nation page for ${nation.name} exists...`);
      
      // Check if page exists in cache
      if (await wikiCacheService.pageExists(slug)) {
        console.log(`✅ Nation page for ${nation.name} already exists in cache`);
        return;
      }

      console.log(`🔨 Creating nation page for ${nation.name}...`);
      const content = this.generateNationContent(nation);
      
      // Create page in cache
      const page = {
        id: slug,
        title: nation.name,
        slug,
        content,
        status: 'published' as const,
        authorId: '',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'nations',
        order: 0,
        githubPath: `${slug}.md`
      };

      await wikiCacheService.setPage(page);
      
      // Add to pending changes for GitHub sync
      await wikiCacheService.addPendingChange({
        type: 'create',
        slug,
        data: page
      });

      console.log(`✅ Created nation page for ${nation.name} in cache`);
    } catch (error) {
      console.error(`❌ Failed to create nation page for ${nation.name}:`, error);
      throw error;
    }
  }

  // Create a town page and sync to GitHub
  private async createTownPage(town: Town): Promise<void> {
    try {
      const slug = `town-${town.name.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`🔍 Checking if town page for ${town.name} exists...`);
      
      // Check if page exists in cache
      if (await wikiCacheService.pageExists(slug)) {
        console.log(`✅ Town page for ${town.name} already exists in cache`);
        return;
      }

      console.log(`🔨 Creating town page for ${town.name}...`);
      const content = await this.generateTownContent(town);
      
      // Create page in cache
      const page = {
        id: slug,
        title: town.name,
        slug,
        content,
        status: 'published' as const,
        authorId: '',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'towns',
        order: 0,
        githubPath: `${slug}.md`
      };

      await wikiCacheService.setPage(page);
      
      // Add to pending changes for GitHub sync
      await wikiCacheService.addPendingChange({
        type: 'create',
        slug,
        data: page
      });

      console.log(`✅ Created town page for ${town.name} in cache`);
    } catch (error) {
      console.error(`❌ Failed to create town page for ${town.name}:`, error);
      throw error;
    }
  }

  // Generate nation page content
  private generateNationContent(nation: NationWithTowns): string {
    const townsList = (nation.towns || []).map(town => 
      `- [${town.name}](/wiki/town-${town.name.toLowerCase().replace(/\s+/g, '-')}) - ${town.type} (${town.population} residents)`
    ).join('\n');

    return `# ${nation.name}

**Type:** ${nation.type || 'Unknown'}  
**Capital:** ${nation.capital || 'Unknown'}  
**Leader:** ${nation.leader || 'Unknown'}  
**Population:** ${nation.population || 0}  
**Founded:** ${nation.founded || 'Unknown'}  
**Government:** ${nation.government || 'Unknown'}  
**Motto:** "${nation.motto || 'No motto'}"  
**Daily Upkeep:** ${nation.daily_upkeep || 'Unknown'}  
**Bank:** ${nation.bank || 'Unknown'}

## Description
${nation.description || 'No description available.'}

## Lore
${nation.lore || 'No lore available.'}

## History
${nation.history || 'No historical information available.'}

## Specialties
${(nation.specialties || []).map(specialty => `- ${specialty}`).join('\n')}

## Towns
${townsList || 'No towns in this nation.'}

---
*This page was automatically generated from the server database.*`;
  }

  // Generate town page content
  private async generateTownContent(town: Town): Promise<string> {
    let nationInfo = '**Status:** Independent Town';
    
    if (town.nation_id && !town.is_independent) {
      try {
        // Fetch nation name
        const { data: nation, error } = await supabase
          .from('nations')
          .select('name')
          .eq('id', town.nation_id)
          .single();
        
        if (nation && !error) {
          nationInfo = `**Nation:** [${nation.name}](/wiki/nation-${nation.name.toLowerCase().replace(/\s+/g, '-')})`;
        } else {
          nationInfo = `**Nation:** [Nation ID: ${town.nation_id}](/wiki/nation-${town.nation_id})`;
        }
      } catch (error) {
        console.error(`Error fetching nation for town ${town.name}:`, error);
        nationInfo = `**Nation:** [Nation ID: ${town.nation_id}](/wiki/nation-${town.nation_id})`;
      }
    }

    return `# ${town.name}

**Mayor:** ${town.mayor || 'Unknown'}  
**Population:** ${town.population || 0}  
**Type:** ${town.type || 'Unknown'}  
**Status:** ${town.status || 'Unknown'}  
**Founded:** ${town.founded || 'Unknown'}  
${nationInfo}

## Description
This is an automatically generated page for ${town.name}. More information will be added as it becomes available.

---
*This page was automatically generated from the server database.*`;
  }

  // Update SUMMARY.md with the new structure
  private async updateSummaryWithNationsAndTowns(): Promise<void> {
    try {
      console.log('📝 Updating SUMMARY.md with nations and towns...');
      
      // Get current summary
      let currentSummary = await wikiCacheService.getSummary();
      
      if (!currentSummary) {
        // Create basic summary structure
        currentSummary = `# Summary

## The World

### Nations

### Towns

## Getting Started

## Game Mechanics

## Documentation
`;
      }

      // Parse current summary
      const summaryNodes = generateSummaryMd([]); // We'll rebuild this
      
      // Create new summary with nations and towns
      const newSummary = `# Summary

## The World

### Nations
${(await this.getNations()).map(nation => 
  `* [${nation.name}](nation-${nation.name.toLowerCase().replace(/\s+/g, '-')})`
).join('\n')}

### Towns
${(await this.getTowns()).map(town => 
  `* [${town.name}](town-${town.name.toLowerCase().replace(/\s+/g, '-')})`
).join('\n')}

## Getting Started

## Game Mechanics

## Documentation
`;

      // Update cache
      await wikiCacheService.setSummary(newSummary);
      
      // Add to pending changes
      await wikiCacheService.addPendingChange({
        type: 'update',
        slug: 'SUMMARY.md',
        data: { content: newSummary }
      });

      console.log('✅ SUMMARY.md updated with nations and towns');
    } catch (error) {
      console.error('❌ Failed to update SUMMARY.md:', error);
      throw error;
    }
  }

  // Get all nations from Supabase
  private async getNations(): Promise<Nation[]> {
    const { data: nations, error } = await supabase
      .from('nations')
      .select('*')
      .order('name');

    if (error) throw error;
    return nations || [];
  }

  // Get all towns from Supabase
  private async getTowns(): Promise<Town[]> {
    const { data: towns, error } = await supabase
      .from('towns')
      .select('*')
      .order('name');

    if (error) throw error;
    return towns || [];
  }

  // Main function to sync nations and towns
  public async syncNationsAndTowns(): Promise<void> {
    try {
      console.log('🔄 Starting auto-sync of nations and towns (hybrid system)...');
      
      // Check authentication and user role
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Auth check:', { user: !!user, error: authError });
      
      if (authError || !user) {
        console.error('❌ Authentication required for sync');
        toast.error('❌ Authentication required for sync');
        throw new Error('Authentication required');
      }
      
      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('👤 User profile:', { role: profile?.role, error: profileError });
      
      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        toast.error('❌ Error fetching user profile');
        throw profileError;
      }
      
      if (!profile) {
        console.error('❌ User profile not found');
        toast.error('❌ User profile not found');
        throw new Error('User profile not found');
      }
      
      // Check if user has sufficient permissions
      if (!['admin', 'moderator', 'editor'].includes(profile.role)) {
        console.log(`⚠️ User role is ${profile.role}, attempting sync with current permissions...`);
        toast.info('⚠️ Syncing with limited permissions - some operations may fail');
      }
      
      console.log('🔍 Checking database connection...');
      toast.info('🔄 Syncing nations and towns to wiki (hybrid system)...');

      // Fetch all nations
      console.log('🔍 Fetching nations from database...');
      const nations = await this.getNations();
      console.log(`✅ Found ${nations.length} nations in database`);

      // Fetch all towns
      console.log('🔍 Fetching towns from database...');
      const towns = await this.getTowns();
      console.log(`✅ Found ${towns.length} towns in database`);

      // Group towns by nation
      const nationsWithTowns: NationWithTowns[] = nations.map(nation => ({
        ...nation,
        towns: towns.filter(town => town.nation_id === nation.id)
      }));

      // Create nation pages in cache
      console.log('📚 Creating nation pages in cache...');
      for (const nation of nationsWithTowns) {
        try {
          await this.createNationPage(nation);
        } catch (error) {
          console.error(`❌ Failed to create nation page for ${nation.name}:`, error);
        }
      }

      // Create town pages in cache
      console.log('🏘️ Creating town pages in cache...');
      for (const town of towns) {
        try {
          await this.createTownPage(town);
        } catch (error) {
          console.error(`❌ Failed to create town page for ${town.name}:`, error);
        }
      }

      // Update SUMMARY.md with hierarchical structure
      await this.updateSummaryWithNationsAndTowns();
      
      // Sync to GitHub
      console.log('📤 Syncing changes to GitHub...');
      const syncResult = await enhancedGitHubWikiService.syncToGitHub();
      
      if (syncResult.success) {
        toast.success(`✅ Successfully synced ${nations.length} nations and ${towns.length} towns to wiki!`);
        console.log(`Auto-sync completed: ${nations.length} nations, ${towns.length} towns`);
      } else {
        toast.warning(`⚠️ Created pages in cache but GitHub sync failed: ${syncResult.message}`);
        console.log('Pages created in cache, GitHub sync will happen later');
      }

    } catch (error) {
      console.error('❌ Failed to sync nations and towns:', error);
      toast.error(`❌ Failed to sync nations and towns: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Function to sync a single nation
  public async syncSingleNation(nationId: string): Promise<void> {
    try {
      const { data: nation, error: nationError } = await supabase
        .from('nations')
        .select('*')
        .eq('id', nationId)
        .single();

      if (nationError) throw nationError;

      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .eq('nation_id', nationId);

      if (townsError) throw townsError;

      const nationWithTowns: NationWithTowns = {
        ...nation,
        towns: towns || []
      };

      await this.createNationPage(nationWithTowns);
      console.log(`Synced single nation: ${nation.name}`);

    } catch (error) {
      console.error('Error syncing single nation:', error);
      throw error;
    }
  }

  // Function to sync a single town
  public async syncSingleTown(townId: string): Promise<void> {
    try {
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('*')
        .eq('id', townId)
        .single();

      if (townError) throw townError;

      await this.createTownPage(town);
      console.log(`Synced single town: ${town.name}`);

    } catch (error) {
      console.error('Error syncing single town:', error);
      throw error;
    }
  }

  // Test function to verify database connection and data
  public async testDatabaseConnection(): Promise<{ nations: number; towns: number; error?: string }> {
    try {
      console.log('🔍 Testing database connection...');
      
      const nations = await this.getNations();
      const towns = await this.getTowns();

      console.log(`✅ Database connection successful. Found ${nations.length} nations and ${towns.length} towns`);
      
      return { 
        nations: nations.length, 
        towns: towns.length 
      };

    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { 
        nations: 0, 
        towns: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const enhancedAutoWikiService = new EnhancedAutoWikiService(); 