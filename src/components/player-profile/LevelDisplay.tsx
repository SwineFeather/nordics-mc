
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Zap } from 'lucide-react';
import { calculateLevelInfo, type LevelInfo } from '@/lib/leveling';

interface LevelDisplayProps {
  totalXp: number;
  currentLevel?: number;
  compact?: boolean;
}

const LevelDisplay = ({ totalXp, currentLevel, compact = false }: LevelDisplayProps) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLevelInfo = async () => {
      try {
        const info = await calculateLevelInfo(totalXp);
        setLevelInfo(info);
      } catch (error) {
        console.error('Failed to load level info:', error);
        // Fallback display
        setLevelInfo({
          level: currentLevel || 1,
          totalXp,
          xpInCurrentLevel: 0,
          xpForNextLevel: 100,
          progress: 0,
          title: 'Player',
          description: 'Current level',
          color: '#3b82f6'
        });
      } finally {
        setLoading(false);
      }
    };

    loadLevelInfo();
  }, [totalXp, currentLevel]);

  if (loading || !levelInfo) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Level {currentLevel || 1}</Badge>
        {!compact && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          style={{ backgroundColor: levelInfo.color, color: 'white' }}
          className="flex items-center gap-1"
        >
          <Star className="w-3 h-3" />
          Level {levelInfo.level}
        </Badge>
        <span className="text-xs text-muted-foreground">{levelInfo.title}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            style={{ backgroundColor: levelInfo.color, color: 'white' }}
            className="text-lg px-3 py-1 flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Level {levelInfo.level}
          </Badge>
          <div>
            <h3 className="font-semibold" style={{ color: levelInfo.color }}>
              {levelInfo.title}
            </h3>
            <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-medium">
            <Zap className="w-4 h-4 text-yellow-500" />
            {levelInfo.totalXp.toLocaleString()} XP
          </div>
          <div className="text-xs text-muted-foreground">
            {levelInfo.xpInCurrentLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress to Level {levelInfo.level + 1}</span>
          <span>{levelInfo.progress.toFixed(1)}%</span>
        </div>
        <Progress value={levelInfo.progress} className="h-2" />
      </div>
    </div>
  );
};

export default LevelDisplay;
