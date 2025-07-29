
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  editUserId?: string;
}

const ProfileSettings = ({ open, onClose, editUserId }: ProfileSettingsProps) => {
  const { user, profile: currentUserProfile, updateProfile } = useAuth();
  const { profiles } = useProfiles({ fetchAll: false });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    minecraft_username: '',
    anonymous_mode: false,
    silent_join_leave: false
  });

  const isAdmin = currentUserProfile?.role === 'admin';
  const isEditingOther = editUserId && editUserId !== user?.id;
  const targetProfile = isEditingOther 
    ? profiles.find(p => p.websiteUserId === editUserId)
    : null;

  useEffect(() => {
    if (open) {
      if (isEditingOther && targetProfile) {
        loadTargetProfile();
      } else if (currentUserProfile) {
        setProfileData({
          full_name: currentUserProfile.full_name || '',
          avatar_url: currentUserProfile.avatar_url || '',
          bio: (currentUserProfile as any).bio || '',
          minecraft_username: (currentUserProfile as any).minecraft_username || '',
          anonymous_mode: (currentUserProfile as any).anonymous_mode || false,
          silent_join_leave: (currentUserProfile as any).silent_join_leave || false
        });
      }
    }
  }, [open, currentUserProfile, isEditingOther, targetProfile]);

  const loadTargetProfile = async () => {
    if (!editUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', editUserId)
        .single();

      if (error) throw error;

      setProfileData({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        minecraft_username: data.minecraft_username || targetProfile?.username || '',
        anonymous_mode: data.anonymous_mode || false,
        silent_join_leave: data.silent_join_leave || false
      });
    } catch (error) {
      console.error('Error loading target profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const getMinecraftAvatar = (username: string) => {
    return `https://minotar.net/helm/${username}/100.png`;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        minecraft_username: profileData.minecraft_username,
        anonymous_mode: profileData.anonymous_mode,
        silent_join_leave: profileData.silent_join_leave
      };

      if (isEditingOther && isAdmin) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', editUserId);

        if (error) throw error;
        toast.success('Profile updated successfully');
      } else {
        const { error } = await updateProfile(updates);
        if (error) throw error;
        toast.success('Profile updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMinecraftAvatar = () => {
    if (profileData.minecraft_username) {
      setProfileData({
        ...profileData,
        avatar_url: getMinecraftAvatar(profileData.minecraft_username)
      });
    }
  };

  const currentAvatar = profileData.avatar_url || 
    (profileData.minecraft_username ? getMinecraftAvatar(profileData.minecraft_username) : '');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {isEditingOther ? `Edit ${targetProfile?.displayName || targetProfile?.username}'s Profile` : 'Profile Settings'}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentAvatar} />
              <AvatarFallback>
                {profileData.full_name ? profileData.full_name.substring(0, 2).toUpperCase() : '??'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 w-full">
              <Label htmlFor="avatar_url">Profile Picture URL</Label>
              <Input
                id="avatar_url"
                placeholder="Enter image URL or use Minecraft avatar"
                value={profileData.avatar_url}
                onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
              />
              {profileData.minecraft_username && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseMinecraftAvatar}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Use Minecraft Avatar
                </Button>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Display Name</Label>
              <Input
                id="full_name"
                placeholder="Your display name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="minecraft_username">Minecraft Username</Label>
              <Input
                id="minecraft_username"
                placeholder="Your Minecraft username"
                value={profileData.minecraft_username}
                onChange={(e) => setProfileData({ ...profileData, minecraft_username: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Privacy & Chat Settings</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anonymous Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your profile from other users
                  </p>
                </div>
                <Switch
                  checked={profileData.anonymous_mode}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, anonymous_mode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Silent Join/Leave</Label>
                  <p className="text-sm text-muted-foreground">
                    Don't notify others when you join or leave chat
                  </p>
                </div>
                <Switch
                  checked={profileData.silent_join_leave}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, silent_join_leave: checked })}
                />
              </div>
            </div>

            {isAdmin && isEditingOther && (
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={(targetProfile as any)?.role || 'member'} 
                  onValueChange={(value) => {
                    console.log('Role change requested:', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;
