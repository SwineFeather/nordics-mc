
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Save, Camera, Palette, Sparkles, Crown, Star, Zap, Heart, Shield, Globe, Moon, Sun, Rainbow, Flame, Leaf, Droplets, Snowflake, Lightning, Star as StarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';

// Profile appearance options
const AVATAR_BORDERS = [
  { id: 'none', name: 'None', preview: 'border-0' },
  { id: 'golden', name: 'Golden Crown', preview: 'border-4 border-yellow-400 shadow-yellow-400/50', icon: <Crown className="w-4 h-4 text-yellow-400" /> },
  { id: 'sparkle', name: 'Sparkle', preview: 'border-2 border-purple-400 shadow-purple-400/50', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  { id: 'lightning', name: 'Lightning', preview: 'border-2 border-blue-400 shadow-blue-400/50', icon: <Zap className="w-4 h-4 text-blue-400" /> },
  { id: 'flame', name: 'Flame', preview: 'border-2 border-red-400 shadow-red-400/50', icon: <Flame className="w-4 h-4 text-red-400" /> },
  { id: 'leaf', name: 'Nature', preview: 'border-2 border-green-400 shadow-green-400/50', icon: <Leaf className="w-4 h-4 text-green-400" /> },
  { id: 'droplets', name: 'Water', preview: 'border-2 border-cyan-400 shadow-cyan-400/50', icon: <Droplets className="w-4 h-4 text-cyan-400" /> },
  { id: 'snowflake', name: 'Ice', preview: 'border-2 border-blue-200 shadow-blue-200/50', icon: <Snowflake className="w-4 h-4 text-blue-200" /> },
  { id: 'rainbow', name: 'Rainbow', preview: 'border-2 border-gradient-to-r from-red-400 via-yellow-400 to-purple-400', icon: <Rainbow className="w-4 h-4" /> },
];

const PROFILE_BANNERS = [
  { id: 'none', name: 'None', preview: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700' },
  { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-r from-orange-400 via-red-500 to-purple-600' },
  { id: 'ocean', name: 'Ocean', preview: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600' },
  { id: 'forest', name: 'Forest', preview: 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' },
  { id: 'cosmic', name: 'Cosmic', preview: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
  { id: 'aurora', name: 'Aurora', preview: 'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600' },
  { id: 'fire', name: 'Fire', preview: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600' },
  { id: 'ice', name: 'Ice', preview: 'bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-400' },
];

const PROFILE_THEMES = [
  { id: 'default', name: 'Default', preview: 'bg-background text-foreground' },
  { id: 'dark', name: 'Dark', preview: 'bg-gray-900 text-white' },
  { id: 'light', name: 'Light', preview: 'bg-white text-gray-900' },
  { id: 'warm', name: 'Warm', preview: 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100' },
  { id: 'cool', name: 'Cool', preview: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100' },
  { id: 'nature', name: 'Nature', preview: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' },
];

const PROFILE_EFFECTS = [
  { id: 'none', name: 'None', description: 'No special effects' },
  { id: 'glow', name: 'Glow', description: 'Adds a subtle glow around your profile' },
  { id: 'sparkle', name: 'Sparkle', description: 'Adds sparkle animations' },
  { id: 'pulse', name: 'Pulse', description: 'Adds a gentle pulsing effect' },
  { id: 'shimmer', name: 'Shimmer', description: 'Adds a shimmering effect' },
];

interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  editUserId?: string;
}

const ProfileSettings = ({ open, onClose, editUserId }: ProfileSettingsProps) => {
  const { user, profile: currentUserProfile, updateProfile } = useAuth();
  const { profiles } = useProfiles({ fetchAll: false });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [profileData, setProfileData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    minecraft_username: '',
    anonymous_mode: false,
    silent_join_leave: false
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    avatarBorder: 'none',
    profileBanner: 'none',
    profileTheme: 'default',
    profileEffect: 'none',
    customColors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b'
    }
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
        
        // Load appearance settings
        setAppearanceSettings({
          avatarBorder: (currentUserProfile as any).avatar_border || 'none',
          profileBanner: (currentUserProfile as any).profile_banner || 'none',
          profileTheme: (currentUserProfile as any).profile_theme || 'default',
          profileEffect: (currentUserProfile as any).profile_effect || 'none',
          customColors: (currentUserProfile as any).custom_colors || {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#f59e0b'
          }
        });
      }
    }
  }, [open, currentUserProfile, isEditingOther, targetProfile]);

  const loadTargetProfile = async () => {
    if (targetProfile) {
      setProfileData({
        full_name: targetProfile.displayName || '',
        avatar_url: targetProfile.avatar || '',
        bio: targetProfile.bio || '',
        minecraft_username: targetProfile.username || '',
        anonymous_mode: false,
        silent_join_leave: false
      });
    }
  };

  const handleSave = async () => {
    if (!currentUserProfile) return;
    
    setLoading(true);
    try {
      const updateData = {
        ...profileData,
        // Include appearance settings
        avatar_border: appearanceSettings.avatarBorder,
        profile_banner: appearanceSettings.profileBanner,
        profile_theme: appearanceSettings.profileTheme,
        profile_effect: appearanceSettings.profileEffect,
        custom_colors: appearanceSettings.customColors
      };
      
      await updateProfile(updateData);
      toast.success('Profile updated successfully!');
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

  const getMinecraftAvatar = (username: string) => {
    return `https://mc-heads.net/avatar/${username}/100`;
  };

  const currentAvatar = profileData.avatar_url || 
    (profileData.minecraft_username ? getMinecraftAvatar(profileData.minecraft_username) : '');

  // Get current appearance settings for preview
  const currentAvatarBorder = AVATAR_BORDERS.find(b => b.id === appearanceSettings.avatarBorder) || AVATAR_BORDERS[0];
  const currentProfileBanner = PROFILE_BANNERS.find(b => b.id === appearanceSettings.profileBanner) || PROFILE_BANNERS[0];
  const currentProfileTheme = PROFILE_THEMES.find(t => t.id === appearanceSettings.profileTheme) || PROFILE_THEMES[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
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

              {/* Avatar Section */}
              <div className="space-y-3">
                <Label>Profile Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentAvatar} />
                    <AvatarFallback className="text-lg">
                      {profileData.full_name?.charAt(0)?.toUpperCase() || profileData.minecraft_username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      placeholder="Avatar URL"
                      value={profileData.avatar_url}
                      onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                    />
                    {profileData.minecraft_username && (
                      <Button variant="outline" size="sm" onClick={handleUseMinecraftAvatar}>
                        <Camera className="w-4 h-4 mr-2" />
                        Use Minecraft Avatar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-6">
              {/* Avatar Border Selection */}
              <div className="space-y-3">
                <Label>Avatar Border Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_BORDERS.map((border) => (
                    <div
                      key={border.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        appearanceSettings.avatarBorder === border.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, avatarBorder: border.id })}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {border.icon || <div className="w-4 h-4" />}
                        <span className="text-sm font-medium">{border.name}</span>
                      </div>
                      <div className={`w-12 h-12 rounded-full bg-gray-300 mx-auto ${border.preview}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Banner Selection */}
              <div className="space-y-3">
                <Label>Profile Banner</Label>
                <div className="grid grid-cols-4 gap-3">
                  {PROFILE_BANNERS.map((banner) => (
                    <div
                      key={banner.id}
                      className={`h-16 rounded-lg cursor-pointer transition-all ${
                        appearanceSettings.profileBanner === banner.id
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:scale-105'
                      } ${banner.preview}`}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, profileBanner: banner.id })}
                    >
                      <div className="h-full flex items-center justify-center text-white font-medium text-xs">
                        {banner.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Theme Selection */}
              <div className="space-y-3">
                <Label>Profile Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PROFILE_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        appearanceSettings.profileTheme === theme.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, profileTheme: theme.id })}
                    >
                      <div className={`w-full h-8 rounded ${theme.preview} flex items-center justify-center text-xs font-medium`}>
                        {theme.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Effects */}
              <div className="space-y-3">
                <Label>Profile Effects</Label>
                <div className="space-y-2">
                  {PROFILE_EFFECTS.map((effect) => (
                    <div
                      key={effect.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        appearanceSettings.profileEffect === effect.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, profileEffect: effect.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{effect.name}</div>
                          <div className="text-sm text-muted-foreground">{effect.description}</div>
                        </div>
                        {appearanceSettings.profileEffect === effect.id && (
                          <div className="text-primary">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="space-y-3">
                <Label>Custom Colors</Label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(appearanceSettings.customColors).map(([colorKey, colorValue]) => (
                    <div key={colorKey} className="space-y-2">
                      <Label className="text-xs capitalize">{colorKey}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colorValue}
                          onChange={(e) => setAppearanceSettings({
                            ...appearanceSettings,
                            customColors: {
                              ...appearanceSettings.customColors,
                              [colorKey]: e.target.value
                            }
                          })}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={colorValue}
                          onChange={(e) => setAppearanceSettings({
                            ...appearanceSettings,
                            customColors: {
                              ...appearanceSettings.customColors,
                              [colorKey]: e.target.value
                            }
                          })}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className={`p-4 rounded-lg border ${currentProfileTheme.preview}`}>
                  <div className={`h-16 rounded-lg mb-4 ${currentProfileBanner.preview} flex items-center justify-center text-white font-medium`}>
                    Profile Banner
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`relative ${currentAvatarBorder.id !== 'none' ? 'group' : ''}`}>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentAvatar} />
                        <AvatarFallback className="text-lg">U</AvatarFallback>
                      </Avatar>
                      {currentAvatarBorder.id !== 'none' && (
                        <div className={`absolute -inset-1 rounded-full ${currentAvatarBorder.preview} opacity-75 blur-sm`}></div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{profileData.full_name || 'Display Name'}</div>
                      <div className="text-sm text-muted-foreground">@username</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
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
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Admin Settings</h4>
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
              </div>
            )}
          </TabsContent>
        </Tabs>

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
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;