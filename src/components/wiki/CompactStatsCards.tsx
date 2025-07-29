import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Crown, 
  Calendar,
  Building2,
  Tag,
  MessageSquare,
  Shield,
  Target,
  Activity
} from 'lucide-react';

interface StatCard {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface CompactStatsCardsProps {
  type: 'town' | 'nation';
  data: any;
}

const CompactStatsCards: React.FC<CompactStatsCardsProps> = ({ type, data }) => {
  const getTownStats = (): StatCard[] => [
    {
      icon: <Crown className="h-3 w-3" />,
      title: 'Mayor',
      value: data.mayor_name || '[Unknown]',
      color: 'primary'
    },
    {
      icon: <Users className="h-3 w-3" />,
      title: 'Population',
      value: data.residents_count || 0,
      color: 'success'
    },
    {
      icon: <DollarSign className="h-3 w-3" />,
      title: 'Balance',
      value: data.balance ? `$${data.balance.toLocaleString()}` : '$0',
      color: 'success'
    },
    {
      icon: <TrendingUp className="h-3 w-3" />,
      title: 'Level',
      value: data.level || 1,
      subtitle: `XP: ${data.total_xp || 0}`,
      color: 'warning'
    },
    {
      icon: <Building2 className="h-3 w-3" />,
      title: 'Nation',
      value: data.nation_name || 'Independent',
      color: 'secondary'
    },
    {
      icon: <Shield className="h-3 w-3" />,
      title: 'Capital',
      value: data.is_capital ? 'Yes' : 'No',
      color: data.is_capital ? 'primary' : 'default'
    },
    {
      icon: <MapPin className="h-3 w-3" />,
      title: 'Location',
      value: `X: ${data.location_x || 0}, Z: ${data.location_z || 0}`,
      subtitle: `World: ${data.world_name || 'world'}`,
      color: 'secondary'
    },
    {
      icon: <Tag className="h-3 w-3" />,
      title: 'Tag',
      value: data.tag || '[No tag]',
      color: 'default'
    },
    {
      icon: <MessageSquare className="h-3 w-3" />,
      title: 'Board',
      value: data.board || '[No board]',
      color: 'default'
    },
    {
      icon: <Target className="h-3 w-3" />,
      title: 'Taxes',
      value: `${data.taxes || 0}%`,
      subtitle: `Plot: ${data.plot_tax || 0}%`,
      color: 'warning'
    },
    {
      icon: <Users className="h-3 w-3" />,
      title: 'Limits',
      value: `${data.max_residents || 50} residents`,
      subtitle: `${data.max_plots || 100} plots`,
      color: 'secondary'
    },
    {
      icon: <Calendar className="h-3 w-3" />,
      title: 'Founded',
      value: data.created_at ? new Date(data.created_at).toLocaleDateString() : '[Unknown]',
      color: 'default'
    }
  ];

  const getNationStats = (): StatCard[] => [
    {
      icon: <Crown className="h-3 w-3" />,
      title: 'Leader',
      value: data.leader_name || '[Unknown]',
      color: 'primary'
    },
    {
      icon: <Building2 className="h-3 w-3" />,
      title: 'Capital',
      value: data.capital_town_name || '[Unknown]',
      color: 'primary'
    },
    {
      icon: <DollarSign className="h-3 w-3" />,
      title: 'Balance',
      value: data.balance ? `$${data.balance.toLocaleString()}` : '$0',
      color: 'success'
    },
    {
      icon: <Users className="h-3 w-3" />,
      title: 'Towns',
      value: data.towns_count || 0,
      subtitle: `${data.residents_count || 0} residents`,
      color: 'success'
    },
    {
      icon: <Tag className="h-3 w-3" />,
      title: 'Tag',
      value: data.tag || '[No tag]',
      color: 'default'
    },
    {
      icon: <MessageSquare className="h-3 w-3" />,
      title: 'Board',
      value: data.board || '[No board]',
      color: 'default'
    },
    {
      icon: <Target className="h-3 w-3" />,
      title: 'Taxes',
      value: `${data.taxes || 0}%`,
      subtitle: `Town: ${data.town_tax || 0}%`,
      color: 'warning'
    },
    {
      icon: <Shield className="h-3 w-3" />,
      title: 'Limits',
      value: `${data.max_towns || 10} max towns`,
      color: 'secondary'
    },
    {
      icon: <Activity className="h-3 w-3" />,
      title: 'Activity',
      value: data.activity_score || 0,
      subtitle: `${data.ally_count || 0} allies, ${data.enemy_count || 0} enemies`,
      color: 'success'
    },
    {
      icon: <Calendar className="h-3 w-3" />,
      title: 'Founded',
      value: data.created_at ? new Date(data.created_at).toLocaleDateString() : '[Unknown]',
      color: 'default'
    }
  ];

  const stats = type === 'town' ? getTownStats() : getNationStats();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'secondary':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

    return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 mb-6">
      {stats.map((stat, index) => {
        // Check if this stat has long content that needs more space
        const hasLongContent = stat.title === 'Board' || 
                              (typeof stat.value === 'string' && stat.value.length > 50) ||
                              (stat.subtitle && stat.subtitle.length > 30);
        
        // Board and long content get more space
        const cardClasses = hasLongContent 
          ? 'col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-3' 
          : '';
        
        // Special styling for Board card
        const isBoard = stat.title === 'Board';
        const boardClasses = isBoard ? 'min-h-[70px]' : '';
        
        return (
          <Card key={index} className={`${getColorClasses(stat.color || 'default')} border-2 ${cardClasses} ${boardClasses}`}>
            <CardHeader className="pb-1 px-2 pt-2">
              <CardTitle className="flex items-center gap-1 text-xs font-medium">
                {stat.icon}
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2 pb-2">
              <div className={`font-bold ${hasLongContent ? 'text-sm' : 'text-xs'} break-words leading-tight ${isBoard ? 'font-normal' : ''}`}>
                {stat.value}
              </div>
              {stat.subtitle && (
                <div className="text-xs opacity-75 mt-1 leading-tight break-words">{stat.subtitle}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CompactStatsCards; 