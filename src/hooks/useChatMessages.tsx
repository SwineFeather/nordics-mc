
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  is_saved: boolean;
  is_edited: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export const useChatMessages = (channelId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['chatMessages', channelId];
  const channelRef = useRef<any>(null);

  const { data: messages, ...queryInfo } = useQuery({
    queryKey,
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!channelId) return [];
      
      // First get the messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (messagesError) throw new Error(messagesError.message);
      
      if (!messagesData || messagesData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
      
      // Get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (profilesError) throw new Error(profilesError.message);

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Get saved message IDs for current user
      let savedMessageIds = new Set();
      if (user) {
        const { data: savedData } = await supabase
          .from('saved_chat_messages')
          .select('message_id')
          .eq('user_id', user.id);
        
        savedMessageIds = new Set(savedData?.map(item => item.message_id) || []);
      }

      // Combine messages with author data and saved status
      const messagesWithAuthors = messagesData.map(message => ({
        ...message,
        author: profilesMap.get(message.user_id),
        is_saved: savedMessageIds.has(message.id)
      }));

      return messagesWithAuthors;
    },
    enabled: !!channelId,
    staleTime: 0,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !channelId) throw new Error('User or channel not defined');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ 
          channel_id: channelId, 
          user_id: user.id, 
          content 
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const saveMessageMutation = useMutation({
    mutationFn: async ({ messageId, shouldSave }: { messageId: string; shouldSave: boolean }) => {
      if (!user) throw new Error('User not defined');

      if (shouldSave) {
        const { error } = await supabase
          .from('saved_chat_messages')
          .insert({ message_id: messageId, user_id: user.id });

        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('saved_chat_messages')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id);

        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Real-time subscription
  useEffect(() => {
    if (!channelId || !user) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = `chat_messages_${channelId}_${Date.now()}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      },
      () => {
        queryClient.invalidateQueries({ queryKey });
      }
    ).subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelId, user, queryClient, queryKey]);

  return { 
    messages: messages || [], 
    sendMessage: sendMessageMutation.mutateAsync,
    saveMessage: saveMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    ...queryInfo 
  };
};
