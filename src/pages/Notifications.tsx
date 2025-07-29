import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter,
  Settings,
  Mail,
  MessageSquare,
  Heart,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    deleteNotification,
    loading 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read_at) return false;
    if (filter === 'read' && !notification.read_at) return false;
    if (selectedType !== 'all' && notification.notification_type !== selectedType) return false;
    return true;
  });

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
    }
    
    // Handle navigation based on notification type and data
    if (notification.data?.post_id) {
      window.location.href = `/forum/post/${notification.data.post_id}`;
    } else if (notification.data?.category_id) {
      window.location.href = `/forum/category/${notification.data.category_id}`;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_reply':
        return <MessageSquare className="h-5 w-5" />;
      case 'post_mention':
      case 'reply_mention':
        return <Mail className="h-5 w-5" />;
      case 'post_like':
      case 'reply_like':
        return <Heart className="h-5 w-5" />;
      case 'post_saved':
        return <Bell className="h-5 w-5" />;
      case 'category_subscription':
        return <Bell className="h-5 w-5" />;
      case 'moderation_action':
        return <Shield className="h-5 w-5" />;
      case 'warning_issued':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post_reply': return 'Replies';
      case 'post_mention': return 'Mentions';
      case 'reply_mention': return 'Reply Mentions';
      case 'post_like': return 'Likes';
      case 'reply_like': return 'Reply Likes';
      case 'post_saved': return 'Saved';
      case 'category_subscription': return 'Category Updates';
      case 'moderation_action': return 'Moderation';
      case 'warning_issued': return 'Warnings';
      default: return type;
    }
  };

  const notificationTypes = [...new Set(notifications.map(n => n.notification_type))];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with forum activity and community interactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/settings/notifications'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {notifications.some(n => !n.read_at) && (
              <Button onClick={handleMarkAllRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread ({notifications.filter(n => !n.read_at).length})
                </Button>
                <Button
                  variant={filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('read')}
                >
                  Read ({notifications.filter(n => n.read_at).length})
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  All Types
                </Button>
                {notificationTypes.map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {getTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "You don't have any notifications yet."
                    : `No ${filter} notifications found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                      !notification.read_at && "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-full",
                      getNotificationColor(notification.priority)
                    )}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        getNotificationColor(notification.priority)
                      )}>
                        {notification.title}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.notification_type)}
                        </Badge>
                        {notification.priority !== 'medium' && (
                          <Badge variant="secondary" className="text-xs">
                            {notification.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex gap-2">
                      {!notification.read_at && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage; 