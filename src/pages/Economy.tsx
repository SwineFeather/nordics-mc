import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Trophy,
  DollarSign,
  ChartBar,
  Award,
  Crown
} from 'lucide-react';

const Economy = () => {
  const balanceTop = [
    { rank: 1, player: 'raikia_', balance: 16798.98 },
    { rank: 2, player: 'Aetzrak', balance: 10164.96 },
    { rank: 3, player: 'Volymskala', balance: 9567.58 },
    { rank: 4, player: 'Occypolojee', balance: 7343.83 },
    { rank: 5, player: 'JustAVirus', balance: 6969.69 },
    { rank: 6, player: 'Golli1432', balance: 5752.73 },
    { rank: 7, player: 'NL_Kommiedant', balance: 5214.46 },
    { rank: 8, player: 'tigerhirsch', balance: 4945.65 }
  ];

  const serverStats = {
    totalEconomy: 136639.79,
    totalPlayers: 1021,
    averageBalance: 134.18,
    topPlayer: 'raikia_'
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-medium mb-4">
          <span className="gradient-text">Server Economy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track the economic landscape of Nordics Minecraft. See who's leading the balance leaderboard.
        </p>
      </div>

      {/* Economic Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="glass-card rounded-3xl text-center">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold gradient-text">€{serverStats.totalEconomy.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Server Economy</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card rounded-3xl text-center">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mx-auto mb-3 text-secondary" />
              <div className="text-2xl font-bold gradient-text">{serverStats.totalPlayers}</div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card rounded-3xl text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-accent" />
              <div className="text-2xl font-bold gradient-text">€{serverStats.averageBalance}</div>
              <div className="text-sm text-muted-foreground">Average Balance</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card rounded-3xl text-center">
            <CardContent className="p-6">
              <Crown className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
              <button
                className="text-2xl font-bold gradient-text hover:underline cursor-pointer"
                onClick={() => {
                  // Navigate to community page with player parameter
                  window.location.href = `/community?player=${encodeURIComponent(serverStats.topPlayer)}`;
                }}
              >
                {serverStats.topPlayer}
              </button>
              <div className="text-sm text-muted-foreground">Richest Player</div>
            </CardContent>
          </Card>
        </div>

      {/* Balance Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card rounded-3xl">
          <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <ChartBar className="w-6 h-6 mr-3 text-primary" />
                Balance Leaderboard
              </CardTitle>
              <p className="text-muted-foreground">Top 8 wealthiest players on the server</p>
            </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balanceTop.map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm">
                            {player.player.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{player.player}</p>
                          <p className="text-sm text-muted-foreground">Rank #{player.rank}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold text-primary">
                        <Coins className="w-4 h-4 mr-1" />
                        €{player.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-accent/10 rounded-2xl border border-accent/30">
              <p className="text-sm text-center text-muted-foreground">
                Updated: June 11th, 2025 at 7:14 PM • Page 1 of 98 total pages
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Economic Insights */}
        <Card className="glass-card rounded-3xl">
          <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <TrendingUp className="w-6 h-6 mr-3 text-secondary" />
                Economic Insights
              </CardTitle>
              <p className="text-muted-foreground">Key economic trends and statistics</p>
            </CardHeader>
          <CardContent>
            <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30">
                  <h4 className="font-medium text-primary mb-2">Wealth Distribution</h4>
                  <p className="text-sm text-muted-foreground">
                    The top 8 players control €66,757.36 (48.9%) of the total server economy.
                  </p>
                </div>
                
                <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/30">
                  <h4 className="font-medium text-secondary mb-2">Economic Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Total server economy has grown steadily with active trading and commerce.
                  </p>
                </div>
                
                <div className="p-4 bg-accent/10 rounded-2xl border border-accent/30">
                  <h4 className="font-medium text-accent mb-2">Active Economy</h4>
                  <p className="text-sm text-muted-foreground">
                    With 1,021 players registered, the economy shows healthy activity across all towns and nations.
                  </p>
                </div>

                <div className="p-4 bg-muted/20 rounded-2xl">
                  <h4 className="font-medium mb-3">Top Nations by Wealth</h4>
                  <div className="space-y-2">
                    {[
                      { nation: 'Skyward Sanctum', balance: '€198.42', leader: 'Golli1432' },
                      { nation: 'North Sea League', balance: '€987.17', leader: 'Danny_boy95' },
                      { nation: 'Constellation', balance: '€499.28', leader: 'Svardmastaren' }
                    ].map((nation) => (
                      <div key={nation.nation} className="flex justify-between items-center text-sm">
                        <span>{nation.nation}</span>
                        <Badge variant="outline">{nation.balance}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Economy;
