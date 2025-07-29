
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForumReply {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    minecraft_username: string | null;
  };
}

interface CreateReplyData {
  content: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
}

export const useForumReplies = (postId: string) => {
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            author:profiles(id, full_name, email, avatar_url, minecraft_username)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setReplies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchReplies();
    }
  }, [postId]);

  const createReply = async (replyData: CreateReplyData) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          content: replyData.content,
          post_id: replyData.post_id,
          author_id: replyData.author_id,
          parent_id: replyData.parent_id || null
        })
        .select(`
          *,
          author:profiles(id, full_name, email, avatar_url, minecraft_username)
        `)
        .single();

      if (error) throw error;
      setReplies(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { replies, loading, error, createReply };
};
