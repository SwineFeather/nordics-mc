import { supabase } from '@/integrations/supabase/client';
import { WikiComment } from '@/types/wiki';

export class WikiCommentService {
  // Get all comments for a page
  static async getComments(pageId: string): Promise<WikiComment[]> {
    try {
      const { data, error } = await supabase
        .from('wiki_comments')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            minecraft_username,
            username,
            avatar_url
          )
        `)
        .eq('page_id', pageId)
        .is('parent_id', null) // Only get top-level comments
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const comments = data?.map(comment => ({
        ...comment,
        author_name: comment.profiles?.username || comment.profiles?.minecraft_username || comment.profiles?.full_name || 'Anonymous',
        author_avatar: comment.profiles?.avatar_url,
        replies: [] // Will be populated separately
      })) || [];

      // Get replies for each comment
      for (const comment of comments) {
        comment.replies = await this.getReplies(comment.id);
      }

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Get replies for a specific comment
  static async getReplies(commentId: string): Promise<WikiComment[]> {
    try {
      const { data, error } = await supabase
        .from('wiki_comments')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            minecraft_username,
            username,
            avatar_url
          )
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(comment => ({
        ...comment,
        author_name: comment.profiles?.username || comment.profiles?.minecraft_username || comment.profiles?.full_name || 'Anonymous',
        author_avatar: comment.profiles?.avatar_url,
        replies: []
      })) || [];
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  }

  // Create a new comment
  static async createComment(comment: Omit<WikiComment, 'id' | 'created_at' | 'updated_at'>): Promise<WikiComment> {
    try {
      const { data, error } = await supabase
        .from('wiki_comments')
        .insert({
          page_id: comment.page_id,
          author_id: comment.author_id,
          parent_id: comment.parent_id,
          content: comment.content,
          is_resolved: comment.is_resolved || false,
          is_pinned: comment.is_pinned || false,
          is_moderated: comment.is_moderated || false
        })
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            minecraft_username,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.profiles?.username || data.profiles?.minecraft_username || data.profiles?.full_name || 'Anonymous',
        author_avatar: data.profiles?.avatar_url,
        replies: []
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Update a comment
  static async updateComment(commentId: string, updates: Partial<WikiComment>): Promise<WikiComment> {
    try {
      const { data, error } = await supabase
        .from('wiki_comments')
        .update({
          content: updates.content,
          is_resolved: updates.is_resolved,
          is_pinned: updates.is_pinned,
          is_moderated: updates.is_moderated,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            minecraft_username,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.profiles?.username || data.profiles?.minecraft_username || data.profiles?.full_name || 'Anonymous',
        author_avatar: data.profiles?.avatar_url,
        replies: []
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete a comment
  static async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wiki_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get comment count for a page
  static async getCommentCount(pageId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('wiki_comments')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', pageId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }
} 