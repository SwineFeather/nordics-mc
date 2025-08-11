import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  MapPin, 
  Building, 
  Clock,
  Crown,
  User,
  Star,
  Award,
  Sparkles,
  Heart,
  Globe,
  Book,
  Wrench,
  Flame,
  Sun,
  Moon,
  Zap,
  Key,
  Lock,
  Smile,
  Ghost,
  Skull,
  Leaf,
  Rocket,
  Sword,
  Wand2,
} from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import type { PlayerBadge } from '@/types/player';

// Badge icons mapping
const BADGE_ICONS = {
  User: <User className="w-3 h-3" />,
  Star: <Star className="w-3 h-3" />,
  Award: <Award className="w-3 h-3" />,
  Sparkles: <Sparkles className="w-3 h-3" />,
  Crown: <Crown className="w-3 h-3" />,
  Heart: <Heart className="w-3 h-3" />,
  Globe: <Globe className="w-3 h-3" />,
  Book: <Book className="w-3 h-3" />,
  Wrench: <Wrench className="w-3 h-3" />,
  Flame: <Flame className="w-3 h-3" />,
  Sun: <Sun className="w-3 h-3" />,
  Moon: <Moon className="w-3 h-3" />,
  Zap: <Zap className="w-3 h-3" />,
  Key: <Key className="w-3 h-3" />,
  Lock: <Lock className="w-3 h-3" />,
  Smile: <Smile className="w-3 h-3" />,
  Ghost: <Ghost className="w-3 h-3" />,
  Skull: <Skull className="w-3 h-3" />,
  Leaf: <Leaf className="w-3 h-3" />,
  Rocket: <Rocket className="w-3 h-3" />,
  Sword: <Sword className="w-3 h-3" />,
  Wand2: <Wand2 className="w-3 h-3" />,
};

interface SharedPlayerCardProps {
  profile: PlayerProfile;
  onClick: () => void;
  allResidents?: any[];
  showDetailedStats?: boolean;
  isSearchResult?: boolean;
}

const SharedPlayerCard = ({ 
  profile, 
  onClick, 
  allResidents = [],
  showDetailedStats = true,
  isSearchResult = false
}: SharedPlayerCardProps) => {
  // Helper function to safely get numeric values
  const getNumericStat = (value: number | { [key: string]: number } | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null) {
      const firstValue = Object.values(value)[0];
      if (typeof firstValue === 'number') return firstValue;
    }
    return 0;
  };

  const formatTotalXp = (totalXp: number) => {
    if (totalXp >= 1000000) return `${(totalXp / 1000000).toFixed(1)}M`;
    if (totalXp >= 1000) return `${(totalXp / 1000).toFixed(1)}K`;
    return totalXp.toString();
  };

  const getInfluenceStatus = (score: number) => {
    if (score >= 1000) return { label: 'Legendary', color: 'bg-purple-500' };
    if (score >= 500) return { label: 'Elite', color: 'bg-red-500' };
    if (score >= 200) return { label: 'Influential', color: 'bg-orange-500' };
    if (score >= 100) return { label: 'Active', color: 'bg-green-500' };
    if (score >= 50) return { label: 'Regular', color: 'bg-blue-500' };
    return { label: 'New', color: 'bg-gray-500' };
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'vip': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getServerRoleColor = (serverRole: string) => {
    switch (serverRole.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'vip': return 'bg-purple-500';
      case 'kala': return 'bg-green-500';
      case 'fancy kala': return 'bg-blue-500';
      case 'golden kala': return 'bg-yellow-500';
      case 'former supporter': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get resident data for this player
  const residentData = allResidents?.find(r => r.name === profile.username);
  const influenceScore = residentData?.activity_score || 0;
  const influenceStatus = getInfluenceStatus(influenceScore);

  // Get primary badge
  const primaryBadge = profile.badges?.find((b: PlayerBadge) => b.is_verified) || profile.badges?.[0];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-card dark:border-border" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/64`} />
              <AvatarFallback className="text-sm">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate dark:text-white">
                {profile.displayName || profile.username}
              </h3>
              {/* Display primary badge */}
              {primaryBadge && (
                <Badge 
                  style={{ backgroundColor: primaryBadge.badge_color, color: 'white' }}
                  className="text-xs flex items-center gap-1"
                >
                  {BADGE_ICONS[primaryBadge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User}
                  {!primaryBadge.icon_only && <span>{primaryBadge.badge_type}</span>}
                </Badge>
              )}
              {/* Display server role if different from badge */}
              {profile.serverRole && (!primaryBadge || primaryBadge.badge_type.toLowerCase() !== profile.serverRole.toLowerCase()) && (
                <Badge 
                  variant="outline"
                  className={`text-xs ${getServerRoleColor(profile.serverRole)} text-white`}
                >
                  {profile.serverRole}
                </Badge>
              )}
              {/* Show loading indicator for badges if no badges but detailed stats are enabled */}
              {showDetailedStats && !primaryBadge && profile.badges === undefined && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
              )}
            </div>

            {/* Badges - show more badges for search results */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(isSearchResult ? profile.badges.slice(0, 3) : [primaryBadge]).filter(Boolean).map((badge) => {
                  const IconComponent = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || <Star className="w-3 h-3" />;
                  return (
                    <Badge 
                      key={badge.id} 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5"
                      style={{ borderColor: badge.badge_color, color: badge.badge_color }}
                    >
                      {IconComponent}
                    </Badge>
                  );
                })}
                {isSearchResult && profile.badges.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{profile.badges.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Influence Score - show for search results */}
            {isSearchResult && influenceScore > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${influenceStatus.color}`}
                >
                  {influenceStatus.label} ({influenceScore})
                </Badge>
              </div>
            )}

            {/* Nation and Town info */}
            {(residentData?.nation_name || residentData?.town_name) && (
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                {residentData.nation_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{residentData.nation_name}</span>
                  </div>
                )}
                {residentData.town_name && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{residentData.town_name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Last Seen - show for search results */}
            {isSearchResult && profile.lastSeen && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                <span>
                  Last seen: {new Date(parseInt(profile.lastSeen)).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 dark:border-muted-foreground dark:text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedPlayerCard;

