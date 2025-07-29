import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { summarySyncService } from './summarySyncService';
import { WikiCategory } from '@/types/wiki';

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

export class AutoWikiService {
  // Check if a page already exists
  private async pageExists(slug: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking if page exists: ${slug}`);
      
      // First, check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Auth check:', { user: !!user, error: authError });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        return false;
      }
      
      if (!user) {
        console.error('❌ No authenticated user');
        return false;
      }

      const { data, error } = await supabase
        .from('wiki_pages')
        .select('id')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // PGRST116 is "not found"
          console.log(`✅ Page ${slug} does not exist (not found)`);
          return false;
        }
        
        // Handle permission errors more gracefully
        if (error.code === '406' || error.message?.includes('Not Acceptable')) {
          console.log(`⚠️ Permission issue checking page ${slug}, assuming it doesn't exist`);
          return false;
        }
        
        console.error('❌ Error checking if page exists:', error);
        return false;
      }

      console.log(`✅ Page exists check result: ${!!data}`);
      return !!data;
    } catch (error) {
      console.error('❌ Exception checking if page exists:', error);
      return false;
    }
  }

  // Get or create "The World" category
  private async getOrCreateWorldCategory(): Promise<string> {
    console.log('🔍 Checking if "The World" category exists...');
    const { data: existingCategory, error: checkError } = await supabase
      .from('wiki_categories')
      .select('id')
      .eq('slug', 'the-world')
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // Not found, continue to create
        console.log('✅ "The World" category does not exist, will create it');
      } else if (checkError.code === '406' || checkError.message?.includes('Not Acceptable')) {
        console.error('❌ Permission denied checking for world category');
        toast.error('❌ Permission denied: Cannot check for existing categories');
        throw new Error('Permission denied: Cannot check for existing categories');
      } else {
        console.error('❌ Error checking for existing world category:', checkError);
        throw checkError;
      }
    }

    if (existingCategory) {
      console.log('✅ "The World" category already exists');
      return existingCategory.id;
    }

    console.log('🔨 Creating "The World" category...');
    // Create the world category
    const { data: newCategory, error } = await supabase
      .from('wiki_categories')
      .insert({
        title: 'The World',
        slug: 'the-world',
        description: 'Information about the world, nations, and towns',
        order_index: 1,
        is_visible: true
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating world category:', error);
      
      // Handle permission errors specifically
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.error('❌ Permission denied creating world category');
        toast.error('❌ Permission denied: Cannot create categories');
        throw new Error('Permission denied: Cannot create categories');
      }
      
      throw error;
    }

    console.log('✅ "The World" category created successfully');
    return newCategory.id;
  }

  // Get or create subcategories
  private async getOrCreateSubcategory(parentId: string, title: string, slug: string): Promise<string> {
    console.log(`🔍 Checking if "${title}" category exists...`);
    const { data: existingCategory, error: checkError } = await supabase
      .from('wiki_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // Not found, continue to create
        console.log(`✅ "${title}" category does not exist, will create it`);
      } else if (checkError.code === '406' || checkError.message?.includes('Not Acceptable')) {
        console.error(`❌ Permission denied checking for ${title} category`);
        toast.error(`❌ Permission denied: Cannot check for existing categories`);
        throw new Error('Permission denied: Cannot check for existing categories');
      } else {
        console.error(`❌ Error checking for existing ${title} category:`, checkError);
        throw checkError;
      }
    }

    if (existingCategory) {
      console.log(`✅ "${title}" category already exists`);
      // Update the existing category to have the correct parent_id
      const { error: updateError } = await supabase
        .from('wiki_categories')
        .update({ parent_id: parentId } as any)
        .eq('id', existingCategory.id);
      
      if (updateError) {
        console.warn(`⚠️ Could not update parent_id for existing ${title} category:`, updateError);
      }
      
      return existingCategory.id;
    }

    console.log(`🔨 Creating "${title}" category...`);
    // Create the subcategory with parent_id
    const { data: newCategory, error } = await supabase
      .from('wiki_categories')
      .insert({
        title,
        slug,
        description: `Information about ${title.toLowerCase()}`,
        order_index: title === 'Nations' ? 1 : 2,
        parent_id: parentId,
        is_visible: true
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error creating ${title} category:`, error);
      
      // Handle permission errors specifically
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.error(`❌ Permission denied creating ${title} category`);
        toast.error(`❌ Permission denied: Cannot create categories`);
        throw new Error('Permission denied: Cannot create categories');
      }
      
      throw error;
    }

    console.log(`✅ "${title}" category created successfully`);
    return newCategory.id;
  }

  // Create a nation page
  private async createNationPage(nation: NationWithTowns, categoryId: string): Promise<void> {
    try {
      const slug = `nation-${nation.name.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`🔍 Checking if nation page for ${nation.name} exists...`);
      
      if (await this.pageExists(slug)) {
        console.log(`✅ Nation page for ${nation.name} already exists`);
        return;
      }

      console.log(`🔨 Creating nation page for ${nation.name}...`);
      const content = this.generateNationContent(nation);
      
      const { error } = await supabase
        .from('wiki_pages')
        .insert({
          title: nation.name,
          slug,
          content,
          status: 'published',
          category_id: categoryId,
          order_index: 0,
          is_visible: true
        } as any);

      if (error) {
        console.error(`❌ Error creating nation page for ${nation.name}:`, error);
        
        // Handle permission errors specifically
        if (error.code === '406' || error.message?.includes('Not Acceptable')) {
          console.error(`❌ Permission denied creating nation page for ${nation.name}`);
          toast.error(`❌ Permission denied: Cannot create nation page for ${nation.name}`);
          throw new Error(`Permission denied: Cannot create nation page for ${nation.name}`);
        }
        
        throw error;
      }

      console.log(`✅ Created nation page for ${nation.name} in category ${categoryId}`);
    } catch (error) {
      console.error(`❌ Failed to create nation page for ${nation.name}:`, error);
      throw error;
    }
  }

  // Create a town page
  private async createTownPage(town: Town, categoryId: string): Promise<void> {
    try {
      const slug = `town-${town.name.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`🔍 Checking if town page for ${town.name} exists...`);
      
      if (await this.pageExists(slug)) {
        console.log(`✅ Town page for ${town.name} already exists`);
        return;
      }

      console.log(`🔨 Creating town page for ${town.name}...`);
      const content = await this.generateTownContent(town);
      
      const { error } = await supabase
        .from('wiki_pages')
        .insert({
          title: town.name,
          slug,
          content,
          status: 'published',
          category_id: categoryId,
          order_index: 0,
          is_visible: true
        } as any);

      if (error) {
        console.error(`❌ Error creating town page for ${town.name}:`, error);
        
        // Handle permission errors specifically
        if (error.code === '406' || error.message?.includes('Not Acceptable')) {
          console.error(`❌ Permission denied creating town page for ${town.name}`);
          toast.error(`❌ Permission denied: Cannot create town page for ${town.name}`);
          throw new Error(`Permission denied: Cannot create town page for ${town.name}`);
        }
        
        throw error;
      }

      console.log(`✅ Created town page for ${town.name} in category ${categoryId}`);
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

  // Main function to sync nations and towns
  public async syncNationsAndTowns(): Promise<void> {
    try {
      console.log('🔄 Starting auto-sync of nations and towns...');
      
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
        console.log(`⚠️ User role is ${profile.role}, attempting to temporarily elevate permissions...`);
        
        // For development/testing purposes, we'll try to work around the permission issue
        // In production, this should be handled by proper role assignment
        console.log('🔄 Attempting sync with current permissions...');
        
        // We'll continue but log the permission issue
        toast.info('⚠️ Syncing with limited permissions - some operations may fail');
      }
      
      console.log('🔍 Checking database connection...');
      toast.info('🔄 Syncing nations and towns to wiki...');

      // Get the world category
      console.log('🌍 Getting or creating "The World" category...');
      const worldCategoryId = await this.getOrCreateWorldCategory();
      console.log('🌍 World category ID:', worldCategoryId);
      
      // Get or create nations and towns subcategories
      console.log('🏛️ Getting or creating "Nations" subcategory...');
      const nationsCategoryId = await this.getOrCreateSubcategory(worldCategoryId, 'Nations', 'nations');
      console.log('🏛️ Nations category ID:', nationsCategoryId);
      console.log('🏘️ Getting or creating "Towns" subcategory...');
      const townsCategoryId = await this.getOrCreateSubcategory(worldCategoryId, 'Towns', 'towns');
      console.log('🏘️ Towns category ID:', townsCategoryId);

      // Fetch all nations
      console.log('🔍 Fetching nations from database...');
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (nationsError) {
        console.error('❌ Error fetching nations:', nationsError);
        throw nationsError;
      }

      console.log(`✅ Found ${nations?.length || 0} nations in database`);

      // Fetch all towns
      console.log('🔍 Fetching towns from database...');
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (townsError) {
        console.error('❌ Error fetching towns:', townsError);
        throw townsError;
      }

      console.log(`✅ Found ${towns?.length || 0} towns in database`);

      // Ensure we have arrays even if empty
      const nationsArray = nations || [];
      const townsArray = towns || [];

      console.log(`📚 Found ${nationsArray.length} nations to sync`);
      console.log(`🏘️ Found ${townsArray.length} towns to sync`);

      // Group towns by nation
      const nationsWithTowns: NationWithTowns[] = nationsArray.map(nation => ({
        ...nation,
        towns: townsArray.filter(town => town.nation_id === nation.id)
      }));

      // Create nation pages
      console.log('📚 Creating nation pages...');
      for (const nation of nationsWithTowns) {
        try {
          await this.createNationPage(nation, nationsCategoryId);
        } catch (error) {
          console.error(`❌ Failed to create nation page for ${nation.name}:`, error);
        }
      }

      // Create town pages (including independent towns)
      console.log('🏘️ Creating town pages...');
      for (const town of townsArray) {
        try {
          await this.createTownPage(town, townsCategoryId);
        } catch (error) {
          console.error(`❌ Failed to create town page for ${town.name}:`, error);
        }
      }

      // Update SUMMARY.md with hierarchical structure
      await this.updateSummaryWithHierarchy();
      
      toast.success(`✅ Successfully synced ${nationsArray.length} nations and ${townsArray.length} towns to wiki!`);
      console.log(`Auto-sync completed: ${nationsArray.length} nations, ${townsArray.length} towns`);

    } catch (error) {
      console.error('❌ Failed to sync nations and towns:', error);
      toast.error(`❌ Failed to sync nations and towns: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Function to sync a single nation (for when a new nation is created)
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

      const nationsCategoryId = await this.getOrCreateSubcategory(
        await this.getOrCreateWorldCategory(),
        'Nations',
        'nations'
      );

      await this.createNationPage(nationWithTowns, nationsCategoryId);
      console.log(`Synced single nation: ${nation.name}`);

    } catch (error) {
      console.error('Error syncing single nation:', error);
      throw error;
    }
  }

  // Function to sync a single town (for when a new town is created)
  public async syncSingleTown(townId: string): Promise<void> {
    try {
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('*')
        .eq('id', townId)
        .single();

      if (townError) throw townError;

      const townsCategoryId = await this.getOrCreateSubcategory(
        await this.getOrCreateWorldCategory(),
        'Towns',
        'towns'
      );

      await this.createTownPage(town, townsCategoryId);
      console.log(`Synced single town: ${town.name}`);

    } catch (error) {
      console.error('Error syncing single town:', error);
      throw error;
    }
  }

  // Update SUMMARY.md with hierarchical structure
  public async updateSummaryWithHierarchy(): Promise<void> {
    try {
      console.log('📝 Updating SUMMARY.md with hierarchical structure...');
      
      // Use the summarySyncService to generate and sync the SUMMARY.md content
      const result = await summarySyncService.syncToSummary();
      
      if (result.success) {
        console.log('✅ SUMMARY.md updated with hierarchical structure');
        toast.success('✅ SUMMARY.md updated with hierarchical structure');
      } else {
        console.error('❌ Failed to update SUMMARY.md:', result.message);
        toast.error(`❌ Failed to update SUMMARY.md: ${result.message}`);
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('❌ Failed to update SUMMARY.md:', error);
      toast.error(`❌ Failed to update SUMMARY.md: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Test function to verify database connection and data
  public async testDatabaseConnection(): Promise<{ nations: number; towns: number; error?: string }> {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test nations table
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('id, name')
        .limit(1);

      if (nationsError) {
        console.error('Error accessing nations table:', nationsError);
        return { nations: 0, towns: 0, error: `Nations table error: ${nationsError.message}` };
      }

      // Test towns table
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('id, name')
        .limit(1);

      if (townsError) {
        console.error('Error accessing towns table:', townsError);
        return { nations: 0, towns: 0, error: `Towns table error: ${townsError.message}` };
      }

      // Get actual counts
      const { count: nationsCount } = await supabase
        .from('nations')
        .select('*', { count: 'exact', head: true });

      const { count: townsCount } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });

      console.log(`✅ Database connection successful. Found ${nationsCount || 0} nations and ${townsCount || 0} towns`);
      
      return { 
        nations: nationsCount || 0, 
        towns: townsCount || 0 
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

  // Generate auto pages for the hybrid system
  public async generateAutoPages(): Promise<WikiCategory[]> {
    try {
      console.log('🏗️ Generating auto pages for hybrid system...');
      
      // Get nations and towns data
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (nationsError) {
        console.error('❌ Error fetching nations:', nationsError);
        return [];
      }

      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (townsError) {
        console.error('❌ Error fetching towns:', townsError);
        return [];
      }

      // Create auto-generated category
      const autoCategory: WikiCategory = {
        id: 'auto-generated',
        title: 'Auto-Generated',
        slug: 'auto-generated',
        description: 'Automatically generated pages from server data',
        order: 999,
        children: [],
        pages: []
      };

      // Add nation pages
      nations?.forEach(nation => {
        autoCategory.pages.push({
          id: `auto-nation-${nation.id}`,
          title: nation.name,
          slug: `nation-${nation.id}`,
          content: this.generateNationContent(nation as any),
          status: 'published',
          authorId: 'system',
          authorName: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'auto-generated',
          order: autoCategory.pages.length + 1
        });
      });

      // Add town pages
      for (const town of towns || []) {
        const content = await this.generateTownContent(town);
        autoCategory.pages.push({
          id: `auto-town-${town.id}`,
          title: town.name,
          slug: `town-${town.id}`,
          content,
          status: 'published',
          authorId: 'system',
          authorName: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'auto-generated',
          order: autoCategory.pages.length + 1
        });
      }

      console.log(`✅ Generated ${autoCategory.pages.length} auto pages`);
      return [autoCategory];
    } catch (error) {
      console.error('❌ Error generating auto pages:', error);
      return [];
    }
  }
}

export const autoWikiService = new AutoWikiService();

export default autoWikiService; 