import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smile, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { forumNotificationService } from '@/services/forumNotificationService';
import { useNotifications } from '@/hooks/useNotifications';

interface PostReactionsProps {
  postId: string;
  onReactionChange?: () => void;
}

interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

const PostReactions = ({ postId, onReactionChange }: PostReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { createNotification } = useNotifications();

  const commonEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥'];

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      // First, fetch reactions without join to avoid 400 error
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('forum_post_reactions')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (reactionsError) {
        console.error('fetchReactions error:', reactionsError);
        throw reactionsError;
      }

      // Then fetch user profiles separately if we have reactions
      if (reactionsData && reactionsData.length > 0) {
        const userIds = [...new Set(reactionsData.map(r => r.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('fetchProfiles error:', profilesError);
        }

        // Combine reactions with user data
        const reactionsWithUsers = reactionsData.map(reaction => ({
          ...reaction,
          user: profilesData?.find(p => p.id === reaction.user_id) || {
            id: reaction.user_id,
            full_name: null,
            email: 'Unknown User'
          }
        }));

        console.log('fetchReactions data:', reactionsWithUsers);
        setReactions(reactionsWithUsers);
      } else {
        console.log('No reactions found for post:', postId);
        setReactions([]);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
      setReactions([]);
    }
  };

  const addReaction = async (emoji: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('forum_post_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('forum_post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            emoji: emoji
          });

        if (error) throw error;

        // Fetch post to get author_id
        const { data: post, error: postError } = await supabase
          .from('forum_posts')
          .select('author_id, title, category_id')
          .eq('id', postId)
          .single();
        if (!postError && post && post.author_id) {
          await forumNotificationService.createReactionNotification(
            postId,
            post.author_id,
            user.id,
            emoji
          );
                  // General notification
        if (post.author_id !== user.id) {
          console.log('Creating reaction notification for user:', post.author_id);
          await createNotification(
            post.author_id,
            'forum_reaction',
            'New reaction to your post',
            `${user.email} reacted to your post "${post.title}" with ${emoji}`,
            { postId, emoji, categoryId: post.category_id },
            'low'
          );
          console.log('Reaction notification created successfully');
        }
        }
      }

      await fetchReactions();
      onReactionChange?.();
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReactionCounts = () => {
    const counts: { [emoji: string]: { count: number; users: string[] } } = {};
    
    reactions.forEach(reaction => {
      if (!counts[reaction.emoji]) {
        counts[reaction.emoji] = { count: 0, users: [] };
      }
      counts[reaction.emoji].count++;
      if (reaction.user?.full_name) {
        counts[reaction.emoji].users.push(reaction.user.full_name);
      } else if (reaction.user?.email) {
        counts[reaction.emoji].users.push(reaction.user.email);
      }
    });

    return counts;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.user_id === user?.id && r.emoji === emoji);
  };

  const reactionCounts = getReactionCounts();

  return (
    <div className="flex items-center space-x-2">
      {/* Reaction Buttons */}
      {Object.entries(reactionCounts).map(([emoji, { count, users }]) => (
        <Button
          key={emoji}
          variant={hasUserReacted(emoji) ? "default" : "outline"}
          size="sm"
          onClick={() => addReaction(emoji)}
          disabled={loading}
          className="h-8 px-2 text-sm"
          title={`${users.join(', ')} reacted with ${emoji}`}
        >
          <span className="mr-1">{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}
      {/* Debug: Show raw data if no reactions */}
      {reactions.length === 0 && (
        <span className="text-xs text-muted-foreground">No reactions. (Debug: {JSON.stringify(reactions)})</span>
      )}
      {/* Add Reaction Button */}
      <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Reaction</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => {
                  addReaction(emoji);
                  setShowEmojiPicker(false);
                }}
                className="h-12 w-12 p-0 text-xl"
                disabled={loading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostReactions; 