
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  achievement_id: string;
  achievement_name: string;
  tier_name: string;
  tier_description: string;
  points: number;
  tier_number: number;
  current_value: number;
  threshold: number;
  is_claimable: boolean;
  unlocked_at?: string;
  is_claimed?: boolean;
}

interface AllAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerUuid: string;
  playerName: string;
}

const AllAchievementsModal: React.FC<AllAchievementsModalProps> = ({
  isOpen,
  onClose,
  playerUuid,
  playerName
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && playerUuid) {
      fetchAchievements();
    }
  }, [isOpen, playerUuid]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // Fetch all available achievements
      const { data: allAchievements, error: allError } = await supabase
        .rpc('get_claimable_achievements', { p_player_uuid: playerUuid });

      if (allError) throw allError;

      // Fetch unlocked achievements
      const { data: unlocked, error: unlockedError } = await supabase
        .from('unlocked_achievements')
        .select(`
          *,
          achievement_tiers(
            id,
            name,
            description,
            points,
            tier,
            threshold,
            achievement_definitions(
              id,
              name,
              achievement_type
            )
          )
        `)
        .eq('player_uuid', playerUuid);

      if (unlockedError) throw unlockedError;

      setAchievements(allAchievements || []);
      setUnlockedAchievements(unlocked || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (tierId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('claim-achievement', {
        body: {
          player_uuid: playerUuid,
          tier_id: tierId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Achievement claimed! +${data.xp_awarded} XP`);
        fetchAchievements();
      } else {
        toast.error(data.message || 'Failed to claim achievement');
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim achievement');
    }
  };

  const getProgressPercentage = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1: return <Trophy className="h-4 w-4 text-bronze" />;
      case 2: return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3: return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {playerName}'s Achievements
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4 max-h-[50vh] overflow-y-auto">
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No achievements available to claim</p>
                </div>
              ) : (
                achievements.map((achievement) => (
                  <Card key={achievement.tier_id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTierIcon(achievement.tier_number)}
                          <h3 className="font-semibold">{achievement.achievement_name}</h3>
                          <Badge variant="outline">
                            Tier {achievement.tier_number}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.tier_description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.current_value} / {achievement.threshold}</span>
                          </div>
                          <Progress 
                            value={getProgressPercentage(achievement.current_value, achievement.threshold)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-primary">
                          +{achievement.points} XP
                        </div>
                        {achievement.is_claimable && (
                          <Button
                            size="sm"
                            onClick={() => claimAchievement(achievement.tier_id)}
                            className="mt-2"
                          >
                            Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="unlocked" className="space-y-4 max-h-[50vh] overflow-y-auto">
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No achievements unlocked yet</p>
                </div>
              ) : (
                unlockedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <h3 className="font-semibold">
                            {achievement.achievement_tiers?.achievement_definitions?.name}
                          </h3>
                          <Badge variant="outline">
                            Tier {achievement.achievement_tiers?.tier}
                          </Badge>
                          {achievement.is_claimed && (
                            <Badge variant="default">Claimed</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.achievement_tiers?.description}
                        </p>
                        {achievement.unlocked_at && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-primary">
                          +{achievement.achievement_tiers?.points} XP
                        </div>
                        {!achievement.is_claimed && (
                          <Button
                            size="sm"
                            onClick={() => claimAchievement(achievement.achievement_tiers?.id)}
                            className="mt-2"
                          >
                            Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AllAchievementsModal;
