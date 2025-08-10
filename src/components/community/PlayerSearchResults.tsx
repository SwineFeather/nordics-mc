import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  Activity, 
  MapPin, 
  Building, 
  BarChart3, 
  Clock, 
  Medal, 
  Pickaxe,
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
  Search,
  Loader2
} from 'lucide-react';
import { useAllResidents } from '@/hooks/usePlayerResidentData';
import type { PlayerProfile } from '@/types/player';

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

interface PlayerSearchResultsProps {
  players: PlayerProfile[];
  loading: boolean;
  searchTerm: string;
  onPlayerClick: (player: PlayerProfile) => void;
}

const PlayerSearchResults = ({ 
  players, 
  loading, 
  searchTerm, 
  onPlayerClick 
}: PlayerSearchResultsProps) => {
  const { data: allResidents } = useAllResidents();

  const getNumericStat = (value: number | { [key: string]: number } | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
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
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'helper': return 'bg-yellow-500';
      case 'vip': return 'bg-purple-500';
      case 'kala': return 'bg-blue-500';
      case 'fancy kala': return 'bg-pink-500';
      case 'golden kala': return 'bg-yellow-400';
      case 'former supporter': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getServerRoleColor = (serverRole: string) => {
    switch (serverRole?.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'helper': return 'bg-yellow-500';
      case 'vip': return 'bg-purple-500';
      case 'kala': return 'bg-blue-500';
      case 'fancy kala': return 'bg-pink-500';
      case 'golden kala': return 'bg-yellow-400';
      case 'former supporter': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching for players...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0 && searchTerm.trim().length >= 2) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-6 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            No players found matching "{searchTerm}"
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term or check the spelling
          </p>
        </CardContent>
      </Card>
    );
  }

  if (searchTerm.trim().length < 2) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          Found {players.length} player{players.length !== 1 ? 's' : ''} for "{searchTerm}"
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => {
          const residentData = allResidents?.find(r => r.name === player.username);
          const influenceScore = residentData?.activity_score || 0;
          const influenceStatus = getInfluenceStatus(influenceScore);
          const totalXp = getNumericStat(player.stats.total_xp);
          const blocksPlaced = getNumericStat(player.stats.blocks_placed);
          const blocksBroken = getNumericStat(player.stats.blocks_broken);
          const mobKills = getNumericStat(player.stats.mob_kills);
          const medalPoints = getNumericStat(player.stats.medal_points);

          return (
            <Card 
              key={player.id} 
              className="dark:bg-card dark:border-border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPlayerClick(player)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://mc-heads.net/avatar/${player.username}`} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {player.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {player.displayName || player.username}
                      </h3>
                      {player.serverRole && player.serverRole !== 'player' && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1.5 py-0.5 ${getServerRoleColor(player.serverRole)}`}
                        >
                          {player.serverRole}
                        </Badge>
                      )}
                    </div>

                    {/* Badges */}
                    {player.badges && player.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {player.badges.slice(0, 3).map((badge) => {
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
                        {player.badges.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            +{player.badges.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Influence Score */}
                    {influenceScore > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-0.5 ${influenceStatus.color}`}
                        >
                          {influenceStatus.label} ({influenceScore})
                        </Badge>
                      </div>
                    )}

                    {/* Last Seen */}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last seen: {new Date(parseInt(player.lastSeen)).toLocaleDateString()}
                      </span>
                    </div>

                    {/* View Profile Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 w-full dark:border-muted-foreground dark:text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerClick(player);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerSearchResults; 