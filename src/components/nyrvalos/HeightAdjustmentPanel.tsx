import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Mountain, TrendingUp, Waves } from 'lucide-react';

interface HeightAdjustmentPanelProps {
  lowHeight: number;
  midHeight: number;
  highHeight: number;
  onLowHeightChange: (value: number) => void;
  onMidHeightChange: (value: number) => void;
  onHighHeightChange: (value: number) => void;
}

const HeightAdjustmentPanel: React.FC<HeightAdjustmentPanelProps> = ({
  lowHeight,
  midHeight,
  highHeight,
  onLowHeightChange,
  onMidHeightChange,
  onHighHeightChange
}) => {
  return (
    <Card className="w-80 bg-white/95 backdrop-blur-sm border-green-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mountain className="w-5 h-5 text-green-600" />
          Terrain Height
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Low Height (Ocean/Lowlands) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            <Label className="text-sm font-medium">Low Areas (Ocean/Lowlands)</Label>
          </div>
          <Slider
            value={[lowHeight]}
            onValueChange={(value) => onLowHeightChange(value[0])}
            min={-0.7}
            max={0.1}
            step={0.01}
            className="w-full"
          />
          <div className="text-xs text-gray-500">
            Current: {lowHeight.toFixed(2)} (Black areas in heightmap)
          </div>
        </div>

        {/* Mid Height (Hills/Plains) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <Label className="text-sm font-medium">Mid Areas (Hills/Plains)</Label>
          </div>
          <Slider
            value={[midHeight]}
            onValueChange={(value) => onMidHeightChange(value[0])}
            min={-0.2}
            max={0.5}
            step={0.01}
            className="w-full"
          />
          <div className="text-xs text-gray-500">
            Current: {midHeight.toFixed(2)} (Grey areas in heightmap)
          </div>
        </div>

        {/* High Height (Mountains) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-orange-600" />
            <Label className="text-sm font-medium">High Areas (Mountains)</Label>
          </div>
          <Slider
            value={[highHeight]}
            onValueChange={(value) => onHighHeightChange(value[0])}
            min={0.2}
            max={1.2}
            step={0.01}
            className="w-full"
          />
          <div className="text-xs text-gray-500">
            Current: {highHeight.toFixed(2)} (White areas in heightmap)
          </div>
        </div>

        {/* Height Range Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p><strong>Height Range:</strong> {lowHeight.toFixed(2)} to {highHeight.toFixed(2)}</p>
          <p className="mt-1">Total elevation: {(highHeight - lowHeight).toFixed(2)} units</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeightAdjustmentPanel; 