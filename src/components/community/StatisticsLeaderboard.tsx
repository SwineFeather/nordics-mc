import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy,
  Medal,
  Pickaxe,
  Sword,
  Clock,
  Activity,
  Target,
  Heart,
  Zap,
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
  TrendingDown,
  Minus,
  BarChart3
} from 'lucide-react';

interface StatisticsLeaderboardProps {
  profiles: any[];
  loading: boolean;
  onPlayerClick: (profile: any) => void;
}

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
  Wand2: <Wand2 className="w-3 h-3" />,
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatTime = (hours: number): string => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${Math.floor(hours)}h`;
};

const getStatValue = (profile: any, statKey: string): number => {
  if (statKey === 'totalStats') {
    // Count all non-zero statistics
    return Object.values(profile.stats || {}).filter(val => typeof val === 'number' && val > 0).length;
  }
  return profile.stats?.[statKey] || 0;
};

const getTopPlayers = (profiles: any[], statKey: string, limit: number = 10) => {
  return profiles
    .filter(profile => getStatValue(profile, statKey) > 0)
    .sort((a, b) => getStatValue(b, statKey) - getStatValue(a, statKey))
    .slice(0, limit);
};

const STAT_CATEGORIES = [
  {
    key: 'playtimeHours',
    label: 'Playtime',
    icon: Clock,
    color: 'text-blue-500',
    format: formatTime,
    description: 'Total time spent playing'
  },
  {
    key: 'blocksPlaced',
    label: 'Blocks Placed',
    icon: Pickaxe,
    color: 'text-green-500',
    format: formatNumber,
    description: 'Total blocks placed'
  },
  {
    key: 'blocksBroken',
    label: 'Blocks Broken',
    icon: Activity,
    color: 'text-orange-500',
    format: formatNumber,
    description: 'Total blocks broken'
  },
  {
    key: 'mobKills',
    label: 'Mob Kills',
    icon: Sword,
    color: 'text-red-500',
    format: formatNumber,
    description: 'Total mob kills'
  },
  {
    key: 'medalPoints',
    label: 'Medal Points',
    icon: Medal,
    color: 'text-yellow-500',
    format: formatNumber,
    description: 'Total medal points earned'
  },
  {
    key: 'survivalStreak',
    label: 'Survival Streak',
    icon: Heart,
    color: 'text-pink-500',
    format: (val: number) => `${val} days`,
    description: 'Longest survival streak'
  },
  {
    key: 'itemsCrafted',
    label: 'Items Crafted',
    icon: Wrench,
    color: 'text-purple-500',
    format: formatNumber,
    description: 'Total items crafted'
  },
  {
    key: 'totalStats',
    label: 'Total Stats',
    icon: BarChart3,
    color: 'text-indigo-500',
    format: formatNumber,
    description: 'Total number of statistics tracked'
  }
];

const StatisticsLeaderboard: React.FC<StatisticsLeaderboardProps> = ({ 
  profiles, 
  loading, 
  onPlayerClick 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(STAT_CATEGORIES[0]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const topPlayers = getTopPlayers(profiles, selectedCategory.key, 20);
  const maxValue = topPlayers.length > 0 ? getStatValue(topPlayers[0], selectedCategory.key) : 0;

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {STAT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory.key === category.key;
          
          return (
            <Button
              key={category.key}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Icon className={`w-4 h-4 ${category.color}`} />
              <span className="text-xs">{category.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <selectedCategory.icon className={`w-5 h-5 ${selectedCategory.color}`} />
            Top {selectedCategory.label} Leaderboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedCategory.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPlayers.map((player, index) => {
              const value = getStatValue(player, selectedCategory.key);
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const rank = index + 1;
              
              // Get primary badge
              const primaryBadge = player.badges?.find((b: any) => b.is_verified) || player.badges?.[0];
              
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onPlayerClick(player)}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                    {rank === 2 && <Trophy className="w-4 h-4 text-gray-400" />}
                    {rank === 3 && <Trophy className="w-4 h-4 text-orange-600" />}
                    {rank > 3 && <span className="text-sm font-medium">{rank}</span>}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://mc-heads.net/avatar/${player.username}/64`} />
                      <AvatarFallback className="text-sm">
                        {player.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          className="font-semibold truncate hover:underline text-left"
                          onClick={() => {
                            // Navigate to community page with player parameter
                            window.location.href = `/community?player=${encodeURIComponent(player.username)}`;
                          }}
                        >
                          {player.displayName || player.username}
                        </button>
                        {primaryBadge && primaryBadge.badge_type !== 'Player' && (
                          <Badge 
                            style={{ backgroundColor: primaryBadge.badge_color, color: 'white' }}
                            className="text-xs flex items-center gap-1"
                          >
                            {BADGE_ICONS[primaryBadge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User}
                            {!primaryBadge.icon_only && <span>{primaryBadge.badge_type}</span>}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{selectedCategory.format(value)}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${selectedCategory.color.replace('text-', 'bg-')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Lvl {player.levelInfo?.level || 1}</div>
                    {player.stats?.playtimeHours > 0 && (
                      <div className="text-xs">{formatTime(player.stats.playtimeHours)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {topPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players found with {selectedCategory.label.toLowerCase()} data.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Players</div>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Active Players</div>
            <div className="text-2xl font-bold">
              {profiles.filter(p => getStatValue(p, 'playtimeHours') > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Top Value</div>
            <div className="text-2xl font-bold">
              {maxValue > 0 ? selectedCategory.format(maxValue) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsLeaderboard; 