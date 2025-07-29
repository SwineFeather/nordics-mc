
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User, Settings, Bell, Shield, ArrowUp, Link2, Eye } from 'lucide-react';
import TokenLinkUpgrade from './TokenLinkUpgrade';
import AccountLinking from './AccountLinking';
import ProfilePrivacySettings from './ProfilePrivacySettings';
import AccountSecuritySettings from './AccountSecuritySettings';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
}

const SettingsModal = ({ open, onClose, defaultTab = 'profile' }: SettingsModalProps) => {
  const { user, profile, updateProfile, isTokenLinkUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: (profile as any)?.bio || '',
    minecraft_username: (profile as any)?.minecraft_username || '',
    avatar_url: profile?.avatar_url || '',
    anonymous_mode: (profile as any)?.anonymous_mode || false,
    silent_join_leave: (profile as any)?.silent_join_leave || false,
  });

  // Update activeTab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Update formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: (profile as any)?.bio || '',
        minecraft_username: (profile as any)?.minecraft_username || '',
        avatar_url: profile.avatar_url || '',
        anonymous_mode: (profile as any)?.anonymous_mode || false,
        silent_join_leave: (profile as any)?.silent_join_leave || false,
      });
    }
  }, [profile, open]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      
      if (error) throw error;
      
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const tabItems = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'account', label: 'Account', icon: Settings },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'privacy', label: 'Privacy', icon: Eye },
    { value: 'security', label: 'Security', icon: Shield }
  ];

  // Add upgrade tab for TokenLink users
  if (isTokenLinkUser) {
    tabItems.splice(2, 0, { value: 'upgrade', label: 'Upgrade', icon: ArrowUp });
    tabItems.splice(3, 0, { value: 'linking', label: 'Linking', icon: Link2 });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-7">
            {tabItems.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback>
                      {formData.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Display Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minecraft_username">Minecraft Username</Label>
                  <Input
                    id="minecraft_username"
                    value={formData.minecraft_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, minecraft_username: e.target.value }))}
                    placeholder="Your Minecraft username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user.email || profile?.email || ''} disabled />
                  <p className="text-sm text-muted-foreground">
                    {isTokenLinkUser ? 'TokenLink email - upgrade your account to change' : 'Manage in Security settings'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Account Role</Label>
                  <Input value={profile?.role || 'member'} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Input value={isTokenLinkUser ? 'TokenLink' : 'Standard'} disabled />
                  {isTokenLinkUser && (
                    <p className="text-sm text-muted-foreground">
                      Your account uses TokenLink authentication. Consider upgrading for enhanced security.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isTokenLinkUser && (
            <TabsContent value="upgrade" className="space-y-6">
              <TokenLinkUpgrade />
            </TabsContent>
          )}

          {isTokenLinkUser && (
            <TabsContent value="linking" className="space-y-6">
              <AccountLinking />
            </TabsContent>
          )}

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Forum Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new posts and replies
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Chat Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about mentions in chat
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Important announcements and updates
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Silent Join/Leave</Label>
                    <p className="text-sm text-muted-foreground">
                      Don't notify others when you join or leave chat
                    </p>
                  </div>
                  <Switch 
                    checked={formData.silent_join_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, silent_join_leave: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <ProfilePrivacySettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <AccountSecuritySettings />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
