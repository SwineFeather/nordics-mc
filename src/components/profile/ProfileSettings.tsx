import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, User, Shield, Bell, Palette, Globe } from 'lucide-react';
import { SetEmailModal } from './SetEmailModal';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ChangeDisplayNameModal } from './ChangeDisplayNameModal';
import { ChangePasswordModal } from './ChangePasswordModal';

export const ProfileSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const isMinecraftUser = profile?.minecraft_username;
  const hasEmail = profile?.email;
  const displayName = profile?.full_name || profile?.minecraft_username || profile?.username;

  const handleEmailSet = () => {
    refreshProfile?.();
  };

  const handleDisplayNameChanged = () => {
    refreshProfile?.();
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Basic information about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-sm text-gray-900 mt-1">{profile.username || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Display Name</label>
              <p className="text-sm text-gray-900 mt-1">{displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Badge variant="secondary" className="mt-1">
                {profile.role || 'member'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Account Type</label>
              <Badge variant={isMinecraftUser ? "default" : "outline"} className="mt-1">
                {isMinecraftUser ? 'Minecraft Player' : 'Website User'}
              </Badge>
            </div>
          </div>

          {isMinecraftUser && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Minecraft Username</h4>
                  <p className="text-sm text-gray-900 mt-1">{profile.minecraft_username}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisplayNameModal(true)}
                >
                  Change Display Name
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Manage your email address for notifications and account recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasEmail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Email</label>
                  <p className="text-sm text-gray-900 mt-1">{hasEmail}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowChangeEmailModal(true)}
                  >
                    Change Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Set Email
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {isMinecraftUser 
                      ? "No email address set. Set one to receive notifications and enable account recovery."
                      : "No email address set."
                    }
                  </p>
                </div>
                <Button onClick={() => setShowEmailModal(true)}>
                  Set Email Address
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Password</h4>
                <p className="text-sm text-gray-600 mt-1">Change your account password</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                <p className="text-sm text-gray-600 mt-1">Receive notifications via email</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Push Notifications</h4>
                <p className="text-sm text-gray-600 mt-1">Receive push notifications</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the website looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Theme</h4>
                <p className="text-sm text-gray-600 mt-1">Choose between light and dark mode</p>
              </div>
              <Button variant="outline" size="sm">
                Change Theme
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Language</h4>
                <p className="text-sm text-gray-600 mt-1">Select your preferred language</p>
              </div>
              <Button variant="outline" size="sm">
                Change Language
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control your privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Profile Visibility</h4>
                <p className="text-sm text-gray-600 mt-1">Control who can see your profile</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Data Sharing</h4>
                <p className="text-sm text-gray-600 mt-1">Manage how your data is shared</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SetEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        profileId={profile.id}
        currentEmail={profile.email}
        onEmailSet={handleEmailSet}
      />
      
      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        profileId={profile.id}
        currentEmail={profile.email || ''}
        onEmailChanged={handleEmailSet}
      />
      
      <ChangeDisplayNameModal
        isOpen={showDisplayNameModal}
        onClose={() => setShowDisplayNameModal(false)}
        profileId={profile.id}
        currentDisplayName={profile.full_name}
        minecraftUsername={profile.minecraft_username || ''}
        onDisplayNameChanged={handleDisplayNameChanged}
      />
      
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={() => {
          // Could add a success message here
          setShowPasswordModal(false);
        }}
      />
    </div>
  );
};
