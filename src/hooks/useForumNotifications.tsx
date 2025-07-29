import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { forumNotificationService, ForumNotification } from '@/services/forumNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useForumNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await forumNotificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching forum notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await forumNotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await forumNotificationService.markNotificationRead(notificationId);
      
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

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      for (const notification of unreadNotifications) {
        await forumNotificationService.markNotificationRead(notification.id);
      }
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle new notification
  const handleNewNotification = (notification: ForumNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to the post
          window.location.href = `/forum/post/${notification.post_id}`;
        }
      }
    });
  };

  // Setup real-time notifications
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Setup real-time subscription
    const subscription = forumNotificationService.setupRealtimeNotifications(
      user.id,
      handleNewNotification
    );

    // Cleanup on unmount
    return () => {
      forumNotificationService.cleanup();
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}; 