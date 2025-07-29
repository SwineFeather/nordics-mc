
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useChatConditional } from '@/hooks/useChatConditional';
import { useState, useRef, useEffect } from 'react';
import type { User } from '@/hooks/useAuth';
import { Skeleton } from '../ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface ChatViewProps {
  partnerId: string | null;
  currentUser: User;
}

const fetchPartnerProfile = async (partnerId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', partnerId).single();
    if (error) throw new Error(error.message);
    return data;
}

const ChatView = ({ partnerId, currentUser }: ChatViewProps) => {
  const { messages, sendMessage, isLoading, isSending, isChatActive } = useChatConditional(partnerId);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessageCount = useRef(messages.length);
  const { isUserOnline } = useOnlineStatus();

  const { data: partnerProfile, isLoading: isLoadingProfile } = useQuery({
      queryKey: ['profile', partnerId],
      queryFn: () => fetchPartnerProfile(partnerId!),
      enabled: !!partnerId,
  });

  const isPartnerOnline = partnerId ? isUserOnline(partnerId) : false;

  // Check if user is at bottom of scroll area
  const checkIfAtBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const threshold = 100; // Allow some margin for "at bottom"
        const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
        setIsAtBottom(atBottom);
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive (only if user was at bottom)
  useEffect(() => {
    if (messages.length > prevMessageCount.current && isAtBottom && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ 
          top: viewport.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages, isAtBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight });
      }
    }
  }, [messages.length > 0]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !partnerId) return;
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      // Ensure we scroll to bottom after sending
      setIsAtBottom(true);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!partnerId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <h3 className="text-lg font-semibold">Welcome to your Inbox!</h3>
            <p className="text-muted-foreground">Select a conversation to start chatting.</p>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingProfile) {
    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </header>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-10 w-3/4 rounded-lg ml-auto" />
                <Skeleton className="h-12 w-2/4 rounded-lg" />
            </div>
             <footer className="p-4 border-t bg-background">
                 <Skeleton className="h-10 w-full rounded-lg" />
            </footer>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex items-center gap-3">
        <div className="relative">
          <Avatar>
              <AvatarImage src={partnerProfile?.avatar_url || undefined} />
              <AvatarFallback>{(partnerProfile?.full_name || '??').substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {/* Online status indicator */}
          {isPartnerOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
          )}
        </div>
        <div>
            <p className="font-bold">{partnerProfile?.full_name || 'Unknown User'}</p>
            <p className="text-sm text-muted-foreground">
              {isPartnerOnline ? 'Online' : 'Offline'}
            </p>
        </div>
      </header>
      <ScrollArea 
        className="flex-1 bg-primary/5" 
        ref={scrollAreaRef}
      >
        <div 
          className="p-4 space-y-4"
          onScroll={checkIfAtBottom}
        >
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              {msg.sender_id !== currentUser.id && (
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={partnerProfile?.avatar_url || undefined} />
                    <AvatarFallback>{(partnerProfile?.full_name || '??').substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isPartnerOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 border border-background rounded-full"></div>
                  )}
                </div>
              )}
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender_id === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Type a message..." 
              autoComplete="off" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button size="icon" type="submit" disabled={isSending}>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatView;
