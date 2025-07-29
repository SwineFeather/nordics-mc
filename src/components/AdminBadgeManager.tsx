
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, Trash2, Hammer, User, Star, Award, Sparkles, Crown, Heart, Globe, Book, Wrench, Flame, Sun, Moon, Zap, Key, Lock, Smile, Ghost, Skull, Leaf, Rocket, Sword, Wand2, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { toast } from 'sonner';

interface AdminBadgeManagerProps {
  playerUuid: string;
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const BADGE_TYPES = [
  { value: 'Player', label: 'Player', color: '#6b7280' },
  { value: 'Member', label: 'Member', color: '#22c55e' },
  { value: 'VIP', label: 'VIP', color: '#f59e0b' },
  { value: 'Former Supporter', label: 'Former Supporter', color: '#8b5cf6' },
  { value: 'Kala', label: 'Kala', color: '#22c55e' },
  { value: 'Fancy Kala', label: 'Fancy Kala', color: '#3b82f6' },
  { value: 'Golden Kala', label: 'Golden Kala', color: '#fbbf24' },
  { value: 'Moderator', label: 'Moderator', color: '#60a5fa' },
  { value: 'Helper', label: 'Helper', color: '#60a5fa' },
  { value: 'Admin', label: 'Admin', color: '#dc2626' },
];

const BADGE_ICONS = {
  User: <User className="w-4 h-4" />, Star: <Star className="w-4 h-4" />, Hammer: <Hammer className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />, Sparkles: <Sparkles className="w-4 h-4" />, Crown: <Crown className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />, Globe: <Globe className="w-4 h-4" />, Book: <Book className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />, Flame: <Flame className="w-4 h-4" />, Sun: <Sun className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />, Zap: <Zap className="w-4 h-4" />, Key: <Key className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />, Smile: <Smile className="w-4 h-4" />, Ghost: <Ghost className="w-4 h-4" />,
  Skull: <Skull className="w-4 h-4" />, Leaf: <Leaf className="w-4 h-4" />, Rocket: <Rocket className="w-4 h-4" />,
  Sword: <Sword className="w-4 h-4" />, Wand2: <Wand2 className="w-4 h-4" />, Medal: <Medal className="w-4 h-4" />
};

const AdminBadgeManager = ({ playerUuid, playerName, isOpen, onClose }: AdminBadgeManagerProps) => {
  const { userRole } = useAuth();
  const { data: badges, refetch } = usePlayerBadges(playerUuid);
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState({
    type: '',
    color: '#6b7280',
    isVerified: false,
    icon: 'User',
    iconOnly: false
  });

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  if (!isAdmin) {
    return null;
  }

  const handleAddBadge = async () => {
    if (!newBadge.type) {
      toast.error('Please select a badge type');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('player_badges')
        .insert({
          player_uuid: playerUuid,
          badge_type: newBadge.type,
          badge_color: newBadge.color,
          is_verified: newBadge.isVerified,
          icon: newBadge.icon,
          icon_only: newBadge.iconOnly
        });

      if (error) throw error;

      toast.success(`${newBadge.type} badge added to ${playerName}`);
      setNewBadge({ type: '', color: '#6b7280', isVerified: false, icon: 'User', iconOnly: false });
      refetch();
    } catch (error) {
      console.error('Error adding badge:', error);
      toast.error('Failed to add badge');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (badgeId: string, badgeType: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('player_badges')
        .delete()
        .eq('id', badgeId);

      if (error) throw error;

      toast.success(`${badgeType} badge removed from ${playerName}`);
      refetch();
    } catch (error) {
      console.error('Error removing badge:', error);
      toast.error('Failed to remove badge');
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeTypeChange = (value: string) => {
    const badgeType = BADGE_TYPES.find(b => b.value === value);
    setNewBadge(prev => ({
      ...prev,
      type: value,
      color: badgeType?.color || '#6b7280'
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage Badges - {playerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {badges && badges.length > 0 ? (
                badges.map((badge) => {
                  const IconComponent = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User;
                  return (
                    <div key={badge.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge 
                          style={{ backgroundColor: badge.badge_color, color: 'white' }}
                          className="text-xs flex items-center gap-1"
                        >
                          {IconComponent}
                          {!badge.icon_only && <span>{badge.badge_type}</span>}
                        </Badge>
                        {badge.is_verified && (
                          <span className="text-xs text-green-600 font-medium">Verified</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBadge(badge.id, badge.badge_type)}
                        disabled={loading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No badges assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Add New Badge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Badge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="badgeType">Badge Type</Label>
                <Select value={newBadge.type} onValueChange={handleBadgeTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="badgeIcon">Badge Icon</Label>
                <Select value={newBadge.icon} onValueChange={icon => setNewBadge(prev => ({ ...prev, icon }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BADGE_ICONS).map(([key, IconComponent]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {IconComponent}
                          <span>{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="badgeColor">Badge Color</Label>
                <Input
                  id="badgeColor"
                  type="color"
                  value={newBadge.color}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={newBadge.isVerified}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, isVerified: e.target.checked }))}
                />
                <Label htmlFor="isVerified">Mark as verified</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="iconOnly"
                  checked={newBadge.iconOnly}
                  onChange={e => setNewBadge(prev => ({ ...prev, iconOnly: e.target.checked }))}
                />
                <Label htmlFor="iconOnly">Icon only</Label>
              </div>
              
              <Button onClick={handleAddBadge} disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Badge'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBadgeManager;
