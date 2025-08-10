import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  User, 
  Award, 
  X, 
  MessageSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle
} from 'lucide-react';
import AllStatisticsModal from './AllStatisticsModal';
import { usePlayerLeaderboard } from '../../hooks/usePlayerLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import AdminBadgeManager from '../AdminBadgeManager';
import { calculateLevelInfoSync } from '@/lib/leveling';
import { supabase } from '@/integrations/supabase/client';
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
  Crown: Star, // Using Star as fallback for Crown
  Shield: Star, // Using Star as fallback for Shield
  Award: Award,
  Sparkles: Star, // Using Star as fallback for Sparkles
  Globe: Star, // Using Star as fallback for Globe
  Book: Star, // Using Star as fallback for Book
  Wrench: Star, // Using Star as fallback for Wrench
  Flame: Star, // Using Star as fallback for Flame
  Sun: Star, // Using Star as fallback for Sun
  Moon: Star, // Using Star as fallback for Moon
  Key: Star, // Using Star as fallback for Key
  Lock: Star, // Using Star as fallback for Lock
  Smile: Star, // Using Star as fallback for Smile
  Ghost: Star, // Using Star as fallback for Ghost
  Skull: Star, // Using Star as fallback for Skull
  Leaf: Star, // Using Star as fallback for Leaf
  Rocket: Star, // Using Star as fallback for Rocket
  Wand2: Star, // Using Star as fallback for Wand2
  Heart: Star, // Using Star as fallback for Heart
  Zap: Star, // Using Star as fallback for Zap
  Activity: Star, // Using Star as fallback for Activity
  Target: Star, // Using Star as fallback for Target
  Medal: Star, // Using Star as fallback for Medal
  Clock: Clock,
  Building: Star, // Using Star as fallback for Building
  MapPin: MapPin,
  TrendingUp: Star, // Using Star as fallback for TrendingUp
  Calendar: Calendar
};

const PlayerStatsDetail: React.FC<PlayerStatsDetailProps> = ({ profile: initialProfile, onClose }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [showAllStats, setShowAllStats] = useState(false);
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  const [playerBio, setPlayerBio] = useState<string>('');
  const [bioLoading, setBioLoading] = useState(true);
  const [linkedWebsiteUserId, setLinkedWebsiteUserId] = useState<string | null>(null);
  const { userRole, profile: currentUserProfile } = useAuth();
  const navigate = useNavigate();
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
  useEffect(() => {
    const fetchBio = async () => {
      if (!profile.username) {
        setBioLoading(false);
        return;
      }

      // Check if profile has a websiteUserId or if we can derive it
      if (profile.websiteUserId || profile.id) {
        const userId = profile.websiteUserId || profile.id;
        setLinkedWebsiteUserId(userId);
      }

      try {
        // Try to get bio from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, bio')
          .eq('minecraft_username', profile.username)
          .single();
        
        if (error) {
          setPlayerBio('');
        } else {
          setPlayerBio(profileData?.bio || '');
          // If we found a profile, use its ID for chat
          if (profileData?.id && !linkedWebsiteUserId) {
            setLinkedWebsiteUserId(profileData.id);
          }
        }
      } catch (error) {
        setPlayerBio('');
      } finally {
        setBioLoading(false);
      }
    };

    fetchBio();
  }, [profile.username, profile.websiteUserId, profile.id, linkedWebsiteUserId]);
  
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

  // Helper function to parse dates correctly
  const parseDate = (dateString: string | number): Date => {
    if (typeof dateString === 'number') {
      // If it's a Unix timestamp (seconds), convert to milliseconds
      return new Date(dateString * 1000);
    }
    return new Date(dateString);
  };

  // Parse dates correctly
  const joinDate = parseDate(profile.joinDate);
  const lastSeenDate = parseDate(profile.lastSeen);
  const location = residentData?.town_name || profile.town || 'Wanderer';

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Check if current user has a linked Minecraft account
                  if (!currentUserProfile?.minecraft_username) {
                    alert('You need to link your Minecraft account to the website to use chat. Please go to your profile settings and link your account.');
                    return;
                  }
                  
                  if (linkedWebsiteUserId) {
                    navigate(`/messages?with=${encodeURIComponent(linkedWebsiteUserId)}`);
                  } else {
                    // Show a helpful message about linking accounts
                    alert('To enable chat, both players need to link their Minecraft accounts to the website. Please ask the player to log in to the website and link their account.');
                  }
                }}
                title={
                  !currentUserProfile?.minecraft_username 
                    ? "You need to link your Minecraft account to use chat"
                    : linkedWebsiteUserId 
                    ? "Click to start a chat" 
                    : "Player needs to link their website account to enable chat"
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {!currentUserProfile?.minecraft_username 
                  ? "Chat (Link Your Account)" 
                  : linkedWebsiteUserId 
                  ? "Chat" 
                  : "Chat (Link Account)"}
              </Button>
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
                    We're rebuilding the statistics experience. Current data is unreliable and this section is temporarily disabled.
                  </p>
                </CardContent>
              </Card>
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

export default PlayerStatsDetail; 