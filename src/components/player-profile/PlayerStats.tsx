import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Pickaxe, Coins, Award, BarChart3 } from 'lucide-react';

interface PlayerStatsProps {
  stats: Record<string, number>;
  onViewAllStats: () => void;
  loading?: boolean;
}

const PlayerStats = ({ stats, onViewAllStats, loading }: PlayerStatsProps) => {
  if (loading) {
    return <div className="text-center py-8">Loading player statistics...</div>;
  }

  const mainStats = [
    { 
      label: 'Blocks Placed', 
      value: (stats.blocksPlaced || 0).toLocaleString(), 
      icon: Pickaxe, 
      color: 'text-green-500',
      rank: undefined // Ranks can be added if available
    },
    { 
      label: 'Blocks Broken', 
      value: (stats.blocksBroken || 0).toLocaleString(), 
      icon: Target, 
      color: 'text-orange-500',
      rank: undefined
    },
    { 
      label: 'Mob Kills', 
      value: (stats.mobKills || 0).toLocaleString(), 
      icon: Trophy, 
      color: 'text-red-500',
      rank: undefined
    },
    { 
      label: 'Balance', 
      value: (stats.balance || 0).toLocaleString(), 
      icon: Coins, 
      color: 'text-yellow-500',
      rank: undefined
    }
  ];

  const getRankBadge = (rank: number | undefined) => {
    if (!rank || rank > 10) return null;
    
    const getBadgeColor = (rank: number) => {
      if (rank === 1) return 'bg-yellow-500 text-white';
      if (rank === 2) return 'bg-gray-400 text-white';
      if (rank === 3) return 'bg-yellow-600 text-white';
      if (rank <= 5) return 'bg-blue-500 text-white';
      return 'bg-green-500 text-white';
    };

    return (
      <Badge className={`${getBadgeColor(rank)} text-xs`}>
        #{rank}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Player Statistics
        </h3>
        <Button onClick={onViewAllStats} variant="outline" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          View All Stats
        </Button>
      </div>

      {/* Medal Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Award className="w-5 h-5" />
            Medal Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medalPoints || 0}</div>
              <div className="text-sm text-yellow-700">Medal Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.goldMedals || 0}</div>
              <div className="text-sm text-yellow-700">Gold Medals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{stats.silverMedals || 0}</div>
              <div className="text-sm text-gray-700">Silver Medals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.bronzeMedals || 0}</div>
              <div className="text-sm text-yellow-800">Bronze Medals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mainStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="font-medium text-sm">{stat.label}</span>
                </div>
                {getRankBadge(stat.rank)}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Items Crafted:</span>
              <div className="font-medium">{(stats.itemsCrafted || 0).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Items Dropped:</span>
              <div className="font-medium">{(stats.itemsDropped || 0).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Items Picked Up:</span>
              <div className="font-medium">{(stats.itemsPickedUp || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button onClick={onViewAllStats} variant="outline" size="sm">
              View Complete Statistics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStats;
