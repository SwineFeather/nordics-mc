
import { supabase } from '@/integrations/supabase/client';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { toast } from 'sonner';

export class WikiSyncService {
  async syncCategoriesToSupabase(categories: WikiCategory[]): Promise<void> {
    console.log('🔄 Starting sync to Supabase database...');
    
    try {
      // Start a transaction-like operation by clearing and inserting
      console.log('1️⃣ Clearing existing wiki data...');
      
      // Delete existing pages first (due to foreign key constraints)
      const { error: pagesDeleteError } = await supabase
        .from('wiki_pages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (pagesDeleteError) {
        console.error('Error deleting existing pages:', pagesDeleteError);
        throw pagesDeleteError;
      }
      
      // Delete existing categories
      const { error: categoriesDeleteError } = await supabase
        .from('wiki_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (categoriesDeleteError) {
        console.error('Error deleting existing categories:', categoriesDeleteError);
        throw categoriesDeleteError;
      }
      
      console.log('2️⃣ Inserting new categories...');
      
      // Insert categories
      const categoriesToInsert = categories.map(cat => ({
        title: cat.title,
        slug: cat.slug,
        description: cat.description || null,
        order_index: cat.order
      }));
      
      const { data: insertedCategories, error: categoryInsertError } = await supabase
        .from('wiki_categories')
        .insert(categoriesToInsert)
        .select();
      
      if (categoryInsertError) {
        console.error('Error inserting categories:', categoryInsertError);
        throw categoryInsertError;
      }
      
      console.log(`✅ Inserted ${insertedCategories?.length || 0} categories`);
      
      console.log('3️⃣ Inserting pages...');
      
      // Create a mapping of slug to category ID
      const categorySlugToId = new Map(
        insertedCategories?.map(cat => [cat.slug, cat.id]) || []
      );
      
      // Insert pages
      const pagesToInsert: any[] = [];
      
      for (const category of categories) {
        const categoryId = categorySlugToId.get(category.slug);
        if (!categoryId) {
          console.warn(`Could not find category ID for slug: ${category.slug}`);
          continue;
        }
        
        for (const page of category.pages) {
          pagesToInsert.push({
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: page.status || 'published',
            category_id: categoryId,
            order_index: page.order,
            github_path: page.githubPath || null,
            author_id: null // Will be set when users edit pages
          });
        }
      }
      
      if (pagesToInsert.length > 0) {
        // Insert pages in batches to avoid potential size limits
        const batchSize = 50;
        let insertedPagesCount = 0;
        
        for (let i = 0; i < pagesToInsert.length; i += batchSize) {
          const batch = pagesToInsert.slice(i, i + batchSize);
          
          const { data: insertedPages, error: pageInsertError } = await supabase
            .from('wiki_pages')
            .insert(batch)
            .select();
          
          if (pageInsertError) {
            console.error('Error inserting pages batch:', pageInsertError);
            throw pageInsertError;
          }
          
          insertedPagesCount += insertedPages?.length || 0;
          console.log(`📄 Inserted batch ${Math.floor(i/batchSize) + 1}, ${insertedPages?.length || 0} pages`);
        }
        
        console.log(`✅ Total pages inserted: ${insertedPagesCount}`);
      }
      
      console.log('🎉 Sync to Supabase completed successfully!');
      
    } catch (error) {
      console.error('❌ Failed to sync to Supabase:', error);
      throw error;
    }
  }
  
  async loadWikiDataFromSupabase(): Promise<WikiCategory[]> {
    console.log('📖 Loading wiki data from Supabase...');
    
    try {
      // Fetch visible categories with hierarchical structure
      const { data: categories, error: categoriesError } = await supabase
        .from('wiki_categories')
        .select('*')
        .eq('is_visible', true)
        .order('order_index');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      console.log('📚 Raw categories from database:', categories);

      // Fetch visible pages
      const { data: pages, error: pagesError } = await supabase
        .from('wiki_pages')
        .select(`
          id,
          title,
          slug,
          content,
          status,
          category_id,
          author_id,
          order_index,
          github_path,
          created_at,
          updated_at,
          profiles:author_id (
            full_name,
            email
          )
        `)
        .eq('is_visible', true)
        .order('order_index');

      if (pagesError) {
        console.error('Error fetching pages:', pagesError);
        throw pagesError;
      }

      console.log('📄 Raw pages from database:', pages);
      console.log('🔍 Page count by category:');
      if (pages && categories) {
        categories.forEach(cat => {
          const pageCount = pages.filter(page => page.category_id === cat.id).length;
          console.log(`  - ${cat.title}: ${pageCount} pages`);
        });
      }

      // Build hierarchical structure
      const buildHierarchy = (categories: any[], parentId: string | null = null): WikiCategory[] => {
        return categories
          .filter(cat => cat.parent_id === parentId)
          .map(cat => ({
            id: cat.id,
            title: cat.title,
            slug: cat.slug,
            description: cat.description || undefined,
            order: cat.order_index,
            parent_id: cat.parent_id || undefined,
            depth: cat.parent_id ? 1 : 0,
            children: buildHierarchy(categories, cat.id),
            pages: (pages || [])
              .filter(page => page.category_id === cat.id)
              .map(page => ({
                id: page.id,
                title: page.title,
                slug: page.slug,
                content: page.content,
                status: page.status as 'published' | 'draft' | 'review',
                authorId: page.author_id || '',
                authorName: page.profiles?.full_name || page.profiles?.email || 'System',
                createdAt: new Date(page.created_at).toLocaleDateString(),
                updatedAt: new Date(page.updated_at).toLocaleDateString(),
                category: cat.slug,
                order: page.order_index,
                githubPath: page.github_path || undefined
              }))
          }))
          .sort((a, b) => a.order - b.order);
      };

      const hierarchicalCategories = buildHierarchy(categories || []);

      console.log(`✅ Loaded ${hierarchicalCategories.length} categories from Supabase (hierarchical structure)`);
      console.log('🏗️ Final categories structure:', hierarchicalCategories);
      return hierarchicalCategories;
      
    } catch (error) {
      console.error('❌ Failed to load from Supabase:', error);
      throw error;
    }
  }
}

export const wikiSyncService = new WikiSyncService();
