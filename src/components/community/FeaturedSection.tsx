
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, Star, Trophy, Flame, ChevronRight, Activity, MapPin, Building, DollarSign } from 'lucide-react';
import type { PlayerProfile } from '@/types/player';
import { useAllResidents } from '@/hooks/usePlayerResidentData';

interface FeaturedSectionProps {
  profiles: PlayerProfile[];
  loading: boolean;
  onSelectProfile: (profile: PlayerProfile) => void;
}

const FeaturedSection = ({ profiles, loading, onSelectProfile }: FeaturedSectionProps) => {
  const { data: allResidents } = useAllResidents();

  // Helper function to get influence status based on influence score
  const getInfluenceStatus = (score: number) => {
    if (score >= 400) return { label: 'Established', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 200) return { label: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 100) return { label: 'Regular', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    return { label: 'New', color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

      // Get top profiles by influence score
  const topProfiles = profiles
    .map(profile => {
      const residentData = allResidents?.find(r => r.username === profile.username);
      return { ...profile, residentData };
    })
    .sort((a, b) => (b.residentData?.activity_score || 0) - (a.residentData?.activity_score || 0))
    .slice(0, 3);

  const recentlyActive = profiles
    .filter(p => p.isOnline)
    .map(profile => {
      const residentData = allResidents?.find(r => r.username === profile.username);
      return { ...profile, residentData };
    })
    .slice(0, 5);

  const topBuilders = profiles
    .map(profile => {
      const residentData = allResidents?.find(r => r.username === profile.username);
      return { ...profile, residentData };
    })
    .sort((a, b) => (b.stats.blocksPlaced || 0) - (a.stats.blocksPlaced || 0))
    .slice(0, 5);

  // Get richest players by balance
  const richestPlayers = profiles
    .map(profile => {
      const residentData = allResidents?.find(r => r.username === profile.username);
      return { ...profile, residentData };
    })
    .sort((a, b) => (b.residentData?.balance || 0) - (a.residentData?.balance || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 mb-8">
      {/* Featured Players */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Featured Players
          </h2>
          <Button variant="ghost" className="text-orange-500 hover:text-orange-600">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProfiles.map((profile, index) => {
            const influenceStatus = profile.residentData ? getInfluenceStatus(profile.residentData.activity_score) : null;
            
            return (
              <Card 
                key={profile.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-orange-50 border-orange-200"
                onClick={() => onSelectProfile(profile)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="relative mx-auto mb-3">
                    <Avatar className="h-16 w-16 border-4 border-orange-200 group-hover:border-orange-300 transition-colors">
                      <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/64`} />
                      <AvatarFallback>{profile.username[0]}</AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                    {profile.displayName || profile.username}
                  </CardTitle>
                  <div className="flex justify-center space-x-2 flex-wrap gap-1">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Level {profile.levelInfo?.level || 1}
                    </Badge>
                    {profile.isOnline && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Online
                      </Badge>
                    )}
                    {influenceStatus && (
                      <span className={`text-xs ${influenceStatus.color}`}>
                        {influenceStatus.label}
                      </span>
                    )}
                    {profile.residentData?.is_king && (
                      <Badge variant="default" className="bg-purple-600 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        King
                      </Badge>
                    )}
                    {profile.residentData?.is_mayor && (
                      <Badge variant="default" className="bg-yellow-600 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Mayor
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">{profile.levelInfo?.totalXp?.toLocaleString() || 0}</div>
                      <div className="text-gray-500">Total XP</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{profile.stats.medalPoints || 0}</div>
                      <div className="text-gray-500">Medal Points</div>
                    </div>
                  </div>
                  {/* Show nation/town info */}
                  {(profile.residentData?.nation_name || profile.residentData?.town_name) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        {profile.residentData.nation_name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{profile.residentData.nation_name}</span>
                          </div>
                        )}
                        {profile.residentData.town_name && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span>{profile.residentData.town_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Show balance if available */}
                  {profile.residentData?.balance !== undefined && (
                    <div className="mt-2">
                      <div className="font-semibold text-green-600 flex items-center justify-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {profile.residentData.balance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Balance</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recently Active */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Flame className="h-5 w-5 mr-2 text-green-600" />
              Recently Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyActive.map((profile) => (
                <div 
                  key={profile.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-white/50 rounded-lg p-2 transition-colors"
                  onClick={() => onSelectProfile(profile)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/32`} />
                    <AvatarFallback className="text-xs">{profile.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {profile.displayName || profile.username}
                    </div>
                    <div className="text-xs text-gray-500">Level {profile.levelInfo?.level || 1}</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Builders */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Trophy className="h-5 w-5 mr-2 text-blue-600" />
              Top Builders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBuilders.map((profile, index) => (
                <div 
                  key={profile.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-white/50 rounded-lg p-2 transition-colors"
                  onClick={() => onSelectProfile(profile)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/32`} />
                    <AvatarFallback className="text-xs">{profile.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {profile.displayName || profile.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(profile.stats.blocksPlaced || 0).toLocaleString()} blocks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Richest Players */}
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
              Richest Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {richestPlayers.map((profile, index) => (
                <div 
                  key={profile.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-white/50 rounded-lg p-2 transition-colors"
                  onClick={() => onSelectProfile(profile)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/32`} />
                    <AvatarFallback className="text-xs">{profile.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {profile.displayName || profile.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${(profile.residentData?.balance || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturedSection;
