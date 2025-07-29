import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Sparkles, Users, Crown, Star, CheckCircle, Lock, Clock, Globe, Home, Castle, Building, MapPin, Flag } from 'lucide-react';
import { getTownAchievements, claimTownAchievement, getTownAchievementDefinitions } from '@/lib/townLeveling';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TownAchievementsProps {
  townId: string;
  townName: string;
  townData: any; // Pass town data to calculate progress
  className?: string;
}

interface TownAchievement {
  id: string;
  tier_id: string;
  unlocked_at: string;
  is_claimed: boolean;
  claimed_at?: string;
  tier: {
    id: string;
    tier: number;
    name: string;
    description: string;
    threshold: number;
    points: number;
    icon: string;
    color: string;
    definition: {
      id: string;
      name: string;
      description: string;
      stat: string;
    };
  };
}

interface TownAchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  tiers: {
    id: string;
    tier: number;
    name: string;
    description: string;
    threshold: number;
    points: number;
    icon: string;
    color: string;
  }[];
}

const TownAchievements = ({ townId, townName, townData, className = "" }: TownAchievementsProps) => {
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [achievements, setAchievements] = useState<TownAchievement[]>([]);
  const [allDefinitions, setAllDefinitions] = useState<TownAchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Check if user can claim achievements (town mayor, admin, or moderator)
  const canClaim = profile?.role === 'admin' || profile?.role === 'moderator' || 
                   (townData?.mayor && profile?.minecraft_username && 
                    townData.mayor.toLowerCase() === profile.minecraft_username.toLowerCase());

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        const [achievementsData, definitionsData] = await Promise.all([
          getTownAchievements(townId),
          getTownAchievementDefinitions()
        ]);
        
        setAchievements(achievementsData);
        setAllDefinitions(definitionsData);
      } catch (error) {
        console.error('Error loading town achievements:', error);
        toast({
          title: "Error",
          description: "Failed to load town achievements",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (townId) {
      loadAchievements();
    }
  }, [townId, toast]);

  const handleClaimAchievement = async (townId: string, tierId: string) => {
    try {
      setClaiming(tierId);
      console.log('Claiming achievement:', { townId, tierId, canClaim, user: user?.id, profile: profile?.role });
      
      const result = await claimTownAchievement(townId, tierId);
      console.log('Claim result:', result);
      
      if (result.success) {
        toast({
          title: "Achievement Claimed! 🎉",
          description: `Earned ${result.xp_awarded} XP for ${result.achievement_name} - ${result.tier_name}`,
        });
        
        // Refresh achievements
        const updatedAchievements = await getTownAchievements(townId);
        setAchievements(updatedAchievements);
      } else {
        console.error('Claim failed:', result.message);
        toast({
          title: "Error",
          description: result.message || "Failed to claim achievement",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast({
        title: "Error",
        description: "Failed to claim achievement",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const totalPoints = achievements.reduce((sum, achievement) => {
    if (achievement.is_claimed) {
      return sum + achievement.tier.points;
    }
    return sum;
  }, 0);

  const unclaimedCount = achievements.filter(a => !a.is_claimed).length;
  
  // Debug logging for permission issues (moved after unclaimedCount is defined)
  console.log('TownAchievements permission debug:', {
    townName,
    userRole: profile?.role,
    minecraftUsername: profile?.minecraft_username,
    townMayor: townData?.mayor,
    canClaim,
    townId,
    achievementsCount: achievements.length,
    unclaimedCount
  });

  // Get recent achievements (last 3)
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 3);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'trophy': Trophy,
      'award': Award,
      'users': Users,
      'crown': Crown,
      'star': Star,
      'clock': Clock,
      'globe': Globe,
      'home': Home,
      'castle': Castle,
      'building': Building,
      'map-pin': MapPin,
      'flag': Flag,
    };
    return iconMap[iconName] || Trophy;
  };

  // Calculate town stat value for achievement progress
  const getTownStatValue = (stat: string): number => {
    switch (stat) {
      case 'population':
        return townData?.residents_count || 0;
      case 'nation_member':
        return townData?.nation_name ? 1 : 0;
      case 'independent':
        return townData?.nation_name ? 0 : 1;
      case 'capital':
        return townData?.is_capital ? 1 : 0;
      case 'age':
        if (!townData?.created_at) return 0;
        const created = new Date(townData.created_at);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); // Days
      case 'activity':
        return townData?.activity_score || (townData?.residents_count > 0 ? 1 : 0);
      case 'wealth':
        return townData?.balance || 0;
      case 'plots':
        return townData?.plots_count || 0;
      default:
        return 0;
    }
  };

  // Get achievement state (locked, unlocked, claimed)
  const getAchievementState = (achievementId: string, tier: number) => {
    // Check if it's already claimed/unlocked
    const unlocked = achievements.find(
      ua => ua.tier.definition.id === achievementId && ua.tier.tier === tier
    );
    if (unlocked) {
      const state = unlocked.is_claimed ? 'claimed' : 'unlocked';
      console.log(`Achievement ${achievementId} tier ${tier}:`, { state, is_claimed: unlocked.is_claimed, data: unlocked });
      return { state, data: unlocked };
    }

    // Check if it should be unlocked based on current stats
    const definition = allDefinitions.find(d => d.id === achievementId);
    if (definition) {
      const currentValue = getTownStatValue(definition.stat);
      const tierData = definition.tiers.find(t => t.tier === tier);
      if (tierData && currentValue >= tierData.threshold) {
        console.log(`Achievement ${achievementId} tier ${tier}:`, { state: 'unlocked', currentValue, threshold: tierData.threshold, data: null });
        return { state: 'unlocked', data: null };
      }
    }

    // Otherwise it's locked
    console.log(`Achievement ${achievementId} tier ${tier}:`, { state: 'locked', data: null });
    return { state: 'locked', data: null };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Town Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Town Achievements
          <Badge variant="secondary">{achievements.length}</Badge>
          {totalPoints > 0 && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              {totalPoints} points
            </Badge>
          )}
          {canClaim && unclaimedCount > 0 && (
            <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              {unclaimedCount} to claim!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No achievements unlocked yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete town objectives to unlock achievements
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {recentAchievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.tier.icon);
                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                      achievement.is_claimed 
                        ? "border-green-200 bg-green-50" 
                        : "border-yellow-200 bg-yellow-50 shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full",
                      achievement.is_claimed 
                        ? "bg-green-100 text-green-600" 
                        : "bg-yellow-100 text-yellow-600"
                    )}>
                      {achievement.is_claimed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{achievement.tier.definition.name}</p>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {achievement.tier.points} pts
                        </Badge>
                        {!achievement.is_claimed && canClaim && (
                          <Badge className="bg-yellow-500 text-white animate-pulse text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Ready!
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{achievement.tier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.is_claimed ? 'Claimed' : 'Unlocked'} {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!achievement.is_claimed && canClaim && (
                      <Button
                        size="sm"
                        onClick={() => handleClaimAchievement(townId, achievement.tier_id)}
                        disabled={claiming === achievement.tier_id}
                        className="shrink-0"
                      >
                        {claiming === achievement.tier_id ? 'Claiming...' : 'Claim'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total XP from achievements: <span className="font-medium text-foreground">{totalPoints}</span>
              </div>
              <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Trophy className="w-4 h-4 mr-2" />
                    All Achievements
                    {canClaim && unclaimedCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-yellow-100 text-yellow-800 animate-pulse"
                      >
                        {unclaimedCount} Ready!
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      All Achievements for {townName}
                      {canClaim && unclaimedCount > 0 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {unclaimedCount} to claim!
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      Total achievement points: {totalPoints} | Unclaimed: {unclaimedCount}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {allDefinitions.map((achievement) => (
                      <div key={achievement.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{achievement.name}</h3>
                          <Badge variant="outline">{achievement.stat}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>

                        <div className="grid gap-3 pl-4">
                          {achievement.tiers.map((tier) => {
                            const { state, data } = getAchievementState(achievement.id, tier.tier);
                            const IconComponent = getIconComponent(tier.icon);
                            
                            // Get current progress
                            const currentValue = getTownStatValue(achievement.stat);
                            const progress = Math.min((currentValue / tier.threshold) * 100, 100);

                            return (
                              <div
                                key={tier.tier}
                                className={cn(
                                  "relative p-4 rounded-lg border-2 transition-all duration-300",
                                  state === 'unlocked' && !data?.is_claimed && "border-yellow-400 bg-yellow-50 shadow-lg ring-2 ring-yellow-200",
                                  state === 'claimed' && "border-green-200 bg-green-50",
                                  state === 'locked' && "border-gray-200 bg-gray-50 opacity-75"
                                )}
                              >
                                {/* Pulsing effect for unlocked but unclaimed achievements */}
                                {state === 'unlocked' && !data?.is_claimed && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-lg animate-pulse" />
                                )}
                                
                                <div className="relative flex items-center gap-3">
                                  <div className={cn(
                                    "p-2 rounded-full",
                                    state === 'claimed' && "bg-green-100 text-green-600",
                                    state === 'unlocked' && !data?.is_claimed && "bg-yellow-100 text-yellow-600",
                                    state === 'locked' && "bg-gray-100 text-gray-400"
                                  )}>
                                    {state === 'claimed' ? (
                                      <CheckCircle className="w-5 h-5" />
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
                                      {state === 'unlocked' && !data?.is_claimed && (
                                        <Badge className="bg-yellow-500 text-white animate-bounce text-xs">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          Ready!
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                                    
                                    <div className="mt-2 space-y-1">
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress: {(currentValue || 0).toLocaleString()} / {tier.threshold.toLocaleString()} ({Math.round(progress)}%)</span>
                                      </div>
                                      <Progress value={progress} className="h-2" />
                                    </div>
                                  </div>
                                </div>

                                {/* Claim button for unlocked but unclaimed achievements */}
                                {state === 'unlocked' && !data?.is_claimed && canClaim && (
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      onClick={() => {
                                        console.log('Claim button clicked:', { 
                                          townId, 
                                          tierId: tier.id, 
                                          canClaim, 
                                          state, 
                                          data: data?.id,
                                          userRole: profile?.role 
                                        });
                                        handleClaimAchievement(townId, tier.id);
                                      }}
                                      disabled={claiming === tier.id}
                                      className="shrink-0 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold shadow-lg"
                                      style={{ zIndex: 1000, position: 'relative' }}
                                    >
                                      {claiming === tier.id ? 'Claiming...' : 'Claim Achievement'}
                                    </Button>
                                  </div>
                                )}

                                {/* Debug info for claim button visibility */}
                                {state === 'unlocked' && !data?.is_claimed && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Debug: state={state}, canClaim={canClaim?.toString() || 'undefined'}, userRole={profile?.role}
                                  </div>
                                )}

                                {/* Status indicators */}
                                {state === 'claimed' && (
                                  <div className="mt-3 flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Claimed</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TownAchievements; 