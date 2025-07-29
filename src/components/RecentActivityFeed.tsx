
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp, UserPlus, UserMinus, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RecentActivity } from '@/hooks/useRealTimePlayerData';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  loading: boolean;
  connected: boolean;
}

const RecentActivityFeed = ({ activities, loading, connected }: RecentActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'level_up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'join':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'leave':
        return <UserMinus className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'level_up':
        return 'bg-green-500/10 border-green-500/20';
      case 'join':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'leave':
        return 'bg-gray-500/10 border-gray-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading recent activities...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Badge variant={connected ? "default" : "secondary"} className="text-xs">
            {connected ? "Live" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getActivityColor(activity.type)} hover:bg-opacity-80 transition-all duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={`https://mc-heads.net/avatar/${activity.player}/32`} />
                        <AvatarFallback className="text-xs">
                          {activity.player.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{activity.player}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
