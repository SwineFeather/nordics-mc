import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Trophy, Award, Sparkles } from 'lucide-react';
import { calculateTownLevelInfo, type TownLevelInfo } from '@/lib/townLeveling';

interface TownLevelDisplayProps {
  totalXp: number;
  currentLevel: number;
  compact?: boolean;
  className?: string;
}

const TownLevelDisplay = ({ 
  totalXp, 
  currentLevel, 
  compact = false,
  className = "" 
}: TownLevelDisplayProps) => {
  const [levelInfo, setLevelInfo] = useState<TownLevelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLevelInfo = async () => {
      try {
        const info = await calculateTownLevelInfo(totalXp);
        setLevelInfo(info);
      } catch (error) {
        console.error('Failed to load town level info:', error);
        // Fallback display
        setLevelInfo({
          level: currentLevel || 1,
          totalXp,
          xpInCurrentLevel: 0,
          xpForNextLevel: 100,
          progress: 0,
          title: 'Settlement',
          description: 'Current level',
          color: '#10b981'
        });
      } finally {
        setLoading(false);
      }
    };

    loadLevelInfo();
  }, [totalXp, currentLevel]);

  if (loading || !levelInfo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary">Level {currentLevel || 1}</Badge>
        {!compact && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          style={{ backgroundColor: levelInfo.color, color: 'white' }}
          className="flex items-center gap-1"
        >
          <Trophy className="w-3 h-3" />
          Level {levelInfo.level}
        </Badge>
        <span className="text-xs text-muted-foreground">{levelInfo.title}</span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Level Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                style={{ backgroundColor: levelInfo.color, color: 'white' }}
                className="flex items-center gap-1 text-sm"
              >
                <Trophy className="w-4 h-4" />
                Level {levelInfo.level}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {levelInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {levelInfo.totalXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to next level</span>
              <span>{levelInfo.progress.toFixed(1)}%</span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-2"
              style={{
                '--progress-background': levelInfo.color,
              } as React.CSSProperties}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{levelInfo.xpInCurrentLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP</span>
              <span>Next: Level {levelInfo.level + 1}</span>
            </div>
          </div>

          {/* Level Description */}
          <div className="text-xs text-muted-foreground">
            {levelInfo.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TownLevelDisplay; 