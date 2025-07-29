
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useAuth } from '@/hooks/useAuth';

const AccountSecuritySettings = () => {
  const { changePassword, changeEmail, deleteAccount, loading } = useAuthActions();
  const { user, isTokenLinkUser } = useAuth();
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

  return (
    <div className="space-y-6">
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
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Password'}
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
              disabled={loading || !emailForm.newEmail || !emailForm.password}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Email'}
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
                  disabled={loading || deleteForm.confirmation !== 'DELETE' || !deleteForm.password}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSecuritySettings;
