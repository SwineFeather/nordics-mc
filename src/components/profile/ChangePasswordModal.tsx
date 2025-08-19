import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged?: () => void;
}

export const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  onPasswordChanged 
}: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // For now, we'll use Supabase auth updatePassword
      // This would need to be implemented based on your auth system
      const { error: updateError } = await (window as any).supabase?.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      onPasswordChanged?.();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      onClose();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
