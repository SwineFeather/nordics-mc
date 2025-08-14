
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Activity, DollarSign, MapPin, Building } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import { usePlayerResidentData } from '@/hooks/usePlayerResidentData';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';

interface PlayerPoliticalInfoProps {
  profile: PlayerProfile;
}

const PlayerPoliticalInfo = ({ profile }: PlayerPoliticalInfoProps) => {
  const { data: residentData, loading, error } = usePlayerResidentData(profile.username);
  const { onlinePlayers } = useOnlinePlayers();
  
  // Check if this player is online
  const isPlayerOnline = onlinePlayers.some(player => 
    player.name && typeof player.name === 'string' && 
    player.name.toLowerCase() === profile.username.toLowerCase()
  );

  // Helper function to get influence status based on influence score
  const getInfluenceStatus = (score: number) => {
    if (score >= 400) return { label: 'Established', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 200) return { label: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 100) return { label: 'Regular', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    return { label: 'New', color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Political Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Political Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Error loading player data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const influenceStatus = residentData ? getInfluenceStatus(residentData.activity_score) : null;

  return (
    <div className="space-y-4">
      {/* Political Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Political Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Nation:
            </span>
            <span className="font-medium">{residentData?.nation_name || profile.nation || 'None'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Town:
            </span>
            <span className="font-medium">{residentData?.town_name || profile.town || 'None'}</span>
          </div>
          
          {/* Role badges */}
          <div className="flex gap-2 mt-3">
            {residentData?.is_king && (
              <Badge variant="default" className="bg-purple-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                King
              </Badge>
            )}
            {residentData?.is_mayor && (
              <Badge variant="default" className="bg-yellow-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Mayor
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Activity Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Influence Score:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{residentData?.activity_score || 'N/A'}</span>
              {influenceStatus && (
                <span className={`text-sm ${influenceStatus.color}`}>
                  {influenceStatus.label} member
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center gap-2">
              <Badge variant={isPlayerOnline ? "default" : "secondary"}>
                {isPlayerOnline ? "Online" : "Offline"}
              </Badge>
              {isPlayerOnline && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Registered:</span>
            <div className="text-right">
              <div className="font-medium">{residentData?.registered ? formatDate(residentData.registered) : 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">
                {residentData?.registered ? formatRelativeTime(residentData.registered) : ''}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Last Login:</span>
            <div className="text-right">
              <div className="font-medium">{residentData?.last_login ? formatDate(residentData.last_login) : formatDate(profile.lastSeen)}</div>
              <div className="text-xs text-muted-foreground">
                {residentData?.last_login ? formatRelativeTime(residentData.last_login) : formatRelativeTime(profile.lastSeen)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economy Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Economy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-medium text-lg">
              ${(residentData?.balance || profile.stats.balance || 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerPoliticalInfo;
