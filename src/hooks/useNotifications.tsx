import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  priority: string;
  read_at?: string;
  sent_at: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: string;
  target_id: string;
  frequency: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  mention_notifications: boolean;
  reply_notifications: boolean;
  like_notifications: boolean;
  moderation_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchNotifications = async (limit = 50) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Database error fetching notifications:', error);
        // If table doesn't exist, just return empty array
        if (error.code === '42P01') { // undefined_table
          setNotifications([]);
          return;
        }
        throw error;
      }
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        user_id_param: user.id
      });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist, create default settings
        if (error.code === '42P01') { // undefined_table
          console.warn('notification_settings table not found, using default settings');
          setSettings({
            id: '',
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            in_app_notifications: true,
            daily_digest: false,
            weekly_digest: false,
            mention_notifications: true,
            reply_notifications: true,
            like_notifications: true,
            moderation_notifications: true,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            timezone: 'UTC',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          return;
        }
        
        // Handle 406 Not Acceptable error (usually permission issues)
        if (error.code === '406') {
          console.warn('Permission denied for notification_settings, using default settings');
          setSettings({
            id: '',
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            in_app_notifications: true,
            daily_digest: false,
            weekly_digest: false,
            mention_notifications: true,
            reply_notifications: true,
            like_notifications: true,
            moderation_notifications: true,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            timezone: 'UTC',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          return;
        }
        
        throw error;
      }
      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id_param: notificationId,
        user_id_param: user.id
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('mark_all_notifications_read', {
        user_id_param: user.id
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const subscribeToContent = async (
    subscriptionType: string,
    targetId: string,
    frequency: string = 'instant'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('subscribe_to_content', {
        user_id_param: user.id,
        subscription_type_param: subscriptionType,
        target_id_param: targetId,
        frequency_param: frequency
      });

      if (error) throw error;
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error subscribing to content:', error);
      throw error;
    }
  };

  const unsubscribeFromContent = async (
    subscriptionType: string,
    targetId: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('unsubscribe_from_content', {
        user_id_param: user.id,
        subscription_type_param: subscriptionType,
        target_id_param: targetId
      });

      if (error) throw error;
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error unsubscribing from content:', error);
      throw error;
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, just update local state
        if (error.code === '42P01') { // undefined_table
          console.warn('notification_settings table not found, updating local settings only');
          setSettings(prev => ({ ...prev, ...updates }));
          return;
        }
        
        // Handle 406 Not Acceptable error (usually permission issues)
        if (error.code === '406') {
          console.warn('Permission denied for notification_settings, updating local settings only');
          setSettings(prev => ({ ...prev, ...updates }));
          return;
        }
        
        throw error;
      }
      setSettings(data);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  const createNotification = async (
    userId: string,
    notificationType: string,
    title: string,
    message: string,
    data?: any,
    priority: string = 'medium'
  ) => {
    try {
      const { error } = await supabase.rpc('create_notification', {
        user_id_param: userId,
        notification_type_param: notificationType,
        title_param: title,
        message_param: message,
        data_param: data,
        priority_param: priority
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getSubscriptionStatus = (subscriptionType: string, targetId: string) => {
    return subscriptions.find(s => s.subscription_type === subscriptionType && s.target_id === targetId);
  };

  const isSubscribed = (subscriptionType: string, targetId: string) => {
    return !!getSubscriptionStatus(subscriptionType, targetId);
  };

  // Set up real-time subscription for new notifications
  useEffect(() => {
    let isMounted = true;
    let channel: any = null;
    
    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Clean up any existing channel
        if (channelRef.current) {
          console.log('Cleaning up existing notification channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create a unique channel name for this user
        const channelName = `notifications_${user.id}`;
        
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!isMounted) return;
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          )
          .subscribe((status) => {
            // Notification subscription status
            if (status === 'SUBSCRIBED') {
              channelRef.current = channel;
            }
          });
          
      } catch (error) {
        console.error('Error setting up real-time notifications:', error);
      }
    };

    setupRealtime();
    
    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log('Cleaning up notification channel on unmount');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // Remove dependencies to prevent re-subscription

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchNotifications(),
        fetchSubscriptions(),
        fetchSettings(),
        fetchUnreadCount()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    notifications,
    subscriptions,
    settings,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    fetchSubscriptions,
    fetchSettings,
    markNotificationRead,
    markAllNotificationsRead,
    subscribeToContent,
    unsubscribeFromContent,
    updateNotificationSettings,
    createNotification,
    deleteNotification,
    getSubscriptionStatus,
    isSubscribed
  };
}; 