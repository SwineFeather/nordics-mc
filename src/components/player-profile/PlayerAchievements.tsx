
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Award, Sparkles } from 'lucide-react';
import AllAchievementsModal from './AllAchievementsModal';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementClaiming } from '@/hooks/useAchievementClaiming';
import type { UnlockedAchievement } from '@/types/achievements';
import { supabase } from '@/integrations/supabase/client';

interface PlayerAchievementsProps {
  achievements: UnlockedAchievement[];
  playerStats: any;
  playerUuid: string;
  playerUsername: string;
  onProfileUpdate?: () => void;
}

const PlayerAchievements = ({ 
  achievements: initialAchievements, 
  playerStats, 
  playerUuid, 
  playerUsername,
  onProfileUpdate
}: PlayerAchievementsProps) => {
  const { profile } = useAuth();
  const { claimableAchievements, fetchClaimableAchievements } = useAchievementClaiming();
  
  // Local state for unlocked achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>(initialAchievements);

  const isOwnProfile = profile?.minecraft_username?.toLowerCase() === playerUsername.toLowerCase();
  const isAdmin = profile?.role === 'admin';
  const canClaim = isOwnProfile || isAdmin;
  
  // Debug logging for permission issues
  console.log('PlayerAchievements permission debug:', {
    playerUsername,
    minecraftUsername: profile?.minecraft_username,
    userRole: profile?.role,
    isOwnProfile,
    isAdmin,
    canClaim,
    profileId: profile?.id
  });

  // Refetch unlocked achievements from the database
  const refreshUnlockedAchievements = useCallback(async () => {
    try {
      // Fetch from Supabase (same as in usePlayerProfile)
      const { data: achievementsData } = await supabase
        .from('unlocked_achievements')
        .select(`
          tier:achievement_tiers (
            *,
            definition:achievement_definitions (*)
          )
        `)
        .eq('player_uuid', playerUuid);

      const newAchievements = (achievementsData || [])
        .map((ua: any) => {
          if (!ua.tier || !ua.tier.definition) return null;
          return {
            ...ua.tier,
            achievementId: ua.tier.definition.id,
            achievementName: ua.tier.definition.name,
            stat: ua.tier.definition.stat,
            currentValue: playerStats[ua.tier.definition.stat] ?? 0,
            color: 'from-blue-500 to-purple-600',
          };
        })
        .filter((a: any) => a !== null);
      setUnlockedAchievements(newAchievements);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error('Failed to refresh unlocked achievements:', error);
    }
  }, [playerUuid, playerStats, onProfileUpdate]);

  useEffect(() => {
    setUnlockedAchievements(initialAchievements);
  }, [initialAchievements]);

  useEffect(() => {
    if (canClaim) {
      fetchClaimableAchievements(playerUuid);
    }
  }, [playerUuid, canClaim, fetchClaimableAchievements]);

  const claimableCount = claimableAchievements.filter(ca => ca.is_claimable).length;
  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  // Get recent achievements (last 3) - use a timestamp field that exists
  const recentAchievements = unlockedAchievements
    .sort((a, b) => {
      // Since unlockedAt doesn't exist, we'll sort by tier for now
      return b.tier - a.tier;
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Achievements
          <Badge variant="secondary">{unlockedAchievements.length}</Badge>
          {canClaim && claimableCount > 0 && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              {claimableCount} new!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canClaim && claimableCount > 0 && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                You have {claimableCount} achievement{claimableCount === 1 ? '' : 's'} ready to claim!
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total XP from achievements: <span className="font-medium text-foreground">{totalPoints}</span>
          </div>
          <AllAchievementsModal 
            playerUuid={playerUuid}
            playerUsername={playerUsername}
            playerStats={playerStats}
            unlockedAchievements={unlockedAchievements}
            onAchievementClaimed={refreshUnlockedAchievements}
          />
        </div>

        {unlockedAchievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No achievements unlocked yet.</p>
            <p className="text-sm">Complete various activities to earn achievements!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Achievements</h4>
            <div className="grid grid-cols-1 gap-2">
              {recentAchievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={`${achievement.achievementId}-${achievement.tier}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{achievement.achievementName}</p>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {achievement.points} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{achievement.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {unlockedAchievements.length > 3 && (
              <div className="text-center">
                <AllAchievementsModal 
                  playerUuid={playerUuid}
                  playerUsername={playerUsername}
                  playerStats={playerStats}
                  unlockedAchievements={unlockedAchievements}
                  onAchievementClaimed={refreshUnlockedAchievements}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerAchievements;
