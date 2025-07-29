import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, HardDrive } from 'lucide-react';
import { useQuality } from './QualityContext';

interface PerformanceMonitorProps {
  isVisible: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isVisible }) => {
  const { quality } = useQuality();
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      // Get memory info if available
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMemory({
          used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          total: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
        });
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFpsStatus = (fps: number) => {
    if (fps >= 50) return 'Excellent';
    if (fps >= 30) return 'Good';
    return 'Poor';
  };

  return (
    <Card className="w-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">FPS</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getFpsColor(fps)}`}>{fps}</span>
            <Badge variant="outline" className="text-xs">
              {getFpsStatus(fps)}
            </Badge>
          </div>
        </div>
        
        {memory && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Memory</span>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-mono">{memory.used}MB</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Quality</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs capitalize">{quality.level}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor; 