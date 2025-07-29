
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowUp, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TokenLinkUpgrade = () => {
  const { profile, playerUuid } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleUpgrade = async () => {
    if (!upgradeForm.email || !upgradeForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (upgradeForm.password !== upgradeForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (upgradeForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!profile?.id || !playerUuid) {
      toast.error('Profile information missing');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upgrade-tokenlink-account', {
        body: {
          profileId: profile.id,
          email: upgradeForm.email,
          password: upgradeForm.password
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Account upgraded successfully! Please sign in with your new credentials.');
        
        // Clear TokenLink data
        localStorage.removeItem("tokenlink_profile_id");
        localStorage.removeItem("player_uuid");
        localStorage.removeItem("player_name");
        localStorage.removeItem("profile");
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(data?.error || 'Upgrade failed');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-500' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 'Medium', color: 'text-yellow-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(upgradeForm.password);

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ArrowUp className="h-5 w-5" />
            Upgrade Your TokenLink Account
          </CardTitle>
          <CardDescription className="text-blue-700">
            Add email and password authentication for enhanced security and full website access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900">Benefits of upgrading:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Enhanced account security with password protection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Access to all website features and settings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Ability to change email and password later
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Better account recovery options
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upgradeEmail">Email Address</Label>
              <Input
                id="upgradeEmail"
                type="email"
                value={upgradeForm.email}
                onChange={(e) => setUpgradeForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                This will replace your current TokenLink email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upgradePassword">Password</Label>
              <div className="relative">
                <Input
                  id="upgradePassword"
                  type={showPassword ? 'text' : 'password'}
                  value={upgradeForm.password}
                  onChange={(e) => setUpgradeForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a secure password"
                  className="bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {upgradeForm.password && (
                <p className={`text-sm ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.strength}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmUpgradePassword">Confirm Password</Label>
              <Input
                id="confirmUpgradePassword"
                type="password"
                value={upgradeForm.confirmPassword}
                onChange={(e) => setUpgradeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="bg-white"
              />
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!upgradeForm.email || !upgradeForm.password || !upgradeForm.confirmPassword || loading}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                {loading ? 'Upgrading Account...' : 'Upgrade Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Account Upgrade</AlertDialogTitle>
                <AlertDialogDescription>
                  This will convert your TokenLink account to a standard account with email and password authentication. 
                  You'll need to use your new credentials to sign in after the upgrade.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpgrade} disabled={loading}>
                  {loading ? 'Upgrading...' : 'Confirm Upgrade'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Current Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Type:</span>
            <span className="font-medium">TokenLink</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Email:</span>
            <span className="font-medium">{profile?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Minecraft Username:</span>
            <span className="font-medium">{profile?.minecraft_username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Can Change Password:</span>
            <span className="text-red-600 font-medium">No</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Can Change Email:</span>
            <span className="text-red-600 font-medium">No</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenLinkUpgrade;
