
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface EconomyPlayer {
  player: string;
  balance: string;
  rank: number;
}

interface EconomyDisplayProps {
  economyStats: EconomyPlayer[];
  totalServerEconomy: string;
  totalPlayersCount: string; // Assuming this comes from somewhere, e.g. communityStats
}

const EconomyDisplay: React.FC<EconomyDisplayProps> = ({ economyStats, totalServerEconomy, totalPlayersCount }) => {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-medium">
          Server <span className="gradient-text">Economy</span>
        </h2>
        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => window.open('https://stats.nordics.world', '_blank')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Full Stats
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Baltop Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {economyStats.map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Badge variant={player.rank <= 3 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {player.rank}
                    </Badge>
                    <span className="font-medium">{player.player}</span>
                  </div>
                  <span className="font-bold text-accent">{player.balance}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Server Total:</span>
                <span className="font-bold text-lg gradient-text">{totalServerEconomy}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Economy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{totalPlayersCount}</div>
                  <div className="text-sm text-muted-foreground">Total Players</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-secondary">{totalServerEconomy.split('.')[0]}k+</div> {/* Simplified display */}
                  <div className="text-sm text-muted-foreground">Total Wealth</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl">
                <h4 className="font-semibold mb-2">Current Economy Status</h4>
                <p className="text-sm text-muted-foreground">
                  The server economy is thriving with active trading and a healthy distribution of wealth across all players.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => window.open('https://stats.nordics.world', '_blank')}
              >
                View Detailed Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EconomyDisplay;
