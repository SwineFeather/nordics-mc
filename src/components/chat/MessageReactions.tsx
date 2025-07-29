import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MessageReactionsProps {
  messageId: string;
  onReact?: (messageId: string, emoji: string) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageReactions = ({ messageId, onReact }: MessageReactionsProps) => {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
    onReact?.(messageId, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs bg-gray-100 hover:bg-gray-200"
          onClick={() => handleReaction(emoji)}
        >
          {emoji} {count}
        </Button>
      ))}
      
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
        >
          😊
        </Button>
        
        {showReactionPicker && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-50">
            {REACTION_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
