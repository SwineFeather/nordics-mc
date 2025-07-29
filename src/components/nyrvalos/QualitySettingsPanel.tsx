import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Battery, Gauge, HardDrive } from 'lucide-react';
import { useQuality } from './QualityContext';
import { QualityLevel } from './types';

interface QualitySettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const QualitySettingsPanel: React.FC<QualitySettingsPanelProps> = ({ isOpen, onToggle }) => {
  const { quality, setQualityLevel } = useQuality();

  const qualityInfo: Record<QualityLevel, { 
    label: string; 
    description: string; 
    icon: React.ReactNode; 
    color: string;
    textureSize: string;
    performance: string;
  }> = {
    low: {
      label: 'Low',
      description: 'Best performance',
      icon: <Battery className="w-4 h-4" />,
      color: 'text-green-500',
      textureSize: '~2MB',
      performance: 'Excellent'
    },
    medium: {
      label: 'Medium',
      description: 'Balanced',
      icon: <Gauge className="w-4 h-4" />,
      color: 'text-yellow-500',
      textureSize: '~15MB',
      performance: 'Good'
    },
    high: {
      label: 'High',
      description: 'Best quality',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-red-500',
      textureSize: '~50MB',
      performance: 'Moderate'
    }
  };

  if (!isOpen) {
    const currentInfo = qualityInfo[quality.level];
    return (
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quality Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current: {currentInfo.label}</span>
            <span className={currentInfo.color}>{currentInfo.icon}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="w-3 h-3" />
            <span>{currentInfo.textureSize}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onToggle} className="w-full">
            Configure Quality
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Quality Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {(['low', 'medium', 'high'] as QualityLevel[]).map((level) => {
            const info = qualityInfo[level];
            const isActive = quality.level === level;
            
            return (
              <Button
                key={level}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQualityLevel(level)}
                className="w-full justify-start"
              >
                <span className={info.color}>{info.icon}</span>
                <span className="ml-2">{info.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {isActive ? 'ACTIVE' : info.description}
                </Badge>
              </Button>
            );
          })}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Current: {qualityInfo[quality.level].label} Quality</div>
          <div>Textures: {quality.textureQuality}</div>
          <div>Geometry: {quality.geometryQuality}</div>
          <div>Lighting: {quality.lightingQuality}</div>
          <div className="flex items-center gap-1 mt-2">
            <HardDrive className="w-3 h-3" />
            <span>Texture Size: {qualityInfo[quality.level].textureSize}</span>
          </div>
          <div>Performance: {qualityInfo[quality.level].performance}</div>
        </div>
        
        <Button variant="outline" size="sm" onClick={onToggle} className="w-full">
          Close
        </Button>
      </CardContent>
    </Card>
  );
};

export default QualitySettingsPanel; 