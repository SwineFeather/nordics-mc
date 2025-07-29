
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Eye, Link, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ProfilePrivacySettings = () => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: !profile?.anonymous_mode,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showStats: true,
    customUrl: profile?.minecraft_username || ''
  });

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        anonymous_mode: !privacySettings.profileVisible
      });

      if (error) throw error;

      toast.success('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your profile and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile via URL
                </p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, profileVisible: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Let others see when you're online
                </p>
              </div>
              <Switch
                checked={privacySettings.showOnlineStatus}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Direct Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to send you messages
                </p>
              </div>
              <Switch
                checked={privacySettings.allowDirectMessages}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Statistics</Label>
                <p className="text-sm text-muted-foreground">
                  Display your game statistics on your profile
                </p>
              </div>
              <Switch
                checked={privacySettings.showStats}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, showStats: checked }))
                }
              />
            </div>
          </div>

          <Button onClick={handleSavePrivacy} disabled={loading} className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Custom Profile URL
          </CardTitle>
          <CardDescription>
            Customize your profile URL for easy sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customUrl">Custom URL</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {window.location.origin}/community?player=
              </span>
              <Input
                id="customUrl"
                placeholder="your-username"
                value={privacySettings.customUrl}
                onChange={(e) => 
                  setPrivacySettings(prev => ({ ...prev, customUrl: e.target.value }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This will be your public profile URL
            </p>
          </div>

          <Button variant="outline" className="w-full">
            <Globe className="w-4 h-4 mr-2" />
            Update Custom URL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePrivacySettings;
