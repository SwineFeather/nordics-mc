import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { forumNotificationService } from '@/services/forumNotificationService';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  post_type?: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    minecraft_username: string | null;
  };
  reply_count?: number;
}

interface CreatePostData {
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  tags?: string[];
  post_type?: string;
}

interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
  post_type?: string;
}

const viewedPosts = new Set<string>();

export const useForumPosts = (categoryId?: string) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createNotification } = useNotifications();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('forum_posts')
          .select(`
            *,
            author:profiles(id, full_name, email, avatar_url, minecraft_username)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId]);

  const createPost = async (postData: CreatePostData) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          category_id: postData.category_id,
          author_id: postData.author_id,
          tags: postData.tags || [],
          post_type: postData.post_type || 'discussion'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Process mentions in the post content
      await forumNotificationService.processMentions(
        postData.content,
        data.id,
        postData.author_id
      );
      
      setPosts(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updatePost = async (postId: string, updateData: UpdatePostData) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...data } : post
      ));
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      throw err;
    }
  };

  return { posts, loading, error, createPost, updatePost, deletePost };
};

export const getSavedPosts = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_forum_posts')
    .select(`post:forum_posts(*, author:profiles(id, full_name, email, avatar_url, minecraft_username))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Flatten the post object
  return (data || []).map((row: any) => row.post);
};

export const savePost = async (userId: string, postId: string) => {
  const { error } = await supabase
    .from('saved_forum_posts')
    .insert({ user_id: userId, post_id: postId });
  if (error) throw error;
};

export const unsavePost = async (userId: string, postId: string) => {
  const { error } = await supabase
    .from('saved_forum_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
};

export const getTrendingPosts = async () => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`*, author:profiles(id, full_name, email, avatar_url, minecraft_username)`)
    .order('view_count', { ascending: false })
    .order('reply_count', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
};

export const getRecentPosts = async () => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`*, author:profiles(id, full_name, email, avatar_url, minecraft_username)`)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
};

export const incrementPostViewCount = async (postId: string) => {
  // Rate-limit: only increment once per session (per user)
  if (viewedPosts.has(postId)) return;
  viewedPosts.add(postId);
  // Optionally, persist to localStorage for longer deduplication
  try {
    const viewed = JSON.parse(localStorage.getItem('viewedForumPosts') || '[]');
    if (viewed.includes(postId)) return;
    viewed.push(postId);
    localStorage.setItem('viewedForumPosts', JSON.stringify(viewed));
  } catch {}
  // Use a single update statement to increment view_count by 1
  const { data, error } = await supabase
    .from('forum_posts')
    .select('view_count')
    .eq('id', postId)
    .single();
  if (error) throw error;
  const current = data?.view_count || 0;
  const { error: updateError } = await supabase
    .from('forum_posts')
    .update({ view_count: current + 1 })
    .eq('id', postId);
  if (updateError) throw updateError;
};

export const searchPosts = async (query: string, filters?: any, limit = 20) => {
  if (!query.trim() && !filters) return [];
  
  try {
    let queryBuilder = supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, full_name, email, avatar_url, minecraft_username)
      `);

    // Apply text search if query exists
    if (query.trim()) {
      queryBuilder = queryBuilder.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply basic filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        queryBuilder = queryBuilder.in('category_id', filters.categories);
      }

      if (filters.authors && filters.authors.length > 0) {
        queryBuilder = queryBuilder.in('author_id', filters.authors);
      }

      if (filters.dateFrom) {
        queryBuilder = queryBuilder.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        queryBuilder = queryBuilder.lte('created_at', filters.dateTo.toISOString());
      }
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'oldest':
          queryBuilder = queryBuilder.order('created_at', { ascending: true });
          break;
        case 'most_replies':
          queryBuilder = queryBuilder.order('reply_count', { ascending: false });
          break;
        case 'most_views':
          queryBuilder = queryBuilder.order('view_count', { ascending: false });
          break;
        case 'relevance':
        default:
          queryBuilder = queryBuilder.order('is_pinned', { ascending: false })
                                   .order('created_at', { ascending: false });
          break;
      }
    } else {
      queryBuilder = queryBuilder.order('is_pinned', { ascending: false })
                               .order('created_at', { ascending: false });
    }

    const { data, error } = await queryBuilder.limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
};
