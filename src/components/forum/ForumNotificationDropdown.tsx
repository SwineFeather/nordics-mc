import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, MessageSquare, AtSign, Heart, Quote } from 'lucide-react';
import { useForumNotifications } from '@/hooks/useForumNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reply':
      return <MessageSquare className="w-4 h-4" />;
    case 'mention':
      return <AtSign className="w-4 h-4" />;
    case 'reaction':
      return <Heart className="w-4 h-4" />;
    case 'quote':
      return <Quote className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'reply':
      return 'text-blue-600';
    case 'mention':
      return 'text-orange-600';
    case 'reaction':
      return 'text-red-600';
    case 'quote':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

export const ForumNotificationDropdown = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useForumNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
    
    // Navigate to the post
    navigate(`/forum/post/${notification.post_id}`);
    setOpen(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read_at);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Forum Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 cursor-pointer ${
                    !notification.read_at ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={notification.author?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {notification.author?.full_name?.[0] || notification.author?.email[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={getNotificationColor(notification.notification_type)}>
                          {getNotificationIcon(notification.notification_type)}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {notification.title}
                        </span>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        
                        {notification.post && (
                          <span className="text-xs text-muted-foreground truncate max-w-32">
                            in "{notification.post.title}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate('/notifications');
                setOpen(false);
              }}
              className="text-center cursor-pointer"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 