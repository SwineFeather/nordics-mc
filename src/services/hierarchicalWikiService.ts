import { supabase } from '@/integrations/supabase/client';
import { 
  WikiCategory, 
  WikiPage, 
  HierarchicalMove, 
  HierarchicalReorder,
  WikiPageSettings,
  WikiCategorySettings
} from '@/types/wiki';
import { toast } from 'sonner';

export class HierarchicalWikiService {
  // Load hierarchical wiki data
  static async loadHierarchicalData(): Promise<WikiCategory[]> {
    try {
      // Load categories with their hierarchy
      const { data: categories, error: categoriesError } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Load pages with their hierarchy
      const { data: pages, error: pagesError } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('order', { ascending: true });

      if (pagesError) throw pagesError;

      // Build hierarchical structure
      const hierarchicalCategories = this.buildCategoryHierarchy(categories || []);
      const hierarchicalPages = this.buildPageHierarchy(pages || []);

      // Attach pages to categories
      return this.attachPagesToCategories(hierarchicalCategories, hierarchicalPages);
    } catch (error) {
      console.error('Failed to load hierarchical wiki data:', error);
      throw error;
    }
  }

  // Build category hierarchy
  private static buildCategoryHierarchy(categories: any[]): WikiCategory[] {
    const categoryMap = new Map<string, WikiCategory>();
    const rootCategories: WikiCategory[] = [];

    // Create category map
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
        pages: [],
        depth: 0
      });
    });

    // Build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children!.push(category);
          category.depth = (parent.depth || 0) + 1;
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  // Build page hierarchy
  private static buildPageHierarchy(pages: any[]): WikiPage[] {
    const pageMap = new Map<string, WikiPage>();
    const rootPages: WikiPage[] = [];

    // Create page map
    pages.forEach(page => {
      pageMap.set(page.id, {
        ...page,
        children: [],
        depth: 0
      });
    });

    // Build hierarchy
    pages.forEach(page => {
      const pageItem = pageMap.get(page.id)!;
      
      if (page.parent_page_id) {
        const parent = pageMap.get(page.parent_page_id);
        if (parent) {
          parent.children!.push(pageItem);
          pageItem.depth = (parent.depth || 0) + 1;
        }
      } else {
        rootPages.push(pageItem);
      }
    });

    return rootPages;
  }

  // Attach pages to categories
  private static attachPagesToCategories(categories: WikiCategory[], pages: WikiPage[]): WikiCategory[] {
    const categoryMap = new Map<string, WikiCategory>();

    // Create flat map of all categories
    const flattenCategories = (cats: WikiCategory[]) => {
      cats.forEach(cat => {
        categoryMap.set(cat.id, cat);
        if (cat.children) {
          flattenCategories(cat.children);
        }
      });
    };
    flattenCategories(categories);

    // Attach pages to their categories
    pages.forEach(page => {
      const category = categoryMap.get(page.category);
      if (category) {
        category.pages.push(page);
      }
    });

    return categories;
  }

  // Move item in hierarchy
  static async moveItem(move: HierarchicalMove): Promise<void> {
    try {
      const { itemId, itemType, newParentId, newIndex } = move;

      if (itemType === 'category') {
        await this.moveCategory(itemId, newParentId, newIndex);
      } else {
        await this.movePage(itemId, newParentId, newIndex);
      }

      toast.success(`${itemType === 'category' ? 'Category' : 'Page'} moved successfully`);
    } catch (error) {
      console.error('Failed to move item:', error);
      toast.error(`Failed to move item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Move category
  private static async moveCategory(categoryId: string, newParentId: string | null, newIndex: number): Promise<void> {
    const updates: any = {
      parent_id: newParentId,
      order: newIndex,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('wiki_categories')
      .update(updates)
      .eq('id', categoryId);

    if (error) throw error;
  }

  // Move page
  private static async movePage(pageId: string, newParentId: string | null, newIndex: number): Promise<void> {
    const updates: any = {
      parent_page_id: newParentId,
      order: newIndex,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('wiki_pages')
      .update(updates)
      .eq('id', pageId);

    if (error) throw error;
  }

  // Reorder items
  static async reorderItems(reorder: HierarchicalReorder): Promise<void> {
    try {
      const { parentId, itemType, startIndex, endIndex } = reorder;

      if (itemType === 'category') {
        await this.reorderCategories(parentId, startIndex, endIndex);
      } else {
        await this.reorderPages(parentId, startIndex, endIndex);
      }

      toast.success('Items reordered successfully');
    } catch (error) {
      console.error('Failed to reorder items:', error);
      toast.error(`Failed to reorder items: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Reorder categories
  private static async reorderCategories(parentId: string | null, startIndex: number, endIndex: number): Promise<void> {
    // Get categories to reorder
    const { data: categories, error: fetchError } = await supabase
      .from('wiki_categories')
      .select('id, order')
      .eq('parent_id', parentId)
      .order('order', { ascending: true });

    if (fetchError) throw fetchError;

    if (!categories) return;

    // Reorder the array
    const [movedCategory] = categories.splice(startIndex, 1);
    categories.splice(endIndex, 0, movedCategory);

    // Update orders
    const updates = categories.map((cat, index) => ({
      id: cat.id,
      order: index
    }));

    // Batch update
    for (const update of updates) {
      const { error } = await supabase
        .from('wiki_categories')
        .update({ order: update.order })
        .eq('id', update.id);

      if (error) throw error;
    }
  }

  // Reorder pages
  private static async reorderPages(parentId: string | null, startIndex: number, endIndex: number): Promise<void> {
    // Get pages to reorder
    const { data: pages, error: fetchError } = await supabase
      .from('wiki_pages')
      .select('id, order')
      .eq('parent_page_id', parentId)
      .order('order', { ascending: true });

    if (fetchError) throw fetchError;

    if (!pages) return;

    // Reorder the array
    const [movedPage] = pages.splice(startIndex, 1);
    pages.splice(endIndex, 0, movedPage);

    // Update orders
    const updates = pages.map((page, index) => ({
      id: page.id,
      order: index
    }));

    // Batch update
    for (const update of updates) {
      const { error } = await supabase
        .from('wiki_pages')
        .update({ order: update.order })
        .eq('id', update.id);

      if (error) throw error;
    }
  }

  // Update page settings
  static async updatePageSettings(pageId: string, settings: WikiPageSettings): Promise<void> {
    try {
      const updates: any = {
        title: settings.title,
        slug: settings.slug,
        description: settings.description,
        icon: settings.icon,
        color: settings.color,
        parent_page_id: settings.parentId || null,
        tags: settings.tags,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wiki_pages')
        .update(updates)
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Page settings updated successfully');
    } catch (error) {
      console.error('Failed to update page settings:', error);
      toast.error(`Failed to update page settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Update category settings
  static async updateCategorySettings(categoryId: string, settings: WikiCategorySettings): Promise<void> {
    try {
      const updates: any = {
        title: settings.title,
        slug: settings.slug,
        description: settings.description,
        icon: settings.icon,
        color: settings.color,
        parent_id: settings.parentId || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wiki_categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Category settings updated successfully');
    } catch (error) {
      console.error('Failed to update category settings:', error);
      toast.error(`Failed to update category settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Create new page
  static async createPage(pageData: {
    title: string;
    slug: string;
    content: string;
    categoryId: string;
    parentPageId?: string;
    icon?: string;
    color?: string;
    description?: string;
    tags?: string[];
  }): Promise<WikiPage> {
    try {
      // Get the next order for this category/parent
      const { data: existingPages, error: fetchError } = await supabase
        .from('wiki_pages')
        .select('order')
        .eq('parent_page_id', pageData.parentPageId || null)
        .order('order', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextOrder = existingPages && existingPages.length > 0 ? existingPages[0].order + 1 : 0;

      const newPage = {
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        category: pageData.categoryId,
        parent_page_id: pageData.parentPageId || null,
        order: nextOrder,
        status: 'draft',
        icon: pageData.icon,
        color: pageData.color,
        description: pageData.description,
        tags: pageData.tags || [],
        author_id: (await supabase.auth.getUser()).data.user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('wiki_pages')
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;

      toast.success('Page created successfully');
      return data;
    } catch (error) {
      console.error('Failed to create page:', error);
      toast.error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Create new category
  static async createCategory(categoryData: {
    title: string;
    slug: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
  }): Promise<WikiCategory> {
    try {
      // Get the next order for this parent
      const { data: existingCategories, error: fetchError } = await supabase
        .from('wiki_categories')
        .select('order')
        .eq('parent_id', categoryData.parentId || null)
        .order('order', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextOrder = existingCategories && existingCategories.length > 0 ? existingCategories[0].order + 1 : 0;

      const newCategory = {
        title: categoryData.title,
        slug: categoryData.slug,
        description: categoryData.description,
        parent_id: categoryData.parentId || null,
        order: nextOrder,
        icon: categoryData.icon,
        color: categoryData.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('wiki_categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;

      toast.success('Category created successfully');
      return data;
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Delete item
  static async deleteItem(itemId: string, itemType: 'category' | 'page'): Promise<void> {
    try {
      if (itemType === 'category') {
        // Check if category has children or pages
        const { data: children, error: childrenError } = await supabase
          .from('wiki_categories')
          .select('id')
          .eq('parent_id', itemId);

        if (childrenError) throw childrenError;

        const { data: pages, error: pagesError } = await supabase
          .from('wiki_pages')
          .select('id')
          .eq('category', itemId);

        if (pagesError) throw pagesError;

        if (children && children.length > 0) {
          throw new Error('Cannot delete category with subcategories');
        }

        if (pages && pages.length > 0) {
          throw new Error('Cannot delete category with pages');
        }

        const { error } = await supabase
          .from('wiki_categories')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      } else {
        // Check if page has children
        const { data: children, error: childrenError } = await supabase
          .from('wiki_pages')
          .select('id')
          .eq('parent_page_id', itemId);

        if (childrenError) throw childrenError;

        if (children && children.length > 0) {
          throw new Error('Cannot delete page with subpages');
        }

        const { error } = await supabase
          .from('wiki_pages')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      }

      toast.success(`${itemType === 'category' ? 'Category' : 'Page'} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(`Failed to delete ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Get all parent options for categories
  static async getCategoryParentOptions(excludeId?: string): Promise<Array<{ id: string; title: string; depth: number }>> {
    try {
      const { data: categories, error } = await supabase
        .from('wiki_categories')
        .select('id, title, parent_id')
        .order('order', { ascending: true });

      if (error) throw error;

      if (!categories) return [];

      // Build hierarchy and flatten with depth
      const buildOptions = (cats: any[], parentId: string | null = null, depth: number = 0): Array<{ id: string; title: string; depth: number }> => {
        const options: Array<{ id: string; title: string; depth: number }> = [];
        
        cats
          .filter(cat => cat.parent_id === parentId && cat.id !== excludeId)
          .forEach(cat => {
            options.push({ id: cat.id, title: cat.title, depth });
            options.push(...buildOptions(cats, cat.id, depth + 1));
          });

        return options;
      };

      return buildOptions(categories);
    } catch (error) {
      console.error('Failed to get category parent options:', error);
      throw error;
    }
  }

  // Get all parent options for pages
  static async getPageParentOptions(excludeId?: string): Promise<Array<{ id: string; title: string; depth: number }>> {
    try {
      const { data: pages, error } = await supabase
        .from('wiki_pages')
        .select('id, title, parent_page_id')
        .order('order', { ascending: true });

      if (error) throw error;

      if (!pages) return [];

      // Build hierarchy and flatten with depth
      const buildOptions = (pages: any[], parentId: string | null = null, depth: number = 0): Array<{ id: string; title: string; depth: number }> => {
        const options: Array<{ id: string; title: string; depth: number }> = [];
        
        pages
          .filter(page => page.parent_page_id === parentId && page.id !== excludeId)
          .forEach(page => {
            options.push({ id: page.id, title: page.title, depth });
            options.push(...buildOptions(pages, page.id, depth + 1));
          });

        return options;
      };

      return buildOptions(pages);
    } catch (error) {
      console.error('Failed to get page parent options:', error);
      throw error;
    }
  }

  // Validate hierarchy depth
  static validateHierarchyDepth(itemId: string, newParentId: string | null, itemType: 'category' | 'page'): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        if (!newParentId) {
          resolve(true); // Root level is always valid
          return;
        }

        let currentDepth = 0;
        let currentParentId = newParentId;

        // Calculate depth by traversing up the hierarchy
        while (currentParentId && currentDepth < 6) {
          const table = itemType === 'category' ? 'wiki_categories' : 'wiki_pages';
          const parentField = itemType === 'category' ? 'parent_id' : 'parent_page_id';

          const { data, error } = await supabase
            .from(table)
            .select(`id, ${parentField}`)
            .eq('id', currentParentId)
            .single();

          if (error || !data) {
            resolve(false);
            return;
          }

          currentParentId = data[parentField];
          currentDepth++;
        }

        resolve(currentDepth < 6);
      } catch (error) {
        console.error('Error validating hierarchy depth:', error);
        resolve(false);
      }
    });
  }
}

export const hierarchicalWikiService = new HierarchicalWikiService(); 