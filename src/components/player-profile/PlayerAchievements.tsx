import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AllAchievementsModal } from './AllAchievementsModal';

interface PlayerAchievementsProps {
  playerUuid: string;
  playerStats: any;
}

export const PlayerAchievements = ({ playerUuid, playerStats }: PlayerAchievementsProps) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showClaimableModal, setShowClaimableModal] = useState(false);

  const loadAchievements = async () => {
    if (!playerUuid) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq('player_uuid', playerUuid)
        .limit(6);

      if (error) throw error;
      setUnlockedAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [playerUuid]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              {unlockedAchievements.length} unlocked
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge onClick={() => setShowClaimableModal(true)} className="cursor-pointer">
              Claimable
            </Badge>
            <Badge onClick={() => setShowAllModal(true)} className="cursor-pointer">
              View All
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div key={achievement.id} className="p-3 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-sm">{achievement.achievement_tiers?.achievement_definitions?.name}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.achievement_tiers?.name}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{achievement.achievement_tiers?.points} XP
                </Badge>
              </div>
            ))}
            {unlockedAchievements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No achievements unlocked yet.
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <AllAchievementsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        playerUuid={playerUuid}
        playerName={playerStats?.name || 'Unknown Player'}
        playerStats={playerStats}
        unlockedAchievements={unlockedAchievements}
        onAchievementClaimed={loadAchievements}
      />
      
      <AllAchievementsModal
        isOpen={showClaimableModal}
        onClose={() => setShowClaimableModal(false)}
        playerUuid={playerUuid}
        playerName={playerStats?.name || 'Unknown Player'}
        playerStats={playerStats}
        unlockedAchievements={unlockedAchievements}
        onAchievementClaimed={loadAchievements}
      />
    </Card>
  );
};
