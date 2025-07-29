import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star } from 'lucide-react';
import { useReputationLeaderboard } from '@/hooks/useUserReputation';

interface ReputationLeaderboardProps {
  limit?: number;
  title?: string;
  showDetails?: boolean;
}

export const ReputationLeaderboard: React.FC<ReputationLeaderboardProps> = ({
  limit = 10,
  title = "Reputation Leaderboard",
  showDetails = false
}) => {
  const { leaderboard, loading } = useReputationLeaderboard(limit);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getLevelInfo = (points: number) => {
    const level = Math.max(1, Math.floor(points / 100) + 1);
    const titles = {
      1: { title: 'Newcomer', color: '#6b7280' },
      2: { title: 'Member', color: '#10b981' },
      3: { title: 'Regular', color: '#3b82f6' },
      4: { title: 'Contributor', color: '#8b5cf6' },
      5: { title: 'Expert', color: '#f59e0b' },
      6: { title: 'Master', color: '#ef4444' },
      7: { title: 'Legend', color: '#ec4899' },
      8: { title: 'Mythic', color: '#8b5cf6' },
      9: { title: 'Divine', color: '#fbbf24' },
      10: { title: 'Immortal', color: '#dc2626' }
    };

    return {
      level,
      ...titles[Math.min(level, 10) as keyof typeof titles]
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const rank = index + 1;
            const levelInfo = getLevelInfo(user.reputation_points);
            
            return (
              <div key={user.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {getRankIcon(rank)}
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user?.avatar_url || ''} />
                      <AvatarFallback>
                        {user.user?.full_name?.[0] || user.user?.email[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {user.user?.full_name || user.user?.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}
                      >
                        {levelInfo.title}
                      </Badge>
                      <span>Level {levelInfo.level}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{user.reputation_points}</span>
                  </div>
                  {showDetails && (
                    <span className="text-sm text-muted-foreground">pts</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 