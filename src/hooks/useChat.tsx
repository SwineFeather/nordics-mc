
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect, useRef } from 'react';
import { Message } from './useMessageNotifications';

const fetchMessages = async (userId: string, partnerId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Message[]) || [];
};

const markMessagesAsRead = async (userId: string, partnerId: string) => {
    await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', userId)
        .eq('is_read', false);
};

export const useChat = (partnerId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['chat', partnerId];
  const channelRef = useRef<any>(null);

  const { data: messages, ...queryInfo } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user || !partnerId) return [];
      return fetchMessages(user.id, partnerId);
    },
    enabled: !!user && !!partnerId,
    staleTime: 0, // Always refetch to get latest messages
    // Removed 2-second polling - relying on real-time subscriptions only
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !partnerId) throw new Error('User or partner not defined');

      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: user.id, receiver_id: partnerId, content })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  useEffect(() => {
    if (user && partnerId) {
      const markAsReadAndInvalidate = async () => {
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', partnerId)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        if (count && count > 0) {
            await markMessagesAsRead(user.id, partnerId);
            // Invalidate notifications and conversation list to update unread status
            await queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      };
      markAsReadAndInvalidate();
    }
  }, [user, partnerId, queryClient]);

  useEffect(() => {
    if (!user || !partnerId) return;
    
    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('Removing existing chat channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Create a unique channel name for this specific chat
    const channelName = `chat_${user.id}_${partnerId}_${Date.now()}`;
    console.log('Creating new chat channel:', channelName);
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
      },
      (payload) => {
        console.log('Real-time message update for chat:', payload);
        
        // Immediately invalidate and refetch the chat messages
        queryClient.invalidateQueries({ queryKey });
        // Also invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages', user.id] });
        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      }
    ).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to chat channel: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Chat subscription error for ${channelName}:`, status);
        // Try to resubscribe on error
        setTimeout(() => {
          console.log('Attempting to resubscribe...');
          queryClient.invalidateQueries({ queryKey });
        }, 1000);
      }
    });

    return () => {
      console.log(`Cleaning up chat channel: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, partnerId, queryClient, queryKey]);

  return { 
    messages: messages || [], 
    sendMessage: sendMessageMutation.mutateAsync, 
    isSending: sendMessageMutation.isPending,
    ...queryInfo 
  };
};
