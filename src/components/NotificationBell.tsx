import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markNotificationRead, 
    markAllNotificationsRead,
    deleteNotification,
    loading 
  } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
    }
    
    // Handle navigation based on notification type and data
    if (notification.data?.post_id) {
      // Navigate to post
      window.location.href = `/forum/post/${notification.data.post_id}`;
    } else if (notification.data?.category_id) {
      // Navigate to category
      window.location.href = `/forum/category/${notification.data.category_id}`;
    }
    
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_reply':
        return '💬';
      case 'post_mention':
      case 'reply_mention':
        return '@';
      case 'post_like':
      case 'reply_like':
        return '❤️';
      case 'post_saved':
        return '🔖';
      case 'category_subscription':
        return '📢';
      case 'moderation_action':
        return '🛡️';
      case 'warning_issued':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/settings/notifications'}
              className="h-6 px-2 text-xs"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer hover:bg-accent",
                !notification.read_at && "bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              <div className="flex-shrink-0 text-lg">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium",
                  getNotificationColor(notification.priority)
                )}>
                  {notification.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {notification.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="flex-shrink-0 flex gap-1">
                {!notification.read_at && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => window.location.href = '/notifications'}
              className="text-center text-sm text-muted-foreground"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
