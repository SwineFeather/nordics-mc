
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Clock, Sparkles, CheckCircle, Lock } from 'lucide-react';
import { achievements } from '@/config/achievements';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementClaiming, type ClaimableAchievement } from '@/hooks/useAchievementClaiming';
import { ClaimButton } from '@/components/achievements/ClaimButton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DialogDescription } from '@/components/ui/dialog';

interface AllAchievementsModalProps {
  playerUuid: string;
  playerUsername: string;
  playerStats: any;
  unlockedAchievements: any[];
  onAchievementClaimed?: () => void; // Add callback prop
}

// Convert raw stat values to display values for specific achievements
const convertStatValue = (statKey: string, rawValue: number): number => {
  switch (statKey) {
    case 'custom_minecraft_play_time':
      // Convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      return Math.floor(rawValue / 72000);
    case 'custom_minecraft_boat_one_cm':
      // Convert centimeters to blocks (100 cm = 1 block)
      return Math.floor(rawValue / 100);
    default:
      return rawValue;
  }
};

// Helper to robustly resolve tier_id for any achievement/tier
const getTierIdForAchievement = async (
  achievementId: string,
  tierNum: number,
  claimableAchievements: any[],
  unlockedAchievements: any[],
): Promise<string | null> => {
  // 1. Try claimableAchievements
  const foundClaimable = claimableAchievements.find(
    ca => ca.achievement_id === achievementId && ca.tier_number === tierNum
  );
  if (foundClaimable) return foundClaimable.tier_id;
  // 2. Try unlockedAchievements
  const foundUnlocked = unlockedAchievements.find(
    ua => ua.achievementId === achievementId && ua.tier === tierNum && ua.tier_id
  );
  if (foundUnlocked) return foundUnlocked.tier_id;
  // 3. Try config (achievements) - but config doesn't have tier_id, so fetch from DB
  // 4. Fetch from Supabase achievement_tiers
  const { data, error } = await supabase
    .from('achievement_tiers')
    .select('id')
    .eq('achievement_id', achievementId)
    .eq('tier', tierNum)
    .single();
  if (error || !data) {
    console.error('Could not find tier_id in DB for admin claim:', { achievementId, tierNum, error });
    return null;
  }
  return data.id;
};

// Helper to robustly get nested stat value from playerStats using dot notation
const getStatValue = (playerStats: any, statKey: string): number => {
  if (!statKey) return 0;
  // Support dot notation for nested stats (e.g., 'mined.wheat')
  if (statKey.includes('.')) {
    const parts = statKey.split('.');
    let value = playerStats;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return 0;
      }
    }
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null && 'value' in value) return value.value;
    return 0;
  }
  // Try direct key
  let stat = playerStats?.[statKey];
  if (stat !== undefined) {
    if (typeof stat === 'object' && stat !== null && 'value' in stat) return stat.value;
    if (typeof stat === 'number') return stat;
  }
  return 0;
};

const AllAchievementsModal = ({ 
  playerUuid, 
  playerUsername, 
  playerStats, 
  unlockedAchievements, 
  onAchievementClaimed // Destructure callback
}: AllAchievementsModalProps) => {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const { 
    claimableAchievements, 
    fetchClaimableAchievements, 
    claimAchievement, 
    adminClaimAchievement,
    isLoading 
  } = useAchievementClaiming();
  const { toast } = useToast();

  const isOwnProfile = profile?.minecraft_username?.toLowerCase() === playerUsername.toLowerCase();
  const isAdmin = profile?.role === 'admin';
  const canClaim = isOwnProfile || isAdmin;
  
  // Debug logging for admin claim button visibility
  console.log('AllAchievementsModal permission debug:', {
    playerUsername,
    minecraftUsername: profile?.minecraft_username,
    userRole: profile?.role,
    isOwnProfile,
    isAdmin,
    canClaim,
    claimableCount: claimableAchievements.filter(ca => ca.is_claimable).length
  });

  useEffect(() => {
    if (open && canClaim && profile) {
      fetchClaimableAchievements(playerUuid);
    }
  }, [open, playerUuid, canClaim, fetchClaimableAchievements, profile]);

  const handleClaimAchievement = async (tierIdOrCompound: string) => {
    if (!user) {
      console.error('No user found for claiming achievement');
      toast({ title: 'Error', description: 'No user found for claiming achievement', variant: 'destructive' });
      return;
    }
    
    console.log('Claiming achievement:', {
      tierId: tierIdOrCompound,
      playerUuid,
      playerUsername,
      isAdmin,
      isOwnProfile,
      userId: user.id
    });
    
    let tierId = tierIdOrCompound;
    let debugInfo: any = { tierIdOrCompound, userId: user.id, playerUuid, isAdmin, isOwnProfile };
    if (tierIdOrCompound.includes(':')) {
      const [achievementId, tierNumStr] = tierIdOrCompound.split(':');
      const tierNum = parseInt(tierNumStr, 10);
      debugInfo.achievementId = achievementId;
      debugInfo.tierNum = tierNum;
      // Robustly resolve tier_id for admin claim
      tierId = await getTierIdForAchievement(achievementId, tierNum, claimableAchievements, unlockedAchievements);
      debugInfo.resolvedTierId = tierId;
      if (!tierId) {
        console.error('Could not resolve tier_id for admin claim:', debugInfo);
        toast({ title: 'Error', description: `Could not resolve tier_id for admin claim: ${achievementId} tier ${tierNum}`, variant: 'destructive' });
        return;
      }
    }
    
    try {
      if (isAdmin && !isOwnProfile) {
        console.log('Admin claiming achievement for another player', debugInfo);
        const result = await adminClaimAchievement(user.id, playerUuid, tierId);
        console.log('Admin claim result:', result);
        if (!result.success) {
          toast({ title: 'Admin Claim Failed', description: result.message || 'Unknown error', variant: 'destructive' });
          console.error('Admin claim failed:', result, debugInfo);
        } else {
          toast({ title: 'Admin Claim Success', description: `Awarded achievement! XP: ${result.xp_awarded}`, variant: 'default' });
          if (onAchievementClaimed) onAchievementClaimed();
        }
      } else {
        console.log('User claiming own achievement', debugInfo);
        const result = await claimAchievement(playerUuid, tierId);
        console.log('Claim result:', result);
        if (!result.success) {
          toast({ title: 'Claim Failed', description: result.message || 'Unknown error', variant: 'destructive' });
          console.error('Claim failed:', result, debugInfo);
        } else {
          toast({ title: 'Claim Success', description: `Achievement claimed! XP: ${result.xp_awarded}`, variant: 'default' });
          if (onAchievementClaimed) onAchievementClaimed();
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error claiming achievement', variant: 'destructive' });
      console.error('Error claiming achievement:', error, debugInfo);
    }
  };

  const getAchievementState = (achievementId: string, tier: number) => {
    // Check if it's claimable (for normal users)
    const claimable = claimableAchievements.find(
      ca => ca.achievement_id === achievementId && ca.tier_number === tier && ca.is_claimable
    );
    if (claimable) {
      return { state: 'claimable', data: claimable };
    }
    // Check if it's already claimed/unlocked
    const unlocked = unlockedAchievements.find(
      ua => ua.achievementId === achievementId && ua.tier === tier
    );
    if (unlocked) return { state: 'claimed', data: unlocked };
    // If admin and not own profile, allow admin-claim for any unclaimed achievement
    if (isAdmin && !isOwnProfile) {
      return { state: 'admin-claimable', data: { achievementId, tier } };
    }
    // Otherwise it's locked
    return { state: 'locked', data: null };
  };

  const claimableCount = claimableAchievements.filter(ca => ca.is_claimable).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Trophy className="w-4 h-4 mr-2" />
          All Achievements
          {canClaim && claimableCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-yellow-100 text-yellow-800 animate-pulse"
            >
              {claimableCount} Ready!
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Achievements - {playerUsername}</DialogTitle>
          <DialogDescription>
            View and claim achievements for {playerUsername}. Admins can claim any achievement for other players.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>

              <div className="grid gap-3 pl-4">
                {achievement.tiers.map((tier, index) => {
                  // Use unlockedAchievements to determine claimed state
                  const { state, data } = getAchievementState(achievement.id, tier.tier);
                  const IconComponent = tier.icon;
                  
                  // Get current progress - support dot notation for nested stats
                  const rawValue = getStatValue(playerStats, achievement.stat);
                  // Convert the raw value to display value for progress calculation
                  const displayValue = convertStatValue(achievement.stat, rawValue);
                  const progress = Math.min((displayValue / tier.threshold) * 100, 100);

                  return (
                    <div
                      key={tier.tier}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all duration-300",
                        state === 'claimable' && "border-yellow-400 bg-yellow-50 shadow-lg ring-2 ring-yellow-200",
                        state === 'claimed' && "border-green-200 bg-green-50",
                        state === 'locked' && "border-gray-200 bg-gray-50 opacity-75"
                      )}
                    >
                      {/* Pulsing effect for claimable achievements */}
                      {state === 'claimable' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-lg animate-pulse" />
                      )}
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            state === 'claimable' && "bg-yellow-500 text-white animate-pulse",
                            state === 'claimed' && "bg-green-500 text-white",
                            state === 'locked' && "bg-gray-300 text-gray-600"
                          )}>
                            {state === 'claimed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : state === 'locked' ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              <IconComponent className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{tier.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {tier.points} XP
                              </Badge>
                              {state === 'claimable' && (
                                <Badge className="bg-yellow-500 text-white animate-bounce text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Ready!
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tier.description}</p>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress: {displayValue.toLocaleString()} / {tier.threshold.toLocaleString()} ({Math.round(progress)}%)</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>
                        </div>

                        {/* Claim button for claimable achievements */}
                        {state === 'claimable' && canClaim && data && (
                          <ClaimButton
                            onClaim={() => handleClaimAchievement(data.tier_id)}
                            isLoading={isLoading}
                            className="shrink-0"
                          >
                            {isAdmin && !isOwnProfile ? 'Admin Claim' : 'Hold to Claim'}
                          </ClaimButton>
                        )}
                        {/* Admin claim button for any unclaimed achievement */}
                        {state === 'admin-claimable' && isAdmin && !isOwnProfile && (
                          <ClaimButton
                            onClaim={() => handleClaimAchievement(`${achievement.id}:${tier.tier}`)}
                            isLoading={isLoading}
                            className="shrink-0"
                          >
                            Admin Claim
                          </ClaimButton>
                        )}

                        {/* Status indicators */}
                        {state === 'claimed' && (
                          <div className="shrink-0 flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Claimed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllAchievementsModal;
