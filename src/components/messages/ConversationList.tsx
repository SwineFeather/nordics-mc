
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations } from '@/hooks/useConversations';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (partnerId: string) => void;
  selectedPartnerId: string | null;
}

const ConversationList = ({ onSelectConversation, selectedPartnerId }: ConversationListProps) => {
  const { conversations, isLoading } = useConversations();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="p-4 border-b"><h2 className="text-xl font-bold">Messages</h2></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
      return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No conversations yet.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <ScrollArea className="flex-1">
        <div>
          {conversations.map((convo) => {
            const isUnread = !convo.lastMessage.is_read && convo.lastMessage.receiver_id === user?.id;
            return (
                <div
                key={convo.partner.id}
                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 ${selectedPartnerId === convo.partner.id ? 'bg-muted' : ''}`}
                onClick={() => onSelectConversation(convo.partner.id)}
                >
                <Avatar>
                    <AvatarImage src={convo.partner.avatar_url || undefined} />
                    <AvatarFallback>{(convo.partner.full_name || '??').substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className={`font-semibold truncate ${isUnread ? 'text-primary' : ''}`}>
                            {convo.partner.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                           {formatDistanceToNow(new Date(convo.lastMessage.created_at), { addSuffix: true })}
                        </p>
                    </div>
                    <p className={`text-sm text-muted-foreground truncate ${isUnread ? 'font-bold text-foreground' : ''}`}>
                      {convo.lastMessage.sender_id === user?.id && "You: "}
                      {convo.lastMessage.content}
                    </p>
                </div>
                 {isUnread && <div className="w-2.5 h-2.5 bg-primary rounded-full self-center ml-2 flex-shrink-0"></div>}
                </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
