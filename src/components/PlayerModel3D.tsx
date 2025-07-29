
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import PlayerMesh from './player-3d/PlayerMesh';
import { RealTimePlayerData } from '@/hooks/useRealTimePlayerData';

interface PlayerModel3DProps {
  playerName: string;
  realTimeData?: RealTimePlayerData | null;
}

// Error boundary component for the 3D scene
const Scene3DErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('3D Scene Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const PlayerModel3D: React.FC<PlayerModel3DProps> = ({ playerName, realTimeData }) => {
  const avatarUrl = `https://mc-heads.net/avatar/${playerName}/64`;
  
  // Generate biome-based background gradient
  const biomeGradient = useMemo(() => {
    if (!realTimeData?.biome) {
      return 'from-sky-200 to-green-200'; // Default
    }

    const biome = realTimeData.biome.toLowerCase();
    if (biome.includes('desert')) {
      return 'from-yellow-200 via-orange-200 to-red-200';
    } else if (biome.includes('snow') || biome.includes('ice')) {
      return 'from-blue-100 via-blue-200 to-white';
    } else if (biome.includes('ocean')) {
      return 'from-blue-300 via-blue-400 to-blue-500';
    } else if (biome.includes('mountain')) {
      return 'from-gray-200 via-gray-300 to-gray-400';
    } else if (biome.includes('forest')) {
      return 'from-green-100 via-green-200 to-green-300';
    } else if (biome.includes('jungle')) {
      return 'from-green-200 via-green-400 to-green-600';
    } else if (biome.includes('savanna')) {
      return 'from-yellow-100 via-yellow-200 to-orange-200';
    } else if (biome.includes('swamp')) {
      return 'from-green-300 via-brown-200 to-green-400';
    } else if (biome.includes('nether')) {
      return 'from-red-400 via-red-500 to-red-600';
    } else if (biome.includes('end')) {
      return 'from-purple-300 via-purple-400 to-purple-500';
    }
    
    return 'from-sky-200 to-green-200'; // Default fallback
  }, [realTimeData?.biome]);
  
  // Fallback component when 3D fails
  const fallback = (
    <div className={`w-48 h-48 bg-gradient-to-b ${biomeGradient} rounded-lg overflow-hidden flex items-center justify-center shadow-lg relative`}>
      <img 
        src={avatarUrl} 
        alt={playerName}
        className="w-16 h-16 rounded"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Block indicator */}
      {realTimeData?.block_below && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {realTimeData.block_below.replace('_', ' ').toLowerCase()}
        </div>
      )}
      {/* Biome indicator */}
      {realTimeData?.biome && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {realTimeData.biome.replace('_', ' ').toLowerCase()}
        </div>
      )}
    </div>
  );

  return (
    <Scene3DErrorBoundary fallback={fallback}>
      <div className={`w-48 h-48 bg-gradient-to-b ${biomeGradient} rounded-lg overflow-hidden shadow-lg cursor-move relative`}>
        <Canvas 
          camera={{ position: [0, 0, 3], fov: 50 }}
          onError={(error) => {
            console.error('Canvas Error:', error);
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 2]} intensity={0.8} castShadow />
          <directionalLight position={[-1, -1, -1]} intensity={0.3} />
          
          <Suspense fallback={null}>
            <PlayerMesh playerName={playerName} />
          </Suspense>
        </Canvas>
        
        {/* Block indicator */}
        {realTimeData?.block_below && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {realTimeData.block_below.replace('_', ' ').toLowerCase()}
          </div>
        )}
        
        {/* Biome indicator */}
        {realTimeData?.biome && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {realTimeData.biome.replace('_', ' ').toLowerCase()}
          </div>
        )}
        
        {/* Health/Status indicators */}
        {realTimeData && (
          <div className="absolute top-2 left-2 space-y-1">
            <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <span>❤</span>
              <span>{realTimeData.health}/20</span>
            </div>
            <div className="bg-orange-500/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <span>🍖</span>
              <span>{realTimeData.food}/20</span>
            </div>
          </div>
        )}
      </div>
    </Scene3DErrorBoundary>
  );
};

export default PlayerModel3D;
