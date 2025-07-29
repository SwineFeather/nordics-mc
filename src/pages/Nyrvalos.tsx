import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  Crown, 
  Shield, 
  Sword, 
  Building, 
  Users, 
  Target, 
  Compass,
  Eye,
  Settings,
  Info,
  Zap,
  Heart,
  Coins,
  Flag,
  Mountain,
  Trees,
  Anchor,
  Star,
  AlertTriangle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Camera,
  Grid3X3,
  Globe,
  Route
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseNations } from '@/hooks/useSupabaseNations';
import useNyrvalosGame from '@/hooks/useNyrvalosGame';
import TerritoryPanel from '@/components/nyrvalos/TerritoryPanel';
import GameControls from '@/components/nyrvalos/GameControls';
import MapScene from '@/components/nyrvalos/MapScene';
import NyrvalosLoadingScreen from '@/components/nyrvalos/NyrvalosLoadingScreen';
import TextureLoader from '@/components/nyrvalos/TextureLoader';
import { QualityProvider, useQuality } from '@/components/nyrvalos/QualityContext';
import { 
  Territory, 
  Trail, 
  Structure, 
  Plot,
  BlockCoords, 
  ChunkCoords, 
  MapCoords,
  MAP_WIDTH_UNITS,
  MAP_HEIGHT_UNITS
} from '@/components/nyrvalos/types';

// Debug state for coordinate display
interface DebugInfo {
  blockCoords: BlockCoords | null;
  chunkCoords: ChunkCoords | null;
  mapCoords: MapCoords | null;
}

// 3D Map Component
const PoliticalMap3D: React.FC<{
  selectedTerritory: Territory | null;
  onTerritorySelect: (territory: Territory | null) => void;
  showTerritories: boolean;
  showTrails: boolean;
  showStructures: boolean;
  showPlots: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showChunks: boolean;
  territories: Territory[];
  trails: Trail[];
  structures: Structure[];
  plots: Plot[];
  onMapClick: (blockCoords: BlockCoords, chunkCoords: ChunkCoords, mapCoords: MapCoords) => void;
}> = ({ 
  selectedTerritory, 
  onTerritorySelect, 
  showTerritories, 
  showTrails, 
  showStructures,
  showPlots,
  showGrid,
  showLabels,
  showChunks,
  territories,
  trails,
  structures,
  plots,
  onMapClick
}) => {
  const { getShadowEnabled } = useQuality();
  
  // Map dimensions (normalized for 3D)
  const mapWidth = MAP_WIDTH_UNITS;
  const mapHeight = MAP_HEIGHT_UNITS;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: [0, 15, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
        shadows={getShadowEnabled()}
        gl={{ 
          antialias: false, // Disable antialiasing for better performance
          powerPreference: "high-performance",
          alpha: false, // Disable alpha for better performance
          depth: true,
          stencil: false, // Disable stencil for better performance
          preserveDrawingBuffer: false // Don't preserve drawing buffer for better performance
        }}
        dpr={[0.5, 1]} // Limit device pixel ratio for better performance
        performance={{ min: 0.5 }} // Set minimum performance target
      >
        <MapScene 
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          selectedTerritory={selectedTerritory}
          onTerritorySelect={onTerritorySelect}
          showTerritories={showTerritories}
          showTrails={showTrails}
          showStructures={showStructures}
          showPlots={showPlots}
          showGrid={showGrid}
          showLabels={showLabels}
          showChunks={showChunks}
          territories={territories}
          trails={trails}
          structures={structures}
          plots={plots}
          onMapClick={onMapClick}
        />
      </Canvas>
    </div>
  );
};

// Debug Panel Component
const DebugPanel: React.FC<{ debugInfo: DebugInfo }> = ({ debugInfo }) => {
  if (!debugInfo.blockCoords) return null;

  return (
    <Card className="absolute top-4 right-4 w-80 bg-black/80 text-white border-gray-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Block Coordinates:</strong>
          <div>X: {debugInfo.blockCoords.x}</div>
          <div>Y: {debugInfo.blockCoords.y}</div>
          <div>Z: {debugInfo.blockCoords.z}</div>
        </div>
        {debugInfo.chunkCoords && (
          <div>
            <strong>Chunk Coordinates:</strong>
            <div>X: {debugInfo.chunkCoords.x}</div>
            <div>Z: {debugInfo.chunkCoords.z}</div>
          </div>
        )}
        {debugInfo.mapCoords && (
          <div>
            <strong>Map Coordinates:</strong>
            <div>X: {Math.round(debugInfo.mapCoords.x)}</div>
            <div>Z: {Math.round(debugInfo.mapCoords.z)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Nyrvalos Component
const Nyrvalos: React.FC = () => {
  const { user, profile } = useAuth();
  const { nations } = useSupabaseNations();
  const gameState = useNyrvalosGame();
  
  // Add texture loading state - must be at the top with other hooks
  const [textureLoading, setTextureLoading] = useState(true);
  
  // Destructure the state and functions from the hook
  const {
    territories,
    trails,
    structures,
    plots,
    selectedTerritory,
    gameMode,
    playerStats,
    showTerritories,
    showTrails,
    showStructures,
    showPlots,
    showGrid,
    showLabels,
    showChunks,
    loading,
    error,
    selectTerritory,
    setGameMode,
    toggleLayer,
    claimTerritory,
    buildStructure,
    refreshData
  } = gameState;

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    blockCoords: null,
    chunkCoords: null,
    mapCoords: null
  });

  // Handle texture loading completion
  const handleTexturesLoaded = () => {
    setTextureLoading(false);
  };

  // Handle territory selection
  const handleTerritorySelect = (territory: Territory | null) => {
    selectTerritory(territory);
  };

  // Handle map clicks for debug info
  const handleMapClick = (blockCoords: BlockCoords, chunkCoords: ChunkCoords, mapCoords: MapCoords) => {
    setDebugInfo({
      blockCoords,
      chunkCoords,
      mapCoords
    });
  };

  // Game action handlers
  const handleClaim = async () => {
    if (selectedTerritory) {
      const success = await claimTerritory(selectedTerritory.id);
      if (success) {
        console.log('Territory claimed successfully!');
      }
    }
  };

  const handleBuild = async () => {
    if (selectedTerritory) {
      const success = await buildStructure(
        selectedTerritory.id,
        'castle',
        selectedTerritory.coordinates
      );
      if (success) {
        console.log('Structure built successfully!');
      }
    }
  };

  const handleDiplomacy = () => {
    setGameMode('diplomacy');
    console.log('Entering diplomacy mode');
  };

  const handleMilitary = () => {
    setGameMode('military');
    console.log('Entering military mode');
  };

  const handleResetCamera = () => {
    // Camera reset logic will be handled by MapControls
    console.log('Resetting camera');
  };

  const handleZoomIn = () => {
    // Zoom logic will be handled by MapControls
    console.log('Zooming in');
  };

  const handleZoomOut = () => {
    // Zoom logic will be handled by MapControls
    console.log('Zooming out');
  };

  if (loading) {
    console.log('Nyrvalos page is loading...', { loading, error, territories: territories.length });
    
    // Calculate loading progress based on loaded data and loading state
    const totalItems = territories.length + trails.length + structures.length + plots.length;
    const maxExpectedItems = 50; // Reduced expectation for better performance
    let progress = Math.min((totalItems / maxExpectedItems) * 100, 90); // Cap at 90% until fully loaded
    
    // If we have some data but still loading, show higher progress
    if (totalItems > 0 && loading) {
      progress = Math.max(progress, 75);
    }
    
    // If error occurred, still show loading but with different message
    const message = error ? "Encountered an issue, retrying..." : undefined;
    
    return <NyrvalosLoadingScreen progress={progress} message={message} />;
  }

  console.log('Nyrvalos page rendering main content...', { 
    loading, 
    error, 
    territories: territories.length,
    trails: trails.length,
    structures: structures.length,
    plots: plots.length,
    timestamp: Date.now()
  });

  return (
    <QualityProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Globe className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Nyrvalos</h1>
                  <p className="text-gray-300 text-sm">Political Strategy Game</p>
                </div>
              </div>
              
              {/* Player Stats */}
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>{playerStats.gold}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{playerStats.influence}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-gray-400" />
                  <span>{playerStats.military}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{playerStats.defense}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-120px)] relative">
          {/* Show TextureLoader if still loading textures */}
          {textureLoading && <TextureLoader onTexturesLoaded={handleTexturesLoaded} />}

          {/* Floating Game Controls */}
          <div className="absolute top-4 left-4 z-10">
            <GameControls
              gameMode={gameMode}
              onGameModeChange={setGameMode}
              showTerritories={showTerritories}
              showTrails={showTrails}
              showStructures={showStructures}
              showPlots={showPlots}
              showGrid={showGrid}
              showLabels={showLabels}
              showChunks={showChunks}
              onToggleTerritories={() => toggleLayer('showTerritories')}
              onToggleTrails={() => toggleLayer('showTrails')}
              onToggleStructures={() => toggleLayer('showStructures')}
              onTogglePlots={() => toggleLayer('showPlots')}
              onToggleGrid={() => toggleLayer('showGrid')}
              onToggleLabels={() => toggleLayer('showLabels')}
              onToggleChunks={() => toggleLayer('showChunks')}
              onResetCamera={handleResetCamera}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              cameraPosition={{ x: 0, y: 10, z: 5 }}
              zoom={1}
            />
          </div>

          {/* Floating Territory Panel */}
          {selectedTerritory && (
            <div className="absolute top-4 right-4 z-10">
              <TerritoryPanel
                territory={selectedTerritory}
                onClaim={handleClaim}
                onBuild={handleBuild}
                onDiplomacy={handleDiplomacy}
                onMilitary={handleMilitary}
                onClose={() => selectTerritory(null)}
              />
            </div>
          )}

          {/* Full Screen Map Area */}
          <div className="w-full h-full bg-black/20">
            <PoliticalMap3D
              selectedTerritory={selectedTerritory}
              onTerritorySelect={handleTerritorySelect}
              showTerritories={showTerritories}
              showTrails={showTrails}
              showStructures={showStructures}
              showPlots={showPlots}
              showGrid={showGrid}
              showLabels={showLabels}
              showChunks={showChunks}
              territories={territories}
              trails={trails}
              structures={structures}
              plots={plots}
              onMapClick={handleMapClick}
            />

            {/* Debug Panel */}
            <DebugPanel debugInfo={debugInfo} />

            {/* Error Display */}
            {error && (
              <div className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg z-10">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </QualityProvider>
  );
};

export default Nyrvalos; 