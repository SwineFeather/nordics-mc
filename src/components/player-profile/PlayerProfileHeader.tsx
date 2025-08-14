
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Hammer, User, Star, Award, Sparkles, Crown, Heart, Globe, Book, Wrench, Flame, Sun, Moon, Zap, Key, Lock, Smile, Ghost, Skull, Leaf, Rocket, Sword, Wand2, Medal, MapPin, Zap as ZapIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { PlayerProfile } from '@/types/player';
import LevelDisplay from './LevelDisplay';
import { usePlayerBadges } from '@/hooks/usePlayerBadges';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';
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

// Patron tier configuration
const PATRON_TIERS = {
  'Golden Kala': {
    color: 'from-amber-400 via-yellow-500 to-orange-600',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-400/50',
    banner: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-600',
    icon: <Crown className="w-5 h-5 text-amber-400" />,
    effects: ['animate-pulse', 'shadow-lg'],
    benefits: ['€5 passive income', '25% Treasure Chest discount', 'Exclusive cosmetics', 'Priority support']
  },
  'Fancy Kala': {
    color: 'from-red-400 via-pink-500 to-purple-600',
    borderColor: 'border-red-400',
    glowColor: 'shadow-red-400/50',
    banner: 'bg-gradient-to-r from-red-400 via-pink-500 to-purple-600',
    icon: <Sparkles className="w-5 h-5 text-red-400" />,
    effects: ['animate-bounce'],
    benefits: ['€4.5 passive income', '20% Treasure Chest discount', 'Enhanced cosmetics', 'Priority support']
  },
  'Kala': {
    color: 'from-orange-400 via-red-500 to-pink-600',
    borderColor: 'border-orange-400',
    glowColor: 'shadow-orange-400/50',
    banner: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-600',
    icon: <Star className="w-5 h-5 text-orange-400" />,
    effects: ['animate-pulse'],
    benefits: ['€4 passive income', '15% Treasure Chest discount', 'Special cosmetics', 'Priority support']
  }
};

interface PlayerProfileHeaderProps {
  profile: PlayerProfile;
}

const PlayerProfileHeader = ({ profile }: PlayerProfileHeaderProps) => {
  const { data: badges } = usePlayerBadges(profile.id);
  const { data: residentData } = usePlayerResidentData(profile.username);
  const { onlinePlayers } = useOnlinePlayers();
  
  // Check if this player is online
  const isPlayerOnline = onlinePlayers.some(player => 
    player.name && typeof player.name === 'string' && 
    player.name.toLowerCase() === profile.username.toLowerCase()
  );

  // Check if player has patron tier badges
  const patronBadge = badges?.find(badge => 
    ['Golden Kala', 'Fancy Kala', 'Kala'].includes(badge.badge_type)
  );
  const patronTier = patronBadge ? PATRON_TIERS[patronBadge.badge_type as keyof typeof PATRON_TIERS] : null;

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

  // Fallback badge logic - only show Member for verified website users
  const fallbackBadgeType = profile.isWebsiteUser ? 'Member' : 'Player';
  const fallbackBadgeIcon = fallbackBadgeType === 'Member' ? BADGE_ICONS.Star : BADGE_ICONS.User;
  const fallbackBadgeColor = fallbackBadgeType === 'Member' ? '#22c55e' : '#6b7280';

  // Use resident data for joined, last seen, and location if available
  const joinedDate = residentData?.registered || profile.joinDate;
  const lastSeenDate = residentData?.last_login || profile.lastSeen;
  const location = residentData?.town_name || profile.town || 'Wanderer';

  return (
    <div className="space-y-6">
      {/* Patron Tier Banner */}
      {patronTier && (
        <div className={`${patronTier.banner} text-white p-4 rounded-lg shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {patronTier.icon}
              <div>
                <h2 className="text-xl font-bold">{patronBadge?.badge_type}</h2>
                <p className="text-sm opacity-90">Premium Patron Member</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Active Benefits</div>
              <div className="text-lg font-bold">{patronTier.benefits[0]}</div>
            </div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute top-2 right-2 opacity-30">
            <div className="animate-bounce">✨</div>
          </div>
          <div className="absolute bottom-2 left-2 opacity-30">
            <div className="animate-pulse">⭐</div>
          </div>
        </div>
      )}

      {/* Main Profile Section */}
      <div className={`flex flex-col md:flex-row gap-6 items-start p-6 rounded-lg ${
        patronTier 
          ? `${patronTier.borderColor} border-2 ${patronTier.glowColor} shadow-xl` 
          : 'bg-card/50'
      }`}>
        <div className="flex items-center gap-4">
          {/* Enhanced Avatar with patron effects */}
          <div className={`relative ${patronTier ? 'group' : ''}`}>
            <Avatar className={`h-20 w-20 ${patronTier ? patronTier.effects.join(' ') : ''}`}>
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Patron tier border effect */}
            {patronTier && (
              <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${patronTier.color} opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300`}></div>
            )}
            
            {/* Online status indicator */}
            {isPlayerOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h1 className={`text-3xl font-bold ${patronTier ? 'bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent' : ''}`}>
                {profile.displayName || profile.username}
              </h1>
              {profile.displayName && profile.displayName !== profile.username && (
                <p className="text-lg text-muted-foreground">@{profile.username}</p>
              )}
            </div>

            {/* Level and Status Row */}
            <div className="flex items-center gap-3">
              <Badge variant={isPlayerOnline ? "default" : "secondary"}>
                {isPlayerOnline ? "Online" : "Offline"}
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
                  const isPatronBadge = ['Golden Kala', 'Fancy Kala', 'Kala'].includes(badge.badge_type);
                  
                  return (
                    <Badge
                      key={badge.id}
                      style={{ backgroundColor: badge.badge_color, color: 'white' }}
                      className={`text-xs flex items-center gap-1 ${
                        isPatronBadge ? 'ring-2 ring-white/50 shadow-lg' : ''
                      }`}
                    >
                      {IconComponent}
                      {!badge.icon_only && <span>{badge.badge_type}</span>}
                    </Badge>
                  );
                })
              ) : (
                // Only show Member badge for verified website users, hide Player badge for everyone
                profile.isWebsiteUser && (
                  <Badge
                    style={{ backgroundColor: fallbackBadgeColor, color: 'white' }}
                    className="text-xs flex items-center gap-1"
                  >
                    {fallbackBadgeIcon}
                    <span>{fallbackBadgeType}</span>
                  </Badge>
                )
              )}
            </div>

            {/* Patron Benefits Display */}
            {patronTier && (
              <div className="bg-gradient-to-r from-white/10 to-white/5 p-3 rounded-lg border border-white/20">
                <div className="text-sm font-medium text-white mb-2">Patron Benefits:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {patronTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="text-green-300">✓</span>
                      <span className="text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
