import { supabase } from '@/integrations/supabase/client';
import { WikiPage } from '@/types/wiki';

export interface EditorialRights {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  reason?: string;
}

export class EditorialRightsService {
  /**
   * Check if a user has editorial rights for a specific page
   */
  async checkEditorialRights(pageId: string, userId: string): Promise<EditorialRights> {
    try {
      // Get the page details
      const { data: page, error: pageError } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (pageError || !page) {
        return { canEdit: false, canPublish: false, canDelete: false, reason: 'Page not found' };
      }

      // Get user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { canEdit: false, canPublish: false, canDelete: false, reason: 'User profile not found' };
      }

      // Staff members have full rights
      if (['admin', 'moderator', 'staff'].includes(profile.role)) {
        return { canEdit: true, canPublish: true, canDelete: true };
      }

      // Check if page is related to a nation or town
      const pageSlug = page.slug.toLowerCase();
      
      // Check nation-related pages
      const nationRights = await this.checkNationRights(pageSlug, profile.full_name);
      if (nationRights.canEdit) {
        return nationRights;
      }

      // Check town-related pages
      const townRights = await this.checkTownRights(pageSlug, profile.full_name);
      if (townRights.canEdit) {
        return townRights;
      }

      // Regular users have no editorial rights
      return { 
        canEdit: false, 
        canPublish: false, 
        canDelete: false, 
        reason: 'No editorial rights for this page' 
      };

    } catch (error) {
      console.error('Error checking editorial rights:', error);
      return { 
        canEdit: false, 
        canPublish: false, 
        canDelete: false, 
        reason: 'Error checking rights' 
      };
    }
  }

  /**
   * Check if user has rights for nation-related pages
   */
  private async checkNationRights(pageSlug: string, userName: string): Promise<EditorialRights> {
    try {
      // Get all nations where user is a leader
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('id, name, leader')
        .eq('leader', userName);

      if (nationsError || !nations) {
        return { canEdit: false, canPublish: false, canDelete: false };
      }

      // Check if page slug contains any nation name
      for (const nation of nations) {
        const nationSlug = nation.name.toLowerCase().replace(/\s+/g, '-');
        if (pageSlug.includes(nationSlug) || pageSlug.includes(nation.name.toLowerCase())) {
          return {
            canEdit: true,
            canPublish: true,
            canDelete: false, // Leaders can't delete nation pages
            reason: `You are the leader of ${nation.name}`
          };
        }
      }

      return { canEdit: false, canPublish: false, canDelete: false };

    } catch (error) {
      console.error('Error checking nation rights:', error);
      return { canEdit: false, canPublish: false, canDelete: false };
    }
  }

  /**
   * Check if user has rights for town-related pages
   */
  private async checkTownRights(pageSlug: string, userName: string): Promise<EditorialRights> {
    try {
      // Get all towns where user is a mayor
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('id, name, mayor')
        .eq('mayor', userName);

      if (townsError || !towns) {
        return { canEdit: false, canPublish: false, canDelete: false };
      }

      // Check if page slug contains any town name
      for (const town of towns) {
        const townSlug = town.name.toLowerCase().replace(/\s+/g, '-');
        if (pageSlug.includes(townSlug) || pageSlug.includes(town.name.toLowerCase())) {
          return {
            canEdit: true,
            canPublish: true,
            canDelete: false, // Mayors can't delete town pages
            reason: `You are the mayor of ${town.name}`
          };
        }
      }

      return { canEdit: false, canPublish: false, canDelete: false };

    } catch (error) {
      console.error('Error checking town rights:', error);
      return { canEdit: false, canPublish: false, canDelete: false };
    }
  }

  /**
   * Get all pages that a user has editorial rights for
   */
  async getUserEditablePages(userId: string): Promise<WikiPage[]> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return [];
      }

      // Get user's nations and towns
      const [nationsResult, townsResult] = await Promise.all([
        supabase
          .from('nations')
          .select('name')
          .eq('leader', profile.full_name),
        supabase
          .from('towns')
          .select('name')
          .eq('mayor', profile.full_name)
      ]);

      const nations = nationsResult.data || [];
      const towns = townsResult.data || [];

      // Get all wiki pages
      const { data: pages, error: pagesError } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('title');

      if (pagesError || !pages) {
        return [];
      }

      // Filter pages that user has rights for
      const editablePages = pages.filter(page => {
        const pageSlug = page.slug.toLowerCase();
        
        // Check nation pages
        for (const nation of nations) {
          const nationSlug = nation.name.toLowerCase().replace(/\s+/g, '-');
          if (pageSlug.includes(nationSlug) || pageSlug.includes(nation.name.toLowerCase())) {
            return true;
          }
        }

        // Check town pages
        for (const town of towns) {
          const townSlug = town.name.toLowerCase().replace(/\s+/g, '-');
          if (pageSlug.includes(townSlug) || pageSlug.includes(town.name.toLowerCase())) {
            return true;
          }
        }

        return false;
      });

      return editablePages.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        status: page.status as 'published' | 'draft' | 'review',
        authorId: page.author_id || '',
        authorName: 'Unknown', // Will be populated by the wiki service
        createdAt: new Date(page.created_at).toLocaleDateString(),
        updatedAt: new Date(page.updated_at).toLocaleDateString(),
        category: '', // Will be populated by the wiki service
        order: page.order_index || 0
      }));

    } catch (error) {
      console.error('Error getting user editable pages:', error);
      return [];
    }
  }

  /**
   * Check if a user can create pages in a specific category
   */
  async canCreateInCategory(categoryId: string, userId: string): Promise<boolean> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return false;
      }

      // Staff can create anywhere
      if (['admin', 'moderator', 'staff'].includes(profile.role)) {
        return true;
      }

      // Get category details
      const { data: category, error: categoryError } = await supabase
        .from('wiki_categories')
        .select('slug, title')
        .eq('id', categoryId)
        .single();

      if (categoryError || !category) {
        return false;
      }

      // Check if category is related to user's nations/towns
      const categorySlug = category.slug.toLowerCase();
      const categoryTitle = category.title.toLowerCase();

      // Check nations
      const { data: nations } = await supabase
        .from('nations')
        .select('name')
        .eq('leader', profile.full_name);

      for (const nation of nations || []) {
        const nationSlug = nation.name.toLowerCase().replace(/\s+/g, '-');
        if (categorySlug.includes(nationSlug) || categoryTitle.includes(nation.name.toLowerCase())) {
          return true;
        }
      }

      // Check towns
      const { data: towns } = await supabase
        .from('towns')
        .select('name')
        .eq('mayor', profile.full_name);

      for (const town of towns || []) {
        const townSlug = town.name.toLowerCase().replace(/\s+/g, '-');
        if (categorySlug.includes(townSlug) || categoryTitle.includes(town.name.toLowerCase())) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Error checking category creation rights:', error);
      return false;
    }
  }
}

export const editorialRightsService = new EditorialRightsService(); 