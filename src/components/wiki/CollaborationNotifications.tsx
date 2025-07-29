import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  MessageSquare, 
  Edit3, 
  GitMerge, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  X,
  Settings,
  Filter,
  Check,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { WikiCollaborationNotification, WikiPageSubscription } from '@/types/wiki';
import { wikiCollaborationService } from '@/services/wikiCollaborationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CollaborationNotificationsProps {
  pageId?: string;
  showPageSubscription?: boolean;
}

interface NotificationItemProps {
  notification: WikiCollaborationNotification;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onNavigate: (notification: WikiCollaborationNotification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onNavigate
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getNotificationIcon = () => {
    switch (notification.notificationType) {
      case 'page_edited':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'comment_added':
      case 'comment_replied':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'suggested_edit_submitted':
        return <Edit3 className="w-4 h-4 text-orange-600" />;
      case 'suggested_edit_reviewed':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'edit_conflict':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'page_published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'page_review_requested':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBadge = () => {
    switch (notification.notificationType) {
      case 'page_edited':
        return <Badge variant="secondary" className="text-xs">Page Edit</Badge>;
      case 'comment_added':
        return <Badge variant="default" className="text-xs">Comment</Badge>;
      case 'comment_replied':
        return <Badge variant="outline" className="text-xs">Reply</Badge>;
      case 'suggested_edit_submitted':
        return <Badge variant="secondary" className="text-xs">Suggestion</Badge>;
      case 'suggested_edit_reviewed':
        return <Badge variant="default" className="text-xs">Reviewed</Badge>;
      case 'edit_conflict':
        return <Badge variant="destructive" className="text-xs">Conflict</Badge>;
      case 'page_published':
        return <Badge variant="default" className="text-xs">Published</Badge>;
      case 'page_review_requested':
        return <Badge variant="outline" className="text-xs">Review</Badge>;
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(notification.id);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onNavigate(notification);
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
        notification.isRead 
          ? "bg-muted/30 hover:bg-muted/50" 
          : "bg-blue-50/50 border-blue-200 hover:bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{notification.title}</span>
            {getNotificationBadge()}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.isRead && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {notification.actorName && (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${notification.actorName}`} />
                  <AvatarFallback className="text-xs">{notification.actorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{notification.actorName}</span>
              </>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

const CollaborationNotifications: React.FC<CollaborationNotificationsProps> = ({
  pageId,
  showPageSubscription = true
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<WikiCollaborationNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [pageSubscription, setPageSubscription] = useState<WikiPageSubscription | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await wikiCollaborationService.getCollaborationNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPageSubscription = async () => {
    if (!pageId || !showPageSubscription) return;

    try {
      const subscription = await wikiCollaborationService.getPageSubscription(pageId);
      setPageSubscription(subscription);
    } catch (error) {
      console.error('Failed to load page subscription:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadPageSubscription();
  }, [pageId]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await wikiCollaborationService.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await wikiCollaborationService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      // This would need to be implemented in the service
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  };

  const handleNavigate = (notification: WikiCollaborationNotification) => {
    if (notification.pageId) {
      // Navigate to the page
      window.location.href = `/wiki/page/${notification.pageId}`;
    }
  };

  const handleSubscribeToPage = async () => {
    if (!pageId) return;

    try {
      await wikiCollaborationService.subscribeToPage(pageId);
      await loadPageSubscription();
      toast.success('Subscribed to page notifications');
    } catch (error) {
      console.error('Failed to subscribe to page:', error);
      toast.error('Failed to subscribe to page');
    }
  };

  const handleUnsubscribeFromPage = async () => {
    if (!pageId) return;

    try {
      await wikiCollaborationService.unsubscribeFromPage(pageId);
      setPageSubscription(null);
      toast.success('Unsubscribed from page notifications');
    } catch (error) {
      console.error('Failed to unsubscribe from page:', error);
      toast.error('Failed to unsubscribe from page');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    if (selectedType !== 'all' && notification.notificationType !== selectedType) return false;
    return true;
  });

  const notificationTypes = [
    { value: 'all', label: 'All' },
    { value: 'page_edited', label: 'Page Edits' },
    { value: 'comment_added', label: 'Comments' },
    { value: 'suggested_edit_submitted', label: 'Suggestions' },
    { value: 'edit_conflict', label: 'Conflicts' },
    { value: 'page_published', label: 'Published' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Collaboration Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Page Subscriptions</h4>
                    {pageId && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Current Page</p>
                          <p className="text-sm text-muted-foreground">
                            {pageSubscription ? 'Subscribed' : 'Not subscribed'}
                          </p>
                        </div>
                        <Button
                          variant={pageSubscription ? "destructive" : "default"}
                          size="sm"
                          onClick={pageSubscription ? handleUnsubscribeFromPage : handleSubscribeToPage}
                        >
                          {pageSubscription ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All ({notifications.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread ({unreadCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  Read ({notifications.length - unreadCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {notificationTypes.find(t => t.value === selectedType)?.label || 'All Types'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notificationTypes.map(type => (
                  <DropdownMenuItem 
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications found</p>
              {filter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2"
                >
                  View all notifications
                </Button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationNotifications; 