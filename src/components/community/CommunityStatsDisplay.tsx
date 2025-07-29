
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Coins, Calendar, LucideIcon } from 'lucide-react';

interface CommunityStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface CommunityStatsDisplayProps {
  stats: CommunityStat[];
}

const CommunityStatsDisplay: React.FC<CommunityStatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="glass-card rounded-3xl text-center hover-lift"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommunityStatsDisplay;
