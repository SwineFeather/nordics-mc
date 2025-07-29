
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Crown, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  tier_id: string;
  achievement_id: string;
  achievement_name: string;
  tier_name: string;
  tier_description: string;
  points: number;
  tier_number: number;
  current_value: number;
  threshold: number;
  is_claimable: boolean;
}

export interface AllAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerUuid: string;
  playerName: string;
  playerStats: any;
  unlockedAchievements: any[];
  onAchievementClaimed: () => Promise<void>;
}

export const AllAchievementsModal = ({ 
  isOpen, 
  onClose, 
  playerUuid, 
  playerName,
  playerStats,
  unlockedAchievements,
  onAchievementClaimed 
}: AllAchievementsModalProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [claimableAchievements, setClaimableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const loadAllAchievements = async () => {
    if (!playerUuid) return;
    
    setLoading(true);
    try {
      // Get all claimable achievements
      const { data: claimableData } = await supabase.rpc('get_claimable_achievements', {
        p_player_uuid: playerUuid
      });

      // Get all unlocked achievements
      const { data: unlockedData } = await supabase
        .from('unlocked_achievements')
        .select(`
          *,
          achievement_tiers!inner(
            name,
            description,
            points,
            tier,
            achievement_definitions!inner(
              name,
              description
            )
          )
        `)
        .eq('player_uuid', playerUuid);

      const formattedClaimable: Achievement[] = (claimableData || []).map((item: any) => ({
        id: item.tier_id,
        tier_id: item.tier_id,
        achievement_id: item.achievement_id,
        achievement_name: item.achievement_name,
        tier_name: item.tier_name,
        tier_description: item.tier_description,
        points: item.points,
        tier_number: item.tier_number,
        current_value: item.current_value,
        threshold: item.threshold,
        is_claimable: item.is_claimable
      }));

      const formattedUnlocked: Achievement[] = (unlockedData || []).map((item: any) => ({
        id: item.id.toString(),
        tier_id: item.tier_id || '',
        achievement_id: item.achievement_id,
        achievement_name: item.achievement_tiers?.achievement_definitions?.name || 'Unknown Achievement',
        tier_name: item.achievement_tiers?.name || 'Unknown Tier',
        tier_description: item.achievement_tiers?.description || '',
        points: item.achievement_tiers?.points || 0,
        tier_number: item.achievement_tiers?.tier || 1,
        current_value: 0,
        threshold: 0,
        is_claimable: false
      }));

      setClaimableAchievements(formattedClaimable);
      setAchievements(formattedUnlocked);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievement: Achievement) => {
    if (!achievement.tier_id) return;
    
    setClaiming(achievement.tier_id);
    try {
      const { data, error } = await supabase.rpc('admin_claim_achievement', {
        p_admin_user_id: playerUuid,
        p_player_uuid: playerUuid,
        p_tier_id: achievement.tier_id
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Claimed ${achievement.achievement_name} - ${achievement.tier_name}! +${data.xp_awarded} XP`);
        await onAchievementClaimed();
        await loadAllAchievements();
      } else {
        throw new Error(data?.message || 'Failed to claim achievement');
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim achievement');
    } finally {
      setClaiming(null);
    }
  };

  const getMedalIcon = (tierNumber: number) => {
    switch (tierNumber) {
      case 1: return <Award className="h-4 w-4 text-amber-600" />;
      case 2: return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3: return <Crown className="h-4 w-4 text-yellow-500" />;
      default: return <Gift className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMedalColor = (tierNumber: number) => {
    switch (tierNumber) {
      case 1: return 'bg-amber-100 border-amber-300';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  useEffect(() => {
    if (isOpen && playerUuid) {
      loadAllAchievements();
    }
  }, [isOpen, playerUuid]);

  const progressPercentage = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            {playerName}'s Achievements
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading achievements...</div>
        ) : (
          <div className="space-y-6">
            {/* Claimable Achievements */}
            {claimableAchievements.filter(a => a.is_claimable).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">🎉 Ready to Claim!</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimableAchievements
                    .filter(achievement => achievement.is_claimable)
                    .map((achievement) => (
                      <div key={achievement.tier_id} className={`p-4 rounded-lg border-2 border-green-300 bg-green-50`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(achievement.tier_number)}
                            <div>
                              <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.tier_name}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{achievement.points} XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{achievement.tier_description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.current_value.toLocaleString()} / {achievement.threshold.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={progressPercentage(achievement.current_value, achievement.threshold)} 
                            className="h-2"
                          />
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full mt-3 bg-green-600 hover:bg-green-700"
                          onClick={() => claimAchievement(achievement)}
                          disabled={claiming === achievement.tier_id}
                        >
                          {claiming === achievement.tier_id ? 'Claiming...' : '🏆 Claim Achievement'}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Progress Achievements */}
            {claimableAchievements.filter(a => !a.is_claimable).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">📈 In Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimableAchievements
                    .filter(achievement => !achievement.is_claimable)
                    .map((achievement) => (
                      <div key={achievement.tier_id} className={`p-4 rounded-lg border ${getMedalColor(achievement.tier_number)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(achievement.tier_number)}
                            <div>
                              <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.tier_name}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{achievement.points} XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{achievement.tier_description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.current_value.toLocaleString()} / {achievement.threshold.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={progressPercentage(achievement.current_value, achievement.threshold)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Completed Achievements */}
            {achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">✅ Completed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        {getMedalIcon(achievement.tier_number)}
                        <div>
                          <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.tier_name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.points} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length === 0 && claimableAchievements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No achievements found for this player.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
