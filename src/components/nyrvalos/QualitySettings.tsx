import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Monitor, Image, Map } from 'lucide-react';

interface QualitySettingsProps {
  showFPS: boolean;
  onShowFPSChange: (show: boolean) => void;
  textureQuality: string;
  onTextureQualityChange: (quality: string) => void;
  showPoliticalMap: boolean;
  onShowPoliticalMapChange: (show: boolean) => void;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({
  showFPS,
  onShowFPSChange,
  textureQuality,
  onTextureQualityChange,
  showPoliticalMap,
  onShowPoliticalMapChange
}) => {
  const textureOptions = [
    { value: 'low', label: 'Low' },
    { value: 'med', label: 'Medium' },
    { value: 'full', label: 'Full' }
  ];

  const getNextQuality = () => {
    const currentIndex = textureOptions.findIndex(option => option.value === textureQuality);
    const nextIndex = (currentIndex + 1) % textureOptions.length;
    return textureOptions[nextIndex].value;
  };

  return (
    <Card className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-blue-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Quality Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* FPS Counter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <Label htmlFor="fps-toggle" className="text-sm font-medium">
              FPS Counter
            </Label>
          </div>
          <Switch
            id="fps-toggle"
            checked={showFPS}
            onCheckedChange={onShowFPSChange}
          />
        </div>

        {/* Political Map Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <Label htmlFor="political-toggle" className="text-sm font-medium">
              Political Map Overlay
            </Label>
          </div>
          <Switch
            id="political-toggle"
            checked={showPoliticalMap}
            onCheckedChange={onShowPoliticalMapChange}
          />
        </div>

        {/* Texture Quality Button */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Texture Quality
          </Label>
          <Button
            onClick={() => onTextureQualityChange(getNextQuality())}
            variant="outline"
            className="w-full justify-between"
          >
            <span>Current: {textureOptions.find(opt => opt.value === textureQuality)?.label}</span>
            <Image className="w-4 h-4" />
          </Button>
        </div>

        {/* Quality Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <p><strong>Current:</strong> {textureOptions.find(opt => opt.value === textureQuality)?.label} Quality</p>
          <p className="mt-1">Click to cycle through quality levels</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QualitySettings; 