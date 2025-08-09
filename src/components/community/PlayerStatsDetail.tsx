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
import { AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AllStatisticsModal from './AllStatisticsModal';
// Achievements modal removed per requirements
import { usePlayerLeaderboard } from '../../hooks/usePlayerLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import AdminBadgeManager from '../AdminBadgeManager';
import { calculateLevelInfoSync } from '@/lib/leveling';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [linkedWebsiteUserId, setLinkedWebsiteUserId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const navigate = useNavigate();
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
          .select('id, bio')
          .eq('minecraft_username', profile.username)
          .single();
        
        if (error) {
          console.log('No auth profile linked for player:', profile.username);
          setPlayerBio('');
          setLinkedWebsiteUserId(null);
        } else {
          setPlayerBio(profileData?.bio || '');
          setLinkedWebsiteUserId(profileData?.id || null);
        }
      } catch (error) {
        console.log('Error fetching bio for player:', profile.username);
        setPlayerBio('');
        setLinkedWebsiteUserId(null);
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
              {linkedWebsiteUserId && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/messages?with=${encodeURIComponent(linkedWebsiteUserId)}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              )}
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
              <span className="font-medium"></span>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
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

              {/* Achievements placeholder (no data yet) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No achievements available yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Statistics (Work in progress)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We’re rebuilding the statistics experience. Current data is unreliable and this section is temporarily disabled.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements tab removed */}
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