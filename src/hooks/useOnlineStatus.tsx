
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnlineUser {
  user_id: string;
  last_seen: string;
}

export const useOnlineStatus = () => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Track our own presence
    const trackPresence = async () => {
      const channel = supabase.channel('online_users');
      
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

      // Listen for presence changes
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const userIds = new Set<string>();
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              userIds.add(presence.user_id);
            }
          });
        });
        
        setOnlineUserIds(userIds);
        console.log('Online users updated:', Array.from(userIds));
      });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    trackPresence();
  }, [user]);

  // Memoize the onlineUsers array to prevent unnecessary re-renders
  const onlineUsers = useMemo(() => {
    return Array.from(onlineUserIds);
  }, [onlineUserIds]);

  const isUserOnline = (userId: string) => {
    return onlineUserIds.has(userId);
  };

  return {
    onlineUsers,
    isUserOnline,
  };
};
