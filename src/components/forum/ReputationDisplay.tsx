import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useUserReputation } from '@/hooks/useUserReputation';
import { Trophy, Star } from 'lucide-react';

interface ReputationDisplayProps {
  userId: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const ReputationDisplay: React.FC<ReputationDisplayProps> = ({
  userId,
  showDetails = false,
  compact = false
}) => {
  const { reputation, loading, getReputationLevel } = useUserReputation(userId);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!reputation) {
    return null;
  }

  const levelInfo = getReputationLevel(reputation.reputation_points);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Badge 
          variant="secondary" 
          className="text-xs"
          style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}
        >
          <Trophy className="w-3 h-3 mr-1" />
          {levelInfo.title}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {reputation.reputation_points} pts
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary"
          style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}
        >
          <Trophy className="w-4 h-4 mr-1" />
          {levelInfo.title}
        </Badge>
        <span className="text-sm font-medium">
          Level {levelInfo.level}
        </span>
      </div>
      
      {showDetails && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{reputation.reputation_points} reputation points</span>
          </div>
          
          {reputation.badges_earned.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Badges: {reputation.badges_earned.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 