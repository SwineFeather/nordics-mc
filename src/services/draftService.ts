import { supabase } from '@/integrations/supabase/client';

export interface PostDraft {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  content: string;
  tags: string[];
  post_type: string;
  created_at: string;
  updated_at: string;
}

export class DraftService {
  private static instance: DraftService;

  static getInstance(): DraftService {
    if (!DraftService.instance) {
      DraftService.instance = new DraftService();
    }
    return DraftService.instance;
  }

  // Save draft
  async saveDraft(draft: Omit<PostDraft, 'id' | 'created_at' | 'updated_at'>): Promise<PostDraft> {
    try {
      const { data, error } = await supabase
        .from('post_drafts')
        .upsert({
          user_id: draft.user_id,
          category_id: draft.category_id,
          title: draft.title,
          content: draft.content,
          tags: draft.tags,
          post_type: draft.post_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,category_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  // Get user's drafts
  async getUserDrafts(userId: string): Promise<PostDraft[]> {
    try {
      const { data, error } = await supabase
        .from('post_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching drafts:', error);
      return [];
    }
  }

  // Get draft by category
  async getDraftByCategory(userId: string, categoryId: string): Promise<PostDraft | null> {
    try {
      const { data, error } = await supabase
        .from('post_drafts')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching draft by category:', error);
      return null;
    }
  }

  // Delete draft
  async deleteDraft(draftId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }

  // Auto-save draft (with debouncing)
  private autoSaveTimeout: NodeJS.Timeout | null = null;

  autoSaveDraft(
    draft: Omit<PostDraft, 'id' | 'created_at' | 'updated_at'>,
    delay: number = 2000
  ): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveDraft(draft).catch(console.error);
    }, delay);
  }

  // Clear auto-save timeout
  clearAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }
}

export const draftService = DraftService.getInstance(); 