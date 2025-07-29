import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Reaction {
  id: string;
  user_id: string;
  post_id?: string;
  reply_id?: string;
  reaction_type: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface ReactionCounts {
  [key: string]: number;
}

export const REACTION_TYPES = {
  like: { label: 'Like', emoji: '👍', points: 1 },
  love: { label: 'Love', emoji: '❤️', points: 2 },
  laugh: { label: 'Laugh', emoji: '😂', points: 1 },
  wow: { label: 'Wow', emoji: '😮', points: 1 },
  sad: { label: 'Sad', emoji: '😢', points: 0 },
  angry: { label: 'Angry', emoji: '😠', points: 0 },
  helpful: { label: 'Helpful', emoji: '✅', points: 3 },
  insightful: { label: 'Insightful', emoji: '💡', points: 5 }
};

export const useForumReactions = (postId?: string, replyId?: string) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({});
  const [userReactions, setUserReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId || replyId) {
      fetchReactions();
    }
  }, [postId, replyId]);

  const fetchReactions = async () => {
    try {
      setLoading(true);
      
      // Get all reactions for this post/reply
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('forum_reactions')
        .select(`
          *,
          user:profiles(id, full_name, email)
        `)
        .eq(postId ? 'post_id' : 'reply_id', postId || replyId);

      if (reactionsError) throw reactionsError;

      setReactions(reactionsData || []);

      // Calculate reaction counts
      const counts: ReactionCounts = {};
      reactionsData?.forEach(reaction => {
        counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
      });
      setReactionCounts(counts);

      // Get current user's reactions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userReactionsData } = await supabase
          .from('forum_reactions')
          .select('*')
          .eq('user_id', user.id)
          .eq(postId ? 'post_id' : 'reply_id', postId || replyId);

        setUserReactions(userReactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove existing reaction of same type if exists
      await removeReaction(reactionType);

      // Add new reaction
      const { data, error } = await supabase
        .from('forum_reactions')
        .insert({
          user_id: user.id,
          post_id: postId,
          reply_id: replyId,
          reaction_type: reactionType
        })
        .select(`
          *,
          user:profiles(id, full_name, email)
        `)
        .single();

      if (error) throw error;

      // Update local state
      setReactions(prev => [...prev, data]);
      setUserReactions(prev => [...prev, data]);
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: (prev[reactionType] || 0) + 1
      }));

      // Update reputation for the post/reply author
      await updateReputationForReaction(data, 'add');

      return data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('forum_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq(postId ? 'post_id' : 'reply_id', postId || replyId)
        .eq('reaction_type', reactionType);

      if (error) throw error;

      // Update local state
      setReactions(prev => prev.filter(r => !(r.user_id === user.id && r.reaction_type === reactionType)));
      setUserReactions(prev => prev.filter(r => r.reaction_type !== reactionType));
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
      }));

      // Update reputation for the post/reply author
      await updateReputationForReaction({ reaction_type: reactionType }, 'remove');

    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  const updateReputationForReaction = async (reaction: any, action: 'add' | 'remove') => {
    try {
      // Get the post or reply to find the author
      let authorId: string | null = null;
      
      if (postId) {
        const { data: post } = await supabase
          .from('forum_posts')
          .select('author_id')
          .eq('id', postId)
          .single();
        authorId = post?.author_id;
      } else if (replyId) {
        const { data: reply } = await supabase
          .from('forum_replies')
          .select('author_id')
          .eq('id', replyId)
          .single();
        authorId = reply?.author_id;
      }

      if (!authorId) return;

      const reactionInfo = REACTION_TYPES[reaction.reaction_type as keyof typeof REACTION_TYPES];
      if (!reactionInfo) return;

      const pointsChange = action === 'add' ? reactionInfo.points : -reactionInfo.points;
      
      // Call the reputation update function
      const { error } = await supabase.rpc('update_user_reputation', {
        target_user_id: authorId,
        points_change: pointsChange,
        event_type: `reaction_${action}`,
        event_description: `${action === 'add' ? 'Received' : 'Lost'} ${reactionInfo.label} reaction`,
        related_post_id: postId || null,
        related_reply_id: replyId || null,
        related_reaction_id: reaction.id || null
      });

      if (error) {
        console.error('Error updating reputation:', error);
      }
    } catch (error) {
      console.error('Error updating reputation for reaction:', error);
    }
  };

  const getUserReaction = (reactionType: string) => {
    return userReactions.find(r => r.reaction_type === reactionType);
  };

  return {
    reactions,
    reactionCounts,
    userReactions,
    loading,
    addReaction,
    removeReaction,
    getUserReaction,
    REACTION_TYPES
  };
}; 