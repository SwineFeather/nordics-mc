import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForumTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export const useForumTags = () => {
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_tags')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setTags(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const addTagToPost = async (postId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('forum_post_tags')
        .insert({ post_id: postId, tag_id: tagId });

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  const removeTagFromPost = async (postId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('forum_post_tags')
        .delete()
        .eq('post_id', postId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  const getPopularTags = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('forum_post_tags')
        .select(`
          tag_id,
          tags:forum_tags(name, color)
        `)
        .limit(limit);

      if (error) throw error;
      
      // Count occurrences and return popular tags
      const tagCounts = data?.reduce((acc, item) => {
        const tagName = item.tags?.name;
        if (tagName) {
          acc[tagName] = (acc[tagName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (err) {
      console.error('Error fetching popular tags:', err);
      return [];
    }
  };

  return { 
    tags, 
    loading, 
    error, 
    addTagToPost, 
    removeTagFromPost, 
    getPopularTags 
  };
}; 