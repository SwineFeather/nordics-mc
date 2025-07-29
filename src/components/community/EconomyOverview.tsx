
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Users, BarChart3, Activity } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import { getPointsLeaderboard } from '@/services/newStatsService';
import { useQuery } from '@tanstack/react-query';

interface EconomyOverviewProps {
  profiles: PlayerProfile[];
  loading: boolean;
}

const EconomyOverview: React.FC<EconomyOverviewProps> = ({ profiles, loading }) => {
  // Fetch points leaderboard from new system
  const { data: pointsLeaderboard, isLoading: pointsLoading } = useQuery({
    queryKey: ['pointsLeaderboard'],
    queryFn: () => getPointsLeaderboard(10),
    staleTime: 5 * 60 * 1000,
  });

  const economyStats = useMemo(() => {
    if (loading || pointsLoading) return null;

    // Create consistent data structure from profiles
    const leaderboardData = profiles
      .sort((a, b) => {
        const aPlaytime = typeof a.stats.playtimeHours === 'number' ? a.stats.playtimeHours : 0;
        const bPlaytime = typeof b.stats.playtimeHours === 'number' ? b.stats.playtimeHours : 0;
        return bPlaytime - aPlaytime;
      })
      .slice(0, 10)
      .map((profile, index) => {
        const playtime = typeof profile.stats.playtimeHours === 'number' ? profile.stats.playtimeHours : 0;
        const blocksPlaced = typeof profile.stats.blocksPlaced === 'number' ? profile.stats.blocksPlaced : 0;
        const blocksBroken = typeof profile.stats.blocksBroken === 'number' ? profile.stats.blocksBroken : 0;
        
        return {
          username: profile.username,
          totalPoints: playtime,
          playtime: playtime,
          blocksPlaced: blocksPlaced,
          blocksBroken: blocksBroken,
          rank: index + 1
        };
      });

    const totalPoints = leaderboardData.reduce((sum, player) => sum + player.totalPoints, 0);
    const totalPlaytime = leaderboardData.reduce((sum, player) => sum + player.playtime, 0);
    const totalBlocksPlaced = leaderboardData.reduce((sum, player) => sum + player.blocksPlaced, 0);

    return {
      leaderboardData,
      totalPoints,
      totalPlaytime,
      totalBlocksPlaced,
      totalPlayers: profiles.length
    };
  }, [profiles, loading, pointsLoading]);

  if (loading || pointsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!economyStats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Player Statistics Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {economyStats.leaderboardData.map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Badge variant={player.rank <= 3 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {player.rank}
                    </Badge>
                    <div>
                      <span className="font-medium">{player.username}</span>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-400" />
                          {Math.floor(player.playtime || 0)}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-green-400" />
                          {player.blocksPlaced?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-accent">{Math.floor(player.totalPoints || 0)}h</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Hours:</span>
                <span className="font-bold text-lg gradient-text">{Math.floor(economyStats.totalPoints)}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Server Statistics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{economyStats.totalPlayers}</div>
                  <div className="text-sm text-muted-foreground">Total Players</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-secondary">{Math.floor(economyStats.totalPlaytime)}</div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl">
                <h4 className="font-semibold mb-2">Server Activity</h4>
                <p className="text-sm text-muted-foreground">
                  Overview of player activity and engagement across the server. 
                  Track playtime, building activity, and overall participation.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Activity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs font-medium">Playtime</div>
                  <div className="text-xs text-muted-foreground">{Math.floor(economyStats.totalPlaytime)}h</div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <Coins className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-xs font-medium">Blocks Placed</div>
                  <div className="text-xs text-muted-foreground">{economyStats.totalBlocksPlaced?.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs font-medium">Active Players</div>
                  <div className="text-xs text-muted-foreground">{economyStats.totalPlayers}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EconomyOverview;
