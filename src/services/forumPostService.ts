import { supabase } from '@/integrations/supabase/client';

export interface PostVersion {
  id: string;
  post_id: string;
  title: string;
  content: string;
  tags: string[];
  post_type: string;
  version_number: number;
  created_at: string;
  created_by: string;
  change_summary?: string;
}

export interface PostCollaboration {
  id: string;
  post_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PostCollaborationWithUser extends PostCollaboration {
  user?: {
    username: string;
    avatar_url?: string;
  };
  invited_by_user?: {
    username: string;
  };
}

export interface PostAnalytics {
  post_id: string;
  view_count: number;
  unique_viewers: number;
  time_spent_reading: number;
  scroll_depth: number;
  engagement_score: number;
  last_updated: string;
}

class ForumPostService {

  // Version History Management
  async createPostVersion(postId: string, data: {
    title: string;
    content: string;
    tags: string[];
    post_type: string;
    change_summary?: string;
  }, userId: string): Promise<PostVersion> {
    try {
      // Get current version number
      const { data: currentVersions } = await supabase
        .from('forum_post_versions')
        .select('version_number')
        .eq('post_id', postId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = currentVersions?.[0]?.version_number + 1 || 1;

      const { data: version, error } = await supabase
        .from('forum_post_versions')
        .insert({
          post_id: postId,
          title: data.title,
          content: data.content,
          tags: data.tags,
          post_type: data.post_type,
          version_number: nextVersion,
          created_by: userId,
          change_summary: data.change_summary
        })
        .select()
        .single();

      if (error) throw error;
      return version;
    } catch (error) {
      console.error('Error creating post version:', error);
      throw error;
    }
  }

  async getPostVersions(postId: string): Promise<PostVersion[]> {
    try {
      const { data, error } = await supabase
        .from('forum_post_versions')
        .select(`
          *,
          created_by_user:profiles!forum_post_versions_created_by_fkey(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching post versions:', error);
      throw error;
    }
  }

  async restorePostVersion(postId: string, versionId: string, userId: string): Promise<void> {
    try {
      // Get the version to restore
      const { data: version, error: versionError } = await supabase
        .from('forum_post_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Create a new version with the restored content
      await this.createPostVersion(postId, {
        title: version.title,
        content: version.content,
        tags: version.tags,
        post_type: version.post_type,
        change_summary: `Restored from version ${version.version_number}`
      }, userId);

      // Update the main post
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({
          title: version.title,
          content: version.content,
          tags: version.tags,
          post_type: version.post_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error restoring post version:', error);
      throw error;
    }
  }

  // Collaboration Management
  async inviteCollaborator(postId: string, userId: string, role: 'viewer' | 'editor' | 'admin', invitedBy: string): Promise<PostCollaboration> {
    try {
      const { data, error } = await supabase
        .from('forum_post_collaborations')
        .insert({
          post_id: postId,
          user_id: userId,
          role,
          invited_by: invitedBy,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  }

  async getPostCollaborations(postId: string): Promise<PostCollaborationWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('forum_post_collaborations')
        .select(`
          *,
          user:profiles!forum_post_collaborations_user_id_fkey(username, avatar_url),
          invited_by_user:profiles!forum_post_collaborations_invited_by_fkey(username)
        `)
        .eq('post_id', postId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching post collaborations:', error);
      throw error;
    }
  }

  async acceptCollaborationInvite(collaborationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forum_post_collaborations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', collaborationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error accepting collaboration invite:', error);
      throw error;
    }
  }

  async declineCollaborationInvite(collaborationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forum_post_collaborations')
        .update({
          status: 'declined'
        })
        .eq('id', collaborationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error declining collaboration invite:', error);
      throw error;
    }
  }

  // Analytics Tracking
  async trackPostView(postId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forum_post_analytics')
        .upsert({
          post_id: postId,
          view_count: 1,
          unique_viewers: userId ? 1 : 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'post_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }

  async updatePostAnalytics(postId: string, data: Partial<PostAnalytics>): Promise<void> {
    try {
      const { error } = await supabase
        .from('forum_post_analytics')
        .update({
          ...data,
          last_updated: new Date().toISOString()
        })
        .eq('post_id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating post analytics:', error);
      throw error;
    }
  }

  async getPostAnalytics(postId: string): Promise<PostAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('forum_post_analytics')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      return null;
    }
  }

  // Advanced Search with AI
  async searchPostsWithAI(query: string, filters: any = {}): Promise<any[]> {
    try {
      // This would integrate with an AI service for semantic search
      // For now, we'll use enhanced text search
      let searchQuery = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(username, avatar_url),
          category:forum_categories(name, slug)
        `);

      if (query.trim()) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      if (filters.categories?.length > 0) {
        searchQuery = searchQuery.in('category_id', filters.categories);
      }

      if (filters.tags?.length > 0) {
        searchQuery = searchQuery.overlaps('tags', filters.tags);
      }

      if (filters.authors?.length > 0) {
        searchQuery = searchQuery.in('author_id', filters.authors);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching posts with AI:', error);
      throw error;
    }
  }

  // Content Quality Analysis
  async analyzePostQuality(content: string): Promise<{
    readability_score: number;
    word_count: number;
    estimated_read_time: number;
    suggestions: string[];
  }> {
    try {
      // Simple readability analysis
      const words = content.split(/\s+/).filter(word => word.length > 0);
      const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      const paragraphs = content.split(/\n\s*\n/).filter(para => para.trim().length > 0);

      const avgWordsPerSentence = words.length / sentences.length;
      const avgSentencesPerParagraph = sentences.length / paragraphs.length;
      
      // Flesch Reading Ease approximation
      const readability_score = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSentencesPerParagraph)
      ));

      const estimated_read_time = Math.ceil(words.length / 200); // 200 words per minute

      const suggestions = [];
      if (avgWordsPerSentence > 20) {
        suggestions.push('Consider breaking down long sentences for better readability');
      }
      if (avgSentencesPerParagraph > 5) {
        suggestions.push('Consider splitting long paragraphs');
      }
      if (words.length < 50) {
        suggestions.push('Consider adding more detail to your post');
      }

      return {
        readability_score: Math.round(readability_score),
        word_count: words.length,
        estimated_read_time,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing post quality:', error);
      return {
        readability_score: 0,
        word_count: 0,
        estimated_read_time: 0,
        suggestions: []
      };
    }
  }

  // Auto-save with Conflict Resolution
  async autoSavePost(postId: string, data: {
    title: string;
    content: string;
    tags: string[];
    post_type: string;
  }, userId: string): Promise<void> {
    try {
      // Check for conflicts
      const { data: currentPost } = await supabase
        .from('forum_posts')
        .select('updated_at, last_edited_by')
        .eq('id', postId)
        .single();

      if (currentPost && currentPost.last_edited_by !== userId) {
        // Check if someone else edited recently (within 5 minutes)
        const lastEdit = new Date(currentPost.updated_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastEdit.getTime()) / (1000 * 60);

        if (diffMinutes < 5) {
          throw new Error('Post was recently edited by another user. Please refresh and try again.');
        }
      }

      // Create version and update post
      await this.createPostVersion(postId, data, userId);
      
      const { error } = await supabase
        .from('forum_posts')
        .update({
          title: data.title,
          content: data.content,
          tags: data.tags,
          post_type: data.post_type,
          updated_at: new Date().toISOString(),
          last_edited_by: userId
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error auto-saving post:', error);
      throw error;
    }
  }
}

export const forumPostService = new ForumPostService(); 