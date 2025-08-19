import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';
import { useAccountManagement } from '@/hooks/useAccountManagement';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  currentEmail: string;
  onEmailChanged?: () => void;
}

export const ChangeEmailModal = ({ 
  isOpen, 
  onClose, 
  profileId, 
  currentEmail, 
  onEmailChanged 
}: ChangeEmailModalProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setMinecraftUserEmail } = useAccountManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }
    
    if (newEmail === currentEmail) {
      setError('New email must be different from current email');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await setMinecraftUserEmail(profileId, newEmail);
      onEmailChanged?.();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewEmail('');
      setConfirmEmail('');
      setPassword('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
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
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmEmail">Confirm New Email</Label>
            <Input
              id="confirmEmail"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Confirm new email address"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              Enter your current password to confirm this change
            </p>
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
              disabled={loading || !newEmail || !confirmEmail || !password || newEmail !== confirmEmail}
            >
              {loading ? 'Changing Email...' : 'Change Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
