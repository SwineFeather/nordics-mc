import React from 'react';
import { ReactionButton } from './ReactionButton';
import { REACTION_TYPES } from '@/hooks/useForumReactions';

interface ReactionBarProps {
  postId?: string;
  replyId?: string;
  compact?: boolean;
  showAll?: boolean;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  postId,
  replyId,
  compact = false,
  showAll = false
}) => {
  const reactionTypes = showAll 
    ? Object.keys(REACTION_TYPES)
    : ['like', 'love', 'helpful', 'insightful']; // Show most common reactions by default

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {reactionTypes.map((reactionType) => (
        <ReactionButton
          key={reactionType}
          reactionType={reactionType}
          postId={postId}
          replyId={replyId}
          compact={compact}
        />
      ))}
    </div>
  );
}; 