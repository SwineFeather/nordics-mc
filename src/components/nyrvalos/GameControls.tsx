import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Settings,
  Eye,
  Target,
  Building,
  Map,
  Compass,
  Camera,
  Grid3X3,
  Globe,
  Mountain,
  Trees,
  Anchor,
  Castle,
  Shield,
  Route,
  Flag,
  Sword
} from 'lucide-react';
import QualitySettingsPanel from './QualitySettingsPanel';
import PerformanceMonitor from './PerformanceMonitor';

interface GameControlsProps {
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  gameMode: 'view' | 'claim' | 'build' | 'diplomacy' | 'military';
  onGameModeChange: (mode: 'view' | 'claim' | 'build' | 'diplomacy' | 'military') => void;
  showTerritories: boolean;
  showTrails: boolean;
  showStructures: boolean;
  showPlots: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showChunks: boolean;
  onToggleTerritories: () => void;
  onToggleTrails: () => void;
  onToggleStructures: () => void;
  onTogglePlots: () => void;
  onToggleGrid: () => void;
  onToggleLabels: () => void;
  onToggleChunks: () => void;
  cameraPosition: { x: number; y: number; z: number };
  zoom: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onResetCamera,
  onZoomIn,
  onZoomOut,
  gameMode,
  onGameModeChange,
  showTerritories,
  showTrails,
  showStructures,
  showPlots,
  showGrid,
  showLabels,
  showChunks,
  onToggleTerritories,
  onToggleTrails,
  onToggleStructures,
  onTogglePlots,
  onToggleGrid,
  onToggleLabels,
  onToggleChunks,
  cameraPosition,
  zoom
}) => {
  const [qualityPanelOpen, setQualityPanelOpen] = useState(false);
  const [performanceMonitorVisible, setPerformanceMonitorVisible] = useState(false);

  return (
    <div className="absolute top-4 right-4 space-y-2">
      {/* Camera Controls */}
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Camera Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={onZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onResetCamera} title="Reset Camera">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Zoom: {zoom.toFixed(1)}x
          </div>
        </CardContent>
      </Card>

      {/* Quality Settings Panel */}
      <QualitySettingsPanel 
        isOpen={qualityPanelOpen}
        onToggle={() => setQualityPanelOpen(!qualityPanelOpen)}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor isVisible={performanceMonitorVisible} />
      
      <Card className="w-64">
        <CardContent className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPerformanceMonitorVisible(!performanceMonitorVisible)}
            className="w-full"
          >
            {performanceMonitorVisible ? 'Hide' : 'Show'} Performance
          </Button>
        </CardContent>
      </Card>

      {/* Game Mode */}
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Game Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={gameMode === 'view' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGameModeChange('view')}
              title="View Mode"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={gameMode === 'claim' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGameModeChange('claim')}
              title="Claim Mode"
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant={gameMode === 'build' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGameModeChange('build')}
              title="Build Mode"
            >
              <Building className="w-4 h-4" />
            </Button>
            <Button
              variant={gameMode === 'diplomacy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGameModeChange('diplomacy')}
              title="Diplomacy Mode"
            >
              <Flag className="w-4 h-4" />
            </Button>
            <Button
              variant={gameMode === 'military' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGameModeChange('military')}
              title="Military Mode"
            >
              <Sword className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Current: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
          </div>
        </CardContent>
      </Card>

      {/* Layer Controls */}
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Button
              variant={showTerritories ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleTerritories}
              className="w-full justify-start"
              title="Toggle Territories"
            >
              <Map className="w-4 h-4 mr-2" />
              Territories
              <Badge variant="outline" className="ml-auto text-xs">
                {showTerritories ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showTrails ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleTrails}
              className="w-full justify-start"
              title="Toggle Trails & Roads"
            >
              <Route className="w-4 h-4 mr-2" />
              Trails & Roads
              <Badge variant="outline" className="ml-auto text-xs">
                {showTrails ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showStructures ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleStructures}
              className="w-full justify-start"
              title="Toggle Structures"
            >
              <Castle className="w-4 h-4 mr-2" />
              Structures
              <Badge variant="outline" className="ml-auto text-xs">
                {showStructures ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showPlots ? 'default' : 'outline'}
              size="sm"
              onClick={onTogglePlots}
              className="w-full justify-start"
              title="Toggle Plots"
            >
              <Globe className="w-4 h-4 mr-2" />
              Plots
              <Badge variant="outline" className="ml-auto text-xs">
                {showPlots ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleGrid}
              className="w-full justify-start"
              title="Toggle Grid"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
              <Badge variant="outline" className="ml-auto text-xs">
                {showGrid ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showLabels ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleLabels}
              className="w-full justify-start"
              title="Toggle Labels"
            >
              <Globe className="w-4 h-4 mr-2" />
              Labels
              <Badge variant="outline" className="ml-auto text-xs">
                {showLabels ? 'ON' : 'OFF'}
              </Badge>
            </Button>
            <Button
              variant={showChunks ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleChunks}
              className="w-full justify-start"
              title="Toggle Chunk Grid"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Chunk Grid
              <Badge variant="outline" className="ml-auto text-xs">
                {showChunks ? 'ON' : 'OFF'}
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Info */}
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Camera Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xs text-muted-foreground">
            Position: ({cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)})
          </div>
          <div className="text-xs text-muted-foreground">
            Distance: {Math.sqrt(cameraPosition.x**2 + cameraPosition.y**2 + cameraPosition.z**2).toFixed(1)}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" className="text-xs">
              <Mountain className="w-3 h-3 mr-1" />
              Terrain
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Trees className="w-3 h-3 mr-1" />
              Forests
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Anchor className="w-3 h-3 mr-1" />
              Ports
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Castle className="w-3 h-3 mr-1" />
              Castles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameControls; 