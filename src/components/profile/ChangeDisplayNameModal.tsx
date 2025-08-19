import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountManagement } from '@/hooks/useAccountManagement';

interface ChangeDisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  currentDisplayName?: string;
  minecraftUsername: string;
  onDisplayNameChanged?: () => void;
}

export const ChangeDisplayNameModal = ({ 
  isOpen, 
  onClose, 
  profileId, 
  currentDisplayName, 
  minecraftUsername,
  onDisplayNameChanged 
}: ChangeDisplayNameModalProps) => {
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const { changeMinecraftDisplayName, loading } = useAccountManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      return;
    }
    
    try {
      await changeMinecraftDisplayName(profileId, displayName.trim());
      onDisplayNameChanged?.();
      onClose();
    } catch (error) {
      // Error already handled by the hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDisplayName(currentDisplayName || '');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Display Name</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              This is how your name will appear to other users. Your Minecraft username ({minecraftUsername}) cannot be changed.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Current Settings</Label>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Minecraft Username:</strong> {minecraftUsername}</div>
              <div><strong>Display Name:</strong> {currentDisplayName || minecraftUsername}</div>
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
              disabled={loading || !displayName.trim()}
            >
              {loading ? 'Updating...' : 'Update Display Name'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
