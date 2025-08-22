import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  X, 
  Edit3, 
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { NationCollaborationService, NationCollaborator } from '@/services/nationCollaborationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NationCollaborationManagerProps {
  nationName: string;
  className?: string;
}

const NationCollaborationManager = ({ nationName, className = "" }: NationCollaborationManagerProps) => {
  const { user, profile } = useAuth();
  const [collaborators, setCollaborators] = useState<NationCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'collaborator' | 'moderator' | 'admin'>('collaborator');
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load collaborators
  useEffect(() => {
    loadCollaborators();
  }, [nationName]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await NationCollaborationService.getNationCollaborators(nationName);
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user?.id || !profile?.minecraft_username) {
      toast.error('You must be logged in to invite collaborators');
      return;
    }

    if (!inviteUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setInviting(true);
    try {
      const success = await NationCollaborationService.inviteCollaborator(
        nationName,
        inviteUsername.trim(), // Note: This would need to be a real user ID in practice
        inviteUsername.trim(),
        inviteRole,
        user.id,
        profile.minecraft_username
      );

      if (success) {
        setShowInviteDialog(false);
        setInviteUsername('');
        setInviteRole('collaborator');
        loadCollaborators(); // Refresh the list
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      const success = await NationCollaborationService.removeCollaborator(
        nationName,
        collaboratorId,
        user.id
      );

      if (success) {
        loadCollaborators(); // Refresh the list
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: 'collaborator' | 'moderator' | 'admin') => {
    if (!user?.id) return;

    try {
      const success = await NationCollaborationService.updateCollaboratorRole(
        nationName,
        collaboratorId,
        newRole,
        user.id
      );

      if (success) {
        loadCollaborators(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating collaborator role:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'collaborator':
      default:
        return <User className="w-4 h-4 text-green-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      case 'collaborator':
      default:
        return 'outline';
    }
  };

  const filteredCollaborators = collaborators.filter(collab =>
    collab.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collab.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Collaboration Management
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowInviteDialog(true)}
              className="h-8"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Collaborator
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search collaborators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Collaborators List */}
          {filteredCollaborators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-2">No collaborators yet</p>
              <p className="text-sm">Invite players to help manage your nation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(collaborator.role)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{collaborator.username}</span>
                        <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                          {collaborator.role}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Invited by {collaborator.invited_by_username} • {new Date(collaborator.invited_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Role Update */}
                    <Select
                      value={collaborator.role}
                      onValueChange={(value: 'collaborator' | 'moderator' | 'admin') => 
                        handleUpdateRole(collaborator.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborator">Collaborator</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Collaborator to {nationName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter Minecraft username"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'collaborator' | 'moderator' | 'admin') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Collaborator
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Moderator
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Descriptions */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span><strong>Collaborator:</strong> Can upload photos, edit descriptions, lore, and motto</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span><strong>Moderator:</strong> All collaborator permissions plus can delete photos and approve content</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span><strong>Admin:</strong> All permissions including managing other collaborators</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteUsername.trim()}
                className="flex-1"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NationCollaborationManager;
