
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatLeaderboard } from '@/hooks/useStatLeaderboard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatIcon } from './getStatIcon';

// Simple replacement functions for removed statAwards
const getStatMetaData = (statKey: string) => ({
  name: statKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  description: `Player statistic for ${statKey}`,
  category: 'misc',
  format: 'number' as const,
  priority: 1
});

const formatStatValue = (value: number, format: 'number' | 'time' | 'distance' | 'percentage'): string => {
  if (!value || value === 0) return '0';
  
  switch (format) {
    case 'time':
      if (value < 24) return `${Math.round(value)}h`;
      const days = Math.floor(value / 24);
      const hours = Math.round(value % 24);
      return `${days}d ${hours}h`;
    
    case 'distance':
      if (value < 1000) return `${Math.round(value)}m`;
      return `${(value / 1000).toFixed(1)}km`;
    
    case 'percentage':
      return `${Math.round(value * 100)}%`;
    
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
  }
};

interface LeaderboardViewProps {
  stat: { key: string; label: string };
  profiles: any[];
  loading: boolean;
  onBack: () => void;
}

const LeaderboardView = ({ stat, profiles, loading, onBack }: LeaderboardViewProps) => {
  const { leaderboardData, loading: leaderboardLoading } = useStatLeaderboard(stat.key);
  const statMeta = getStatMetaData(stat.key);

  if (loading || leaderboardLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Statistics
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Statistics
        </Button>
        <div className="flex items-center gap-3">
          {getStatIcon(stat.key, "w-8 h-8 text-primary")}
          <h1 className="text-3xl font-bold">{stat.label} Leaderboard</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatIcon(stat.key, "w-5 h-5")}
            Top Players - {stat.label}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{statMeta.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No data available for this statistic.
              </p>
            ) : (
              leaderboardData.map((player, index) => (
                <div
                  key={player.uuid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={index < 3 ? 'default' : 'secondary'} className={
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-yellow-600' : ''
                    }>
                      #{player.rank}
                    </Badge>
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={`https://mc-heads.net/avatar/${player.uuid}/100`} 
                        alt={player.username} 
                      />
                      <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player.username}</p>
                      <p className="text-sm text-muted-foreground">
                        UUID: {player.uuid.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatStatValue(player.value, statMeta.format)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {statMeta.category}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardView;
