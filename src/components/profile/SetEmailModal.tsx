import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountManagement } from '@/hooks/useAccountManagement';

interface SetEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  currentEmail?: string;
  onEmailSet?: () => void;
}

export const SetEmailModal = ({ 
  isOpen, 
  onClose, 
  profileId, 
  currentEmail, 
  onEmailSet 
}: SetEmailModalProps) => {
  const [email, setEmail] = useState(currentEmail || '');
  const { setMinecraftUserEmail, loading } = useAccountManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }
    
    try {
      await setMinecraftUserEmail(profileId, email.trim());
      onEmailSet?.();
      onClose();
    } catch (error) {
      // Error already handled by the hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail(currentEmail || '');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentEmail ? 'Change Email Address' : 'Set Email Address'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              This email will be used for account recovery and notifications.
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
              disabled={loading || !email.trim()}
            >
              {loading ? 'Setting Email...' : (currentEmail ? 'Update Email' : 'Set Email')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
