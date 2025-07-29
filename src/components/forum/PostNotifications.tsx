import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, BellOff, Settings, MessageSquare, Eye, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PostNotificationsProps {
  postId: string;
  postTitle: string;
  onNotificationChange?: () => void;
}

interface NotificationSettings {
  id: string;
  user_id: string;
  post_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  reply_notifications: boolean;
  mention_notifications: boolean;
  created_at: string;
  updated_at: string;
}

const PostNotifications = ({ postId, postTitle, onNotificationChange }: PostNotificationsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
    }
  }, [user, postId]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_notification_settings')
        .select('*')
        .eq('user_id', user!.id)
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return;

    setLoading(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('forum_notification_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('forum_notification_settings')
          .insert({
            user_id: user.id,
            post_id: postId,
            email_notifications: true,
            push_notifications: true,
            reply_notifications: true,
            mention_notifications: true,
            ...updates
          });

        if (error) throw error;
      }

      await fetchNotificationSettings();
      onNotificationChange?.();
      
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailNotifications = () => {
    updateNotificationSettings({ email_notifications: !settings?.email_notifications });
  };

  const togglePushNotifications = () => {
    updateNotificationSettings({ push_notifications: !settings?.push_notifications });
  };

  const toggleReplyNotifications = () => {
    updateNotificationSettings({ reply_notifications: !settings?.reply_notifications });
  };

  const toggleMentionNotifications = () => {
    updateNotificationSettings({ mention_notifications: !settings?.mention_notifications });
  };

  const isSubscribed = settings && (
    settings.email_notifications || 
    settings.push_notifications || 
    settings.reply_notifications || 
    settings.mention_notifications
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          variant={isSubscribed ? "default" : "outline"} 
          size="sm" 
          className="h-8 px-2"
        >
          {isSubscribed ? <Bell className="w-4 h-4 mr-1" /> : <BellOff className="w-4 h-4 mr-1" />}
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Notification Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Configure how you want to be notified about activity on "{postTitle}"
          </div>

          {/* Notification Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <Button
                variant={settings?.email_notifications ? "default" : "outline"}
                size="sm"
                onClick={toggleEmailNotifications}
                disabled={loading}
                className="h-8 px-3"
              >
                {settings?.email_notifications ? <Check className="w-4 h-4" /> : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <Button
                variant={settings?.push_notifications ? "default" : "outline"}
                size="sm"
                onClick={togglePushNotifications}
                disabled={loading}
                className="h-8 px-3"
              >
                {settings?.push_notifications ? <Check className="w-4 h-4" /> : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reply Notifications</span>
              </div>
              <Button
                variant={settings?.reply_notifications ? "default" : "outline"}
                size="sm"
                onClick={toggleReplyNotifications}
                disabled={loading}
                className="h-8 px-3"
              >
                {settings?.reply_notifications ? <Check className="w-4 h-4" /> : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mention Notifications</span>
              </div>
              <Button
                variant={settings?.mention_notifications ? "default" : "outline"}
                size="sm"
                onClick={toggleMentionNotifications}
                disabled={loading}
                className="h-8 px-3"
              >
                {settings?.mention_notifications ? <Check className="w-4 h-4" /> : 'Off'}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
              </Badge>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground">
            <p>• Email notifications will be sent to your registered email address</p>
            <p>• Push notifications require browser permission</p>
            <p>• Reply notifications alert you to new replies on this post</p>
            <p>• Mention notifications alert you when someone mentions you</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostNotifications; 