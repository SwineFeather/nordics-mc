
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect, useRef } from 'react';
import { Message } from './useMessageNotifications';

export interface Conversation {
  partner: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  lastMessage: Message;
}

async function fetchUserMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

async function fetchProfiles(partnerIds: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', partnerIds);
  if (error) throw new Error(error.message);
  return data || [];
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['conversations', user?.id];
  const channelRef = useRef<any>(null);

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: () => {
      if (!user) return [];
      return fetchUserMessages(user.id);
    },
    enabled: !!user,
  });

  const conversationPartners = React.useMemo(() => {
    if (!messages || !user) return { partnerIds: [], conversationsMap: new Map() };
    const conversationsMap = new Map<string, Message>();
    for (const message of messages) {
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, message);
      }
    }
    return { partnerIds: Array.from(conversationsMap.keys()), conversationsMap };
  }, [messages, user]);

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['profiles', conversationPartners.partnerIds],
    queryFn: () => fetchProfiles(conversationPartners.partnerIds),
    enabled: conversationPartners.partnerIds.length > 0,
  });

  const conversations = React.useMemo((): Conversation[] => {
    if (!profiles || !user) return [];
    const profilesMap = new Map(profiles.map(p => [p.id, p]));
    return Array.from(conversationPartners.conversationsMap.entries())
      .map(([partnerId, lastMessage]) => ({
        partner: profilesMap.get(partnerId) || { id: partnerId },
        lastMessage,
      }))
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
  }, [profiles, conversationPartners.conversationsMap, user]);

  useEffect(() => {
    if (!user) return;
    
    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('Removing existing conversations channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channelName = `conversations_for_${user.id}_${Date.now()}`;
    console.log('Creating new conversations channel:', channelName);
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
      console.log('Messages table changed, invalidating conversations');
      queryClient.invalidateQueries({ queryKey: ['messages', user.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
    }).subscribe((status) => {
      console.log('Conversations subscription status:', status);
    });

    return () => {
      console.log('Cleaning up conversations channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, queryClient]);

  return { conversations, isLoading: isLoadingMessages || isLoadingProfiles };
};
