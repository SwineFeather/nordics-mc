import { supabase } from '@/integrations/supabase/client';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { parseSummaryMd, generateSummaryMd, SummaryTreeNode } from '@/utils/summaryParser';
import { toast } from 'sonner';

export interface SummarySyncResult {
  success: boolean;
  message: string;
  categories?: WikiCategory[];
  summaryContent?: string;
}

export class SummarySyncService {
  private static instance: SummarySyncService;
  
  public static getInstance(): SummarySyncService {
    if (!SummarySyncService.instance) {
      SummarySyncService.instance = new SummarySyncService();
    }
    return SummarySyncService.instance;
  }

  /**
   * Sync from SUMMARY.md to database
   * This will update the wiki structure based on SUMMARY.md content
   */
  async syncFromSummary(summaryContent: string): Promise<SummarySyncResult> {
    try {
      console.log('🔄 Starting SUMMARY.md sync to database...');
      
      // Parse the SUMMARY.md content
      const summaryNodes = parseSummaryMd(summaryContent);
      console.log(`📚 Parsed ${summaryNodes.length} top-level nodes from SUMMARY.md`);
      
      // Get current database categories
      const { data: dbCategories, error: fetchError } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('order_index');
        
      if (fetchError) throw fetchError;
      
      // Get current database pages
      const { data: dbPages, error: pagesError } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('order_index');
        
      if (pagesError) throw pagesError;
      
      // Create a map of existing items for quick lookup
      const existingCategories = new Map((dbCategories || []).map(cat => [cat.slug, cat]));
      const existingPages = new Map((dbPages || []).map(page => [page.slug, page]));
      
      // Process each node from SUMMARY.md recursively
      for (const summaryNode of summaryNodes) {
        await this.processNode(summaryNode, existingCategories, existingPages, null);
      }
      
      // Hide items that are not in SUMMARY.md
      await this.hideUnlistedItems(summaryNodes, existingCategories, existingPages);
      
      console.log('✅ SUMMARY.md sync completed successfully');
      
      return {
        success: true,
        message: `Successfully synced ${summaryNodes.length} top-level nodes from SUMMARY.md`,
        categories: [] // TODO: Convert back to WikiCategory[] if needed
      };
      
    } catch (error) {
      console.error('❌ Error syncing from SUMMARY.md:', error);
      return {
        success: false,
        message: `Failed to sync from SUMMARY.md: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Sync from database to SUMMARY.md
   * This will generate SUMMARY.md content based on current wiki structure
   */
  async syncToSummary(): Promise<SummarySyncResult> {
    try {
      console.log('🔄 Starting database sync to SUMMARY.md...');
      
      // Get only visible categories (those controlled by SUMMARY.md)
      const { data: categories, error: categoriesError } = await supabase
        .from('wiki_categories')
        .select('*')
        .eq('is_visible', true)
        .order('order_index');
        
      if (categoriesError) throw categoriesError;
      
      // Get only visible pages (those controlled by SUMMARY.md)
      const { data: pages, error: pagesError } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('is_visible', true)
        .order('order_index');
        
      if (pagesError) throw pagesError;
      
      console.log('📚 Found visible categories:', categories?.length || 0);
      console.log('📄 Found visible pages:', pages?.length || 0);
      
      // Convert to SummaryTreeNode format (simplified for now)
      const summaryNodes = categories?.map(cat => ({
        id: cat.id,
        type: 'category' as const,
        title: cat.title,
        slug: cat.slug,
        description: cat.description,
        order: cat.order_index || 0,
        level: 2,
        children: pages
          ?.filter(page => page.category_id === cat.id)
          .map(page => ({
            id: page.id,
            type: 'page' as const,
            title: page.title,
            slug: page.slug,
            content: page.content,
            order: page.order_index || 0,
            level: 3,
            children: [], // TODO: Handle sub-pages
            parentId: cat.id
          })) || []
      })) || [] as SummaryTreeNode[];
      
      // Generate SUMMARY.md content
      const summaryContent = generateSummaryMd(summaryNodes);
      
      console.log('✅ Database sync to SUMMARY.md completed');
      console.log('📝 Generated SUMMARY.md content length:', summaryContent.length);
      
      return {
        success: true,
        message: 'Successfully generated SUMMARY.md from database',
        summaryContent,
        categories: [] // Return empty array since we're using SummaryTreeNode now
      };
      
    } catch (error) {
      console.error('❌ Error syncing to SUMMARY.md:', error);
      return {
        success: false,
        message: `Failed to sync to SUMMARY.md: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process a node from SUMMARY.md and sync it with the database
   */
  private async processNode(
    summaryNode: SummaryTreeNode, 
    existingCategories: Map<string, any>, 
    existingPages: Map<string, any>,
    parentId: string | null
  ): Promise<void> {
    if (summaryNode.type === 'category') {
      // Process category
      const existingCategory = existingCategories.get(summaryNode.slug);
      
      if (existingCategory) {
        // Update existing category
        await supabase
          .from('wiki_categories')
          .update({
            title: summaryNode.title,
            description: summaryNode.description,
            order_index: summaryNode.order,
            is_visible: true, // Mark as visible since it's in SUMMARY.md
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCategory.id);
          
        // Process children with the category's UUID as parent
        for (const child of summaryNode.children) {
          await this.processNode(child, existingCategories, existingPages, existingCategory.id);
        }
      } else {
        // Create new category
        const { data: newCategory, error } = await supabase
          .from('wiki_categories')
          .insert({
            title: summaryNode.title,
            slug: summaryNode.slug,
            description: summaryNode.description,
            order_index: summaryNode.order,
            is_visible: true // Mark as visible since it's in SUMMARY.md
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add to existing categories map
        existingCategories.set(summaryNode.slug, newCategory);
        
        // Process children with the new category's UUID as parent
        for (const child of summaryNode.children) {
          await this.processNode(child, existingCategories, existingPages, newCategory.id);
        }
      }
    } else if (summaryNode.type === 'page') {
      // Process page
      const existingPage = existingPages.get(summaryNode.slug);
      
      if (existingPage) {
        // Update existing page - preserve existing content
        await supabase
          .from('wiki_pages')
          .update({
            title: summaryNode.title,
            order_index: summaryNode.order,
            parent_page_id: parentId, // Use the actual UUID
            is_visible: true, // Mark as visible since it's in SUMMARY.md
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPage.id);
          
        console.log(`📄 Updated existing page: ${summaryNode.title} (${summaryNode.slug}) - preserved existing content`);
      } else {
        // Check if there's a page with this slug in the database (even if not in existingPages map)
        const { data: dbPage, error: checkError } = await supabase
          .from('wiki_pages')
          .select('*')
          .eq('slug', summaryNode.slug)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is expected if page doesn't exist
          throw checkError;
        }
        
        if (dbPage) {
          // Page exists in database but wasn't in our map - update it
          await supabase
            .from('wiki_pages')
            .update({
              title: summaryNode.title,
              order_index: summaryNode.order,
              category_id: parentId, // Update category if needed
              parent_page_id: null, // Reset parent if it was a sub-page
              is_visible: true, // Mark as visible since it's in SUMMARY.md
              updated_at: new Date().toISOString()
            })
            .eq('id', dbPage.id);
            
          console.log(`📄 Found and updated existing page: ${summaryNode.title} (${summaryNode.slug}) - preserved existing content`);
          
          // Add to existing pages map for future reference
          existingPages.set(summaryNode.slug, dbPage);
        } else {
          // Create new page with placeholder content
          const { error } = await supabase
            .from('wiki_pages')
            .insert({
              title: summaryNode.title,
              slug: summaryNode.slug,
              content: summaryNode.content || `# ${summaryNode.title}\n\nThis page was created from SUMMARY.md.`,
              status: 'draft',
              category_id: parentId, // Use the actual UUID
              parent_page_id: null, // Will be set if this is a sub-page
              order_index: summaryNode.order,
              is_visible: true // Mark as visible since it's in SUMMARY.md
            });
            
          if (error) throw error;
          
          console.log(`📄 Created new page: ${summaryNode.title} (${summaryNode.slug})`);
        }
      }
      
      // Process children (sub-pages)
      for (const child of summaryNode.children) {
        await this.processNode(child, existingCategories, existingPages, existingPage?.id || null);
      }
    }
  }

  /**
   * Hide items that are not in SUMMARY.md
   */
  private async hideUnlistedItems(
    summaryNodes: SummaryTreeNode[],
    existingCategories: Map<string, any>,
    existingPages: Map<string, any>
  ): Promise<void> {
    // Get all slugs from SUMMARY.md recursively
    const summaryCategorySlugs = new Set<string>();
    const summaryPageSlugs = new Set<string>();
    
    const collectSlugs = (nodes: SummaryTreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'category') {
          summaryCategorySlugs.add(node.slug);
          collectSlugs(node.children);
        } else if (node.type === 'page') {
          summaryPageSlugs.add(node.slug);
          collectSlugs(node.children);
        }
      }
    };
    
    collectSlugs(summaryNodes);
    
    console.log('📋 Items in SUMMARY.md:', {
      categories: Array.from(summaryCategorySlugs),
      pages: Array.from(summaryPageSlugs)
    });
    
    // Hide categories not in SUMMARY.md
    for (const [slug, category] of existingCategories) {
      if (!summaryCategorySlugs.has(slug)) {
        console.log(`🚫 Hiding category: ${slug}`);
        await supabase
          .from('wiki_categories')
          .update({ 
            is_visible: false,
            updated_at: new Date().toISOString() 
          })
          .eq('id', category.id);
      }
    }
    
    // Hide pages not in SUMMARY.md
    for (const [slug, page] of existingPages) {
      if (!summaryPageSlugs.has(slug)) {
        console.log(`🚫 Hiding page: ${slug}`);
        await supabase
          .from('wiki_pages')
          .update({ 
            is_visible: false,
            updated_at: new Date().toISOString() 
          })
          .eq('id', page.id);
      }
    }
  }

  /**
   * Get current SUMMARY.md content from database
   */
  async getCurrentSummaryContent(): Promise<string> {
    const result = await this.syncToSummary();
    if (result.success && result.summaryContent) {
      return result.summaryContent;
    }
    throw new Error('Failed to generate SUMMARY.md content');
  }

  /**
   * Update SUMMARY.md content and sync to database
   */
  async updateSummaryContent(newContent: string): Promise<SummarySyncResult> {
    try {
      console.log('📝 Updating SUMMARY.md content...');
      
      // Sync the new content to database
      const result = await this.syncFromSummary(newContent);
      
      if (result.success) {
        toast.success('SUMMARY.md updated and synced successfully!');
      } else {
        toast.error(result.message);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error updating SUMMARY.md:', error);
      return {
        success: false,
        message: `Failed to update SUMMARY.md: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Auto-sync when wiki structure changes
   */
  async autoSyncOnWikiChange(): Promise<void> {
    try {
      console.log('🔄 Auto-syncing wiki changes to SUMMARY.md...');
      
      const result = await this.syncToSummary();
      
      if (result.success) {
        console.log('✅ Auto-sync completed');
      } else {
        console.error('❌ Auto-sync failed:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error in auto-sync:', error);
    }
  }
}

export const summarySyncService = SummarySyncService.getInstance(); 