
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, MapPin, Users, Building, Store, TrendingUp } from 'lucide-react';

interface LiveStatsProps {
  nationsCount: number;
  allTownsCount: number;
  onlinePlayersDisplay: string | number;
  planLoading: boolean;
  companiesCount: number;
  activeShopsCount: number;
}

const LiveStats: React.FC<LiveStatsProps> = ({
  nationsCount,
  allTownsCount,
  onlinePlayersDisplay,
  planLoading,
  companiesCount,
  activeShopsCount,
}) => {
  const stats = [
    {
      icon: Crown,
      value: nationsCount,
      label: 'Nations',
      description: 'Active nations',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: MapPin,
      value: allTownsCount,
      label: 'Towns',
      description: 'Thriving communities',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Users,
      value: planLoading ? '...' : onlinePlayersDisplay,
      label: planLoading ? 'Loading' : 'Online',
      description: planLoading ? 'Checking status' : 'Players active now',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Building,
      value: companiesCount,
      label: 'Companies',
      description: 'Business ventures',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Store,
      value: activeShopsCount,
      label: 'Shops',
      description: 'Active marketplaces',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LiveStats;
