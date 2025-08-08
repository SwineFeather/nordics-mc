import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Pickaxe, 
  Sword, 
  Clock, 
  Medal, 
  Activity, 
  Target, 
  Heart, 
  Zap,
  MapPin,
  Building,
  Crown,
  Star,
  Award,
  Sparkles,
  Globe,
  Book,
  Wrench,
  Flame,
  Sun,
  Moon,
  Key,
  Lock,
  Smile,
  Ghost,
  Skull,
  Leaf,
  Rocket,
  Wand2,
  User,
  TrendingUp,
  Shield,
  Calendar,
  X,
  Coins,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AllStatisticsModal from './AllStatisticsModal';
import AllAchievementsModal from '../player-profile/AllAchievementsModal';
import { usePlayerLeaderboard } from '../../hooks/usePlayerLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import AdminBadgeManager from '../AdminBadgeManager';
import { calculateLevelInfoSync } from '@/lib/leveling';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';

interface PlayerStatsDetailProps {
  profile: any;
  onClose: () => void;
}

// Badge icons mapping
const BADGE_ICONS = {
  User: User,
  Star: Star,
  Crown: Crown,
  Shield: Shield,
  Award: Award,
  Sparkles: Sparkles,
  Globe: Globe,
  Book: Book,
  Wrench: Wrench,
  Flame: Flame,
  Sun: Sun,
  Moon: Moon,
  Key: Key,
  Lock: Lock,
  Smile: Smile,
  Ghost: Ghost,
  Skull: Skull,
  Leaf: Leaf,
  Rocket: Rocket,
  Wand2: Wand2,
  Heart: Heart,
  Zap: Zap,
  Activity: Activity,
  Target: Target,
  Medal: Medal,
  Clock: Clock,
  Sword: Sword,
  Pickaxe: Pickaxe,
  Building: Building,
  MapPin: MapPin,
  TrendingUp: TrendingUp,
  Calendar: Calendar
};

const PlayerStatsDetail: React.FC<PlayerStatsDetailProps> = ({ profile: initialProfile, onClose }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [showAllStats, setShowAllStats] = useState(false);
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [playerBio, setPlayerBio] = useState<string>('');
  const [bioLoading, setBioLoading] = useState(true);
  const { userRole } = useAuth();
  const stats = profile.stats || {};
  const { data: leaderboardData, loading: leaderboardLoading } = usePlayerLeaderboard(profile.id);

  // Refetch player profile from backend
  const { profile: freshProfile, refetch } = usePlayerProfile(profile.id);
  const { data: residentData } = usePlayerResidentData(profile.username);

  // When freshProfile changes, update local profile state
  useEffect(() => {
    if (freshProfile) setProfile(freshProfile);
  }, [freshProfile]);

  // Function to refresh profile after claim
  const refreshProfile = async () => {
    await refetch();
  };
  
  // Fetch bio from profiles table
  React.useEffect(() => {
    const fetchBio = async () => {
      if (!profile.username) {
        setBioLoading(false);
        return;
      }

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('minecraft_username', profile.username)
          .single();
        
        if (error) {
          console.log('No auth profile linked for player:', profile.username);
          setPlayerBio('');
        } else {
          setPlayerBio(profileData?.bio || '');
        }
      } catch (error) {
        console.log('Error fetching bio for player:', profile.username);
        setPlayerBio('');
      } finally {
        setBioLoading(false);
      }
    };

    fetchBio();
  }, [profile.username]);
  
  // Calculate level info for display
  const levelInfo = profile.levelInfo || calculateLevelInfoSync(profile.levelInfo?.totalXp || 0);
  
  // Ensure levelInfo has all required properties
  const safeLevelInfo = {
    level: levelInfo?.level || 1,
    totalXp: levelInfo?.totalXp || 0,
    xpInCurrentLevel: levelInfo?.xpInCurrentLevel || 0,
    xpForNextLevel: levelInfo?.xpForNextLevel || 100,
    progress: levelInfo?.progress || 0,
    title: levelInfo?.title || 'Newcomer',
    description: levelInfo?.description || 'Welcome to the server!',
    color: levelInfo?.color || '#6b7280'
  };

  // Helper function to safely get numeric values
  const getNumericStat = (value: number | { [key: string]: number } | undefined): number => {
    if (typeof value === 'number') return value;
    return 0;
  };

  // Helper function to parse dates correctly
  const parseDate = (dateString: string | number): Date => {
    if (typeof dateString === 'number') {
      // If it's a Unix timestamp (seconds), convert to milliseconds
      return new Date(dateString * 1000);
    }
    return new Date(dateString);
  };

  // Calculate summary stats using the correct stat keys
  const playtimeHours = stats.playtimeHours || 0;
  const blocksPlaced = getNumericStat(stats.blocksPlaced) || getNumericStat(stats.use_dirt) || 0;
  const blocksBroken = getNumericStat(stats.blocksBroken) || getNumericStat(stats.mine_ground) || 0;
  const mobKills = getNumericStat(stats.mobKills) || getNumericStat(stats.kill_any) || 0;
  const deaths = getNumericStat(stats.deaths) || getNumericStat(stats.death) || 0;
  const medalPoints = getNumericStat(stats.medalPoints) || 0;
  const survivalStreak = getNumericStat(stats.survivalStreak) || 0;
  const itemsCrafted = getNumericStat(stats.itemsCrafted) || 0;
  const itemsPickedUp = getNumericStat(stats.itemsPickedUp) || 0;
  const itemsDropped = getNumericStat(stats.itemsDropped) || 0;
  const balance = getNumericStat(stats.balance) || 0;

  // Parse dates correctly
  const joinDate = parseDate(profile.joinDate);
  const lastSeenDate = parseDate(profile.lastSeen);
  const location = residentData?.town_name || profile.town || 'Wanderer';
  
  // Get top stats by category
  const topMined = getTopStats(stats, 'mined');
  const topUsed = getTopStats(stats, 'used');
  const topKilled = getTopStats(stats, 'killed');
  const topCrafted = getTopStats(stats, 'crafted');
  
  // Calculate K/D ratio
  const kdRatio = deaths > 0 ? (mobKills / deaths).toFixed(2) : mobKills.toString();
  
  // Calculate efficiency stats
  const blocksPerHour = playtimeHours > 0 ? Math.floor((blocksPlaced + blocksBroken) / playtimeHours) : 0;
  const killsPerHour = playtimeHours > 0 ? Math.floor(mobKills / playtimeHours) : 0;

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/100`} alt={profile.username} />
                <AvatarFallback className="text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3">
                <div>
                  <h2 className="text-3xl font-bold">{profile.displayName || profile.username}</h2>
                  {profile.displayName && profile.displayName !== profile.username && (
                    <p className="text-lg text-muted-foreground">@{profile.username}</p>
                  )}
                </div>

                {/* Level and Status Row */}
                <div className="flex items-center gap-3">
                  <Badge variant={profile.isOnline ? "default" : "secondary"}>
                    {profile.isOnline ? "Online" : "Offline"}
                  </Badge>
                  
                  {/* Level Badge */}
                  <Badge 
                    style={{ backgroundColor: safeLevelInfo.color, color: 'white' }}
                    className="text-sm flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    Level {safeLevelInfo.level}
                  </Badge>
                  
                  {/* Level Title */}
                  <span className="text-sm font-medium" style={{ color: safeLevelInfo.color }}>
                    {safeLevelInfo.title}
                  </span>
                </div>

                {/* Role Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.badges && profile.badges.length > 0 ? (
                    profile.badges.map((badge: any) => (
                      <Badge
                        key={badge.id}
                        style={{ backgroundColor: badge.badge_color, color: 'white' }}
                        className="text-xs flex items-center gap-1"
                      >
                        {(() => {
                          const IconComponent = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User;
                          return <IconComponent className="w-3 h-3" />;
                        })()}
                        {!badge.icon_only && <span>{badge.badge_type}</span>}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      style={{ backgroundColor: '#6b7280', color: 'white' }}
                      className="text-xs flex items-center gap-1"
                    >
                      <User className="w-3 h-3" />
                      <span>Player</span>
                    </Badge>
                  )}
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{safeLevelInfo.totalXp.toLocaleString()} XP</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{safeLevelInfo.xpInCurrentLevel.toLocaleString()} / {safeLevelInfo.xpForNextLevel.toLocaleString()}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Progress to Level {safeLevelInfo.level + 1}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{safeLevelInfo.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={safeLevelInfo.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBadgeManager(true)}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Manage Badges
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{joinDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last seen:</span>
              <span className="font-medium">{lastSeenDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{location}</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Player Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bioLoading ? (
                    <p className="text-muted-foreground">Loading bio...</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {playerBio || 'No bio available.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Registered</div>
                        <div className="text-sm text-muted-foreground">
                          {joinDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365))} years ago
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Last Login</div>
                        <div className="text-sm text-muted-foreground">
                          {lastSeenDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const daysDiff = Math.floor((Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysDiff === 0) return 'Today';
                        if (daysDiff === 1) return 'Yesterday';
                        if (daysDiff < 7) return `${daysDiff} days ago`;
                        if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
                        if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
                        return `${Math.floor(daysDiff / 365)} years ago`;
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-6">
              <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <CardTitle>Core Stats</CardTitle>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isStatsOpen ? 'rotate-180' : ''}`} />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total XP</p>
                            <p className="text-2xl font-bold">{safeLevelInfo.totalXp.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Pickaxe className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Blocks Placed</p>
                            <p className="text-2xl font-bold">{blocksPlaced.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Pickaxe className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Blocks Broken</p>
                            <p className="text-2xl font-bold">{blocksBroken.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Sword className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Mob Kills</p>
                            <p className="text-2xl font-bold">{mobKills.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {balance > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Balance</p>
                              <p className="text-2xl font-bold">${balance.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Building Activity</span>
                      <span>{blocksPlaced + blocksBroken > 0 ? Math.round((blocksPlaced / (blocksPlaced + blocksBroken)) * 100) : 0}%</span>
                    </div>
                    <Progress value={blocksPlaced + blocksBroken > 0 ? (blocksPlaced / (blocksPlaced + blocksBroken)) * 100 : 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Combat Activity</span>
                      <span>{mobKills > 0 ? Math.round(mobKills) : 0}</span>
                    </div>
                    <Progress value={Math.min(100, mobKills / 10)} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={() => setShowAllStats(true)} variant="outline">
                  View All Statistics
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 mt-6">
              <div className="flex flex-wrap gap-3">
                {profile.achievements && profile.achievements.length > 0 ? (
                  profile.achievements.map((achievement: any) => (
                    <Dialog key={`${achievement.achievementId}-${achievement.tier}`}>
                      <DialogTrigger asChild>
                        <div className="flex flex-col items-center text-center w-20 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                          <div className="w-8 h-8 mb-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-semibold leading-tight">{achievement.achievementName}</span>
                          <span className="text-xs text-muted-foreground">Tier {achievement.tier}</span>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <Star className="w-6 h-6 mr-3 text-primary" />
                            {achievement.achievementName} - Tier {achievement.tier}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Progress</span>
                            <span>
                              {achievement.currentValue?.toLocaleString() || 0} / {achievement.threshold?.toLocaleString() || 0}
                            </span>
                          </div>
                          <Progress value={achievement.threshold ? Math.min(100, ((achievement.currentValue || 0) / achievement.threshold) * 100) : 0} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">No achievements yet.</p>
                )}
              </div>
              
              {/* View All Achievements Button */}
              <div className="flex justify-center">
                <AllAchievementsModal
                  playerUuid={profile.id}
                  playerUsername={profile.username}
                  playerStats={stats}
                  unlockedAchievements={profile.achievements || []}
                  onAchievementClaimed={refreshProfile}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Admin Badge Manager Modal */}
          {showBadgeManager && (
            <AdminBadgeManager
              playerUuid={profile.id}
              playerName={profile.username}
              isOpen={showBadgeManager}
              onClose={() => setShowBadgeManager(false)}
            />
          )}

          {/* All Statistics Modal */}
          {showAllStats && (
            <AllStatisticsModal
              profile={profile}
              onClose={() => setShowAllStats(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get top stats by category
function getTopStats(stats: any, category: string): Array<{ name: string; value: number }> {
  const categoryStats = Object.entries(stats)
    .filter(([key, value]) => {
      if (typeof value !== 'number') return false;
      return key.toLowerCase().includes(category.toLowerCase());
    })
    .map(([key, value]) => ({
      name: key,
      value: value as number
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return categoryStats;
}

export default PlayerStatsDetail; 