
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Hammer, User, Star, Award, Sparkles, Crown, Heart, Globe, Book, Wrench, Flame, Sun, Moon, Zap, Key, Lock, Smile, Ghost, Skull, Leaf, Rocket, Sword, Wand2, Medal, MapPin } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { PlayerProfile } from '@/types/player';
import LevelDisplay from './LevelDisplay';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';
import { calculateLevelInfoSync } from '@/lib/leveling';

const BADGE_ICONS = {
  User: <User className="w-3 h-3" />, Star: <Star className="w-3 h-3" />, Hammer: <Hammer className="w-3 h-3" />,
  Award: <Award className="w-3 h-3" />, Sparkles: <Sparkles className="w-3 h-3" />, Crown: <Crown className="w-3 h-3" />,
  Heart: <Heart className="w-3 h-3" />, Globe: <Globe className="w-3 h-3" />, Book: <Book className="w-3 h-3" />,
  Wrench: <Wrench className="w-3 h-3" />, Flame: <Flame className="w-3 h-3" />, Sun: <Sun className="w-3 h-3" />,
  Moon: <Moon className="w-3 h-3" />, Zap: <Zap className="w-3 h-3" />, Key: <Key className="w-3 h-3" />,
  Lock: <Lock className="w-3 h-3" />, Smile: <Smile className="w-3 h-3" />, Ghost: <Ghost className="w-3 h-3" />,
  Skull: <Skull className="w-3 h-3" />, Leaf: <Leaf className="w-3 h-3" />, Rocket: <Rocket className="w-3 h-3" />,
  Sword: <Sword className="w-3 h-3" />, Wand2: <Wand2 className="w-3 h-3" />, Medal: <Medal className="w-3 h-3" />,
  MapPin: <MapPin className="w-3 h-3" />,
};

interface PlayerProfileHeaderProps {
  profile: PlayerProfile;
}

const PlayerProfileHeader = ({ profile }: PlayerProfileHeaderProps) => {
  const { data: badges } = usePlayerBadges(profile.id);
  const { data: residentData } = usePlayerResidentData(profile.username);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP');
    } catch {
      return 'Unknown';
    }
  };

  const formatLastSeen = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

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

  // Fallback badge logic
  const fallbackBadgeType = profile.isWebsiteUser ? 'Member' : 'Player';
  const fallbackBadgeIcon = fallbackBadgeType === 'Member' ? BADGE_ICONS.Star : BADGE_ICONS.User;
  const fallbackBadgeColor = fallbackBadgeType === 'Member' ? '#22c55e' : '#6b7280';

  // Use resident data for joined, last seen, and location if available
  const joinedDate = residentData?.registered || profile.joinDate;
  const lastSeenDate = residentData?.last_login || profile.lastSeen;
  const location = residentData?.town_name || profile.town || 'Wanderer';

  return (
    <div className="space-y-6">
      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback className="text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName || profile.username}</h1>
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
              {badges && badges.length > 0 ? (
                badges.map((badge) => {
                  const IconComponent = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User;
                  return (
                    <Badge
                      key={badge.id}
                      style={{ backgroundColor: badge.badge_color, color: 'white' }}
                      className="text-xs flex items-center gap-1"
                    >
                      {IconComponent}
                      {!badge.icon_only && <span>{badge.badge_type}</span>}
                    </Badge>
                  );
                })
              ) : (
                <Badge
                  style={{ backgroundColor: fallbackBadgeColor, color: 'white' }}
                  className="text-xs flex items-center gap-1"
                >
                  {fallbackBadgeIcon}
                  <span>{fallbackBadgeType}</span>
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Joined:</span>
          <span className="font-medium">{formatDate(joinedDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Last seen:</span>
          <span className="font-medium">{formatLastSeen(lastSeenDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{location}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileHeader;
