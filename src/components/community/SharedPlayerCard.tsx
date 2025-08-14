import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';
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
  const { onlinePlayers } = useOnlinePlayers();
  
  // Check if this player is online
  const isPlayerOnline = onlinePlayers.some(player => {
    // Debug logging
    if (!player.name || typeof player.name !== 'string') {
      console.log('Invalid player data:', player);
      return false;
    }
    return player.name.toLowerCase() === profile.username.toLowerCase();
  });
  
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

  // Handle player name click to open profile modal
  const handlePlayerNameClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from triggering
    onClick(); // Open the profile modal
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-card dark:border-border" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/64`} />
              <AvatarFallback className="text-xs">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isPlayerOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="font-semibold text-sm truncate dark:text-white hover:text-primary cursor-pointer transition-colors"
                onClick={handlePlayerNameClick}
                title="Click to view full profile"
              >
                {profile.displayName || profile.username}
              </h3>
              
              {/* Display staff badges next to name (Admin, Moderator, Helper) */}
              {profile.badges && profile.badges.length > 0 && (
                <>
                  {profile.badges
                    .filter(badge => ['Admin', 'Moderator', 'Helper'].includes(badge.badge_type))
                    .map((badge) => (
                      <Badge 
                        key={badge.id} 
                        style={{ backgroundColor: badge.badge_color, color: 'white' }}
                        className="text-xs flex items-center gap-1"
                      >
                        {BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User}
                        {!badge.icon_only && <span>{badge.badge_type}</span>}
                      </Badge>
                    ))}
                </>
              )}
              
              {/* Display server role if different from badge and not default Member */}
              {profile.serverRole && profile.serverRole !== 'Member' && (!primaryBadge || primaryBadge.badge_type.toLowerCase() !== profile.serverRole.toLowerCase()) && (
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

            {/* Badges - show non-staff badges below the name */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {profile.badges
                  .filter(badge => !['Admin', 'Moderator', 'Helper'].includes(badge.badge_type))
                  .slice(0, 3)
                  .map((badge) => {
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
                {profile.badges.filter(badge => !['Admin', 'Moderator', 'Helper'].includes(badge.badge_type)).length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{profile.badges.filter(badge => !['Admin', 'Moderator', 'Helper'].includes(badge.badge_type)).length - 3}
                  </Badge>
                )}
              </div>
            )}



            {/* Nation and Town info - show for both main page and search results */}
            {(residentData?.nation_name || residentData?.town_name) && (
              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
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

            {/* Stats - show for both main page and search results */}


          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedPlayerCard;

