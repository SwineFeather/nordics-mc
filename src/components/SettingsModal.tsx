
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
import { User, Settings, ArrowUp, Link2, Shield, Eye, EyeOff, Trash2 } from 'lucide-react';
import TokenLinkUpgrade from './TokenLinkUpgrade';
import AccountLinking from './AccountLinking';
import { useAuthActions } from '@/hooks/useAuthActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
}

const SettingsModal = ({ open, onClose, defaultTab = 'profile' }: SettingsModalProps) => {
  const { user, profile, updateProfile, isTokenLinkUser } = useAuth();
  const { changePassword, changeEmail, deleteAccount, loading: authLoading } = useAuthActions();
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

  // Security form states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: ''
  });

  // Privacy form states
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: !profile?.anonymous_mode,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showStats: true,
    customUrl: profile?.minecraft_username || ''
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
      setPrivacySettings(prev => ({
        ...prev,
        profileVisible: !profile.anonymous_mode,
        customUrl: profile.minecraft_username || ''
      }));
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

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      alert('Please fill in all fields');
      return;
    }
    
    const result = await changeEmail(emailForm.newEmail, emailForm.password);
    if (result.success) {
      setEmailForm({ newEmail: '', password: '' });
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteForm.confirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm');
      return;
    }
    
    const result = await deleteAccount(deleteForm.password);
    if (result.success) {
      // User will be automatically signed out
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-500' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 'Medium', color: 'text-yellow-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  if (!user) return null;

  const tabItems = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'account', label: 'Account', icon: Settings }
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
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
            {/* Account Settings */}
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
                    {isTokenLinkUser ? 'TokenLink email - upgrade your account to change' : 'Manage in Security settings below'}
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

            {/* Privacy Settings */}
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
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
                </div>

                <Button onClick={handleSavePrivacy} disabled={loading} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account Type */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {isTokenLinkUser ? 'TokenLink Account' : 'Standard Account'}
                    </span>
                    {isTokenLinkUser && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Can be upgraded for enhanced security)
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Email */}
                <div className="space-y-2">
                  <Label>Current Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            {!isTokenLinkUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.newPassword && (
                      <p className={`text-sm ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.strength}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={authLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full"
                  >
                    {authLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Change Email */}
            {!isTokenLinkUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Email Address</CardTitle>
                  <CardDescription>
                    Update your email address. You'll need to verify the new email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="Enter new email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">Confirm Password</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <Button 
                    onClick={handleEmailChange} 
                    disabled={authLoading || !emailForm.newEmail || !emailForm.password}
                    className="w-full"
                  >
                    {authLoading ? 'Updating...' : 'Update Email'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Delete Account */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">Confirm Password</Label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deleteConfirmation">Type "DELETE" to confirm</Label>
                        <Input
                          id="deleteConfirmation"
                          value={deleteForm.confirmation}
                          onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmation: e.target.value }))}
                          placeholder="Type DELETE here"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteForm({ password: '', confirmation: '' })}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAccountDeletion}
                        disabled={authLoading || deleteForm.confirmation !== 'DELETE' || !deleteForm.password}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {authLoading ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
