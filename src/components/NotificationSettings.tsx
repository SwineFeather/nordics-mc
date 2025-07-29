import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Clock, Settings, Save } from 'lucide-react';
import { useNotifications, NotificationSettings as NotificationSettingsType } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings: React.FC = () => {
  const { settings, updateNotificationSettings, loading } = useNotifications();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [localSettings, setLocalSettings] = useState<Partial<NotificationSettingsType>>({
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
    timezone: 'UTC'
  });

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationSettings(localSettings);
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettingsType) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTimezoneChange = (value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      timezone: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Notification Settings</h2>
      </div>

      <div className="grid gap-6">
        {/* General Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              General Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={localSettings.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={localSettings.push_notifications}
                onCheckedChange={() => handleToggle('push_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the app
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={localSettings.in_app_notifications}
                onCheckedChange={() => handleToggle('in_app_notifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Digest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of forum activity
                </p>
              </div>
              <Switch
                id="daily-digest"
                checked={localSettings.daily_digest}
                onCheckedChange={() => handleToggle('daily_digest')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of forum activity
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={localSettings.weekly_digest}
                onCheckedChange={() => handleToggle('weekly_digest')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specific Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mention-notifications">Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone mentions you (@username)
                </p>
              </div>
              <Switch
                id="mention-notifications"
                checked={localSettings.mention_notifications}
                onCheckedChange={() => handleToggle('mention_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reply-notifications">Replies</Label>
                <p className="text-sm text-muted-foreground">
                  When someone replies to your posts
                </p>
              </div>
              <Switch
                id="reply-notifications"
                checked={localSettings.reply_notifications}
                onCheckedChange={() => handleToggle('reply_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="like-notifications">Likes</Label>
                <p className="text-sm text-muted-foreground">
                  When someone likes your posts or replies
                </p>
              </div>
              <Switch
                id="like-notifications"
                checked={localSettings.like_notifications}
                onCheckedChange={() => handleToggle('like_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="moderation-notifications">Moderation</Label>
                <p className="text-sm text-muted-foreground">
                  When moderation actions are taken on your content
                </p>
              </div>
              <Switch
                id="moderation-notifications"
                checked={localSettings.moderation_notifications}
                onCheckedChange={() => handleToggle('moderation_notifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              During quiet hours, notifications will be marked as low priority
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-hours-start">Start Time</Label>
                <Input
                  id="quiet-hours-start"
                  type="time"
                  value={localSettings.quiet_hours_start}
                  onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet-hours-end">End Time</Label>
                <Input
                  id="quiet-hours-end"
                  type="time"
                  value={localSettings.quiet_hours_end}
                  onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={localSettings.timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings; 