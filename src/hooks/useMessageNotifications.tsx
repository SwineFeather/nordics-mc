
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimeChannel, User } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  content: string;
  context: string | null;
  created_at: string;
  is_read: boolean;
  sender_profile?: { full_name?: string | null; avatar_url?: string | null; username?: string };
}

interface MessageNotificationsContextValue {
  unreadMessages: Message[];
  unreadCount: number;
  fetchUnreadMessages: (user: User) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markAllMessagesAsRead: () => Promise<void>;
  showNotificationsModal: boolean;
  setShowNotificationsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const MessageNotificationsContext = createContext<MessageNotificationsContextValue | undefined>(undefined);

export const MessageNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get auth state directly from Supabase instead of using useAuth to avoid circular dependency
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        fetchUnreadMessages(session.user);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setCurrentUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchUnreadMessages(session.user);
          }, 0);
        } else {
          setUnreadMessages([]);
          setUnreadCount(0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUnreadMessages = useCallback(async (user: User) => {
    if (!user) return;
    try {
      const { data: messages, error: messagesError, count } = await supabase
        .from('messages')
        .select(`*`, { count: 'exact' })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching unread messages:', messagesError);
        throw messagesError;
      }

      if (messages && messages.length > 0) {
        const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds);

        if (profilesError) {
          console.error('Error fetching sender profiles:', profilesError);
          throw profilesError;
        }

        const profilesMap = new Map(profiles.map(p => [p.id, p]));
        const formattedData = messages.map(msg => ({
          ...msg,
          sender_profile: {
            full_name: profilesMap.get(msg.sender_id)?.full_name || 'Unknown Sender',
            avatar_url: profilesMap.get(msg.sender_id)?.avatar_url || undefined,
            username: profilesMap.get(msg.sender_id)?.full_name || 'Unknown'
          }
        }));
        
        setUnreadMessages(formattedData as Message[]);
      } else {
        setUnreadMessages([]);
      }
      
      setUnreadCount(count ?? 0);

    } catch (error) {
      console.error('Failed to fetch unread messages (provider):', error);
    }
  }, []);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('receiver_id', currentUser.id); 

      if (error) throw error;
      
      await fetchUnreadMessages(currentUser);
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error("Could not mark message as read.");
    }
  }, [currentUser, fetchUnreadMessages]);
  
  const markAllMessagesAsRead = useCallback(async () => {
    if (!currentUser || unreadMessages.length === 0) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      if (error) throw error;

      setUnreadMessages([]);
      setUnreadCount(0);
      toast.success("All messages marked as read.");
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      toast.error("Could not mark all messages as read.");
    }
  }, [currentUser, unreadMessages.length]);

  useEffect(() => {
    let channel: RealtimeChannel | undefined;

    if (currentUser) {
      // Remove any existing channel first to prevent multiple subscriptions
      const existingChannel = supabase.getChannels().find(ch => ch.topic === `new_messages_for_${currentUser.id}`);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      channel = supabase
        .channel(`new_messages_for_${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`,
          },
          async (payload) => {
            console.log('New message received (realtime):', payload);
            const newMessage = payload.new as Message;

            let senderName = 'Someone';
            if (newMessage.sender_id) {
                try {
                    const { data: senderProfileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, email')
                        .eq('id', newMessage.sender_id)
                        .single();
                    if (profileError) console.error("Error fetching sender profile for toast:", profileError);
                    if (senderProfileData) {
                        senderName = senderProfileData.full_name || senderProfileData.email || 'Someone';
                    }
                } catch(e) { console.error("Exception fetching sender profile for toast:", e); }
            }
            
            toast.message(`New message from ${senderName}`, {
              description: newMessage.subject || newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              action: {
                label: 'View',
                onClick: () => {
                  markMessageAsRead(newMessage.id);
                  setShowNotificationsModal(true);
                },
              },
            });
            fetchUnreadMessages(currentUser); 
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to new messages for user ${currentUser.id}`);
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Realtime subscription error for new_messages_for_${currentUser.id}:`, err, status);
          }
        });
    }
      
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser?.id]); // Only depend on user ID to prevent unnecessary re-subscriptions

  const value = {
    unreadMessages,
    unreadCount,
    fetchUnreadMessages,
    markMessageAsRead,
    markAllMessagesAsRead,
    showNotificationsModal,
    setShowNotificationsModal,
  };

  return <MessageNotificationsContext.Provider value={value}>{children}</MessageNotificationsContext.Provider>;
};

export const useMessageNotifications = (): MessageNotificationsContextValue => {
  const context = useContext(MessageNotificationsContext);
  if (context === undefined) {
    throw new Error('useMessageNotifications must be used within a MessageNotificationsProvider');
  }
  return context;
};
