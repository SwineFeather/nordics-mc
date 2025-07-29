import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForumReactions, REACTION_TYPES } from '@/hooks/useForumReactions';
import { useAuth } from '@/hooks/useAuth';

interface ReactionButtonProps {
  reactionType: string;
  postId?: string;
  replyId?: string;
  compact?: boolean;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  reactionType,
  postId,
  replyId,
  compact = false
}) => {
  const { user } = useAuth();
  const { reactionCounts, userReactions, addReaction, removeReaction, loading } = useForumReactions(postId, replyId);
  
  const reactionInfo = REACTION_TYPES[reactionType as keyof typeof REACTION_TYPES];
  const count = reactionCounts[reactionType] || 0;
  const hasUserReacted = userReactions.some(r => r.reaction_type === reactionType);

  if (!reactionInfo) return null;

  const handleClick = async () => {
    if (!user) return;
    
    try {
      if (hasUserReacted) {
        await removeReaction(reactionType);
      } else {
        await addReaction(reactionType);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  if (compact) {
    return (
      <Button
        variant={hasUserReacted ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={loading || !user}
        className="h-7 px-2 text-xs"
      >
        <span className="mr-1">{reactionInfo.emoji}</span>
        {count > 0 && <span>{count}</span>}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={hasUserReacted ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={loading || !user}
        className="h-8 px-3"
      >
        <span className="mr-1">{reactionInfo.emoji}</span>
        <span className="text-sm">{reactionInfo.label}</span>
      </Button>
      {count > 0 && (
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      )}
    </div>
  );
}; 