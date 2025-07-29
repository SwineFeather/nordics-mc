import React, { useMemo } from 'react';
import { 
  MAP_WIDTH_UNITS, 
  MAP_HEIGHT_UNITS, 
  MAP_CHUNK_BOUNDS 
} from './types';

interface GridOverlayProps {
  showGrid: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ showGrid }) => {
  if (!showGrid) return null;

  return (
    <group>
      {/* Simplified Grid Lines - fewer meshes */}
      {Array.from({ length: 11 }, (_, i) => {
        const x = (i - 5) * 10;
        return (
          <mesh key={`grid-x-${i}`} position={[x, 0.01, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.02, 60]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        );
      })}
      
      {Array.from({ length: 7 }, (_, i) => {
        const z = (i - 3) * 10;
        return (
          <mesh key={`grid-z-${i}`} position={[0, 0.01, z]} rotation={[0, 0, 0]}>
            <boxGeometry args={[100, 0.02, 0.05]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

interface ChunkGridProps {
  showChunks: boolean;
}

const ChunkGrid: React.FC<ChunkGridProps> = ({ showChunks }) => {
  // Generate chunk grid with performance optimization
  const chunkGrid = useMemo(() => {
    if (!showChunks) return [];
    
    const chunks = [];
    
    // Limit the number of chunks to prevent performance issues
    // Only show every 50th chunk to reduce mesh count and visual artifacts
    const chunkStep = 50;
    
    // Calculate chunk dimensions
    const totalChunksX = MAP_CHUNK_BOUNDS.topRight.x - MAP_CHUNK_BOUNDS.topLeft.x + 1;
    const totalChunksZ = MAP_CHUNK_BOUNDS.bottomLeft.z - MAP_CHUNK_BOUNDS.topLeft.z + 1;
    
    const chunkWidth = MAP_WIDTH_UNITS / totalChunksX;
    const chunkHeight = MAP_HEIGHT_UNITS / totalChunksZ;
    
    // Only render a subset of chunks for performance
    for (let chunkX = MAP_CHUNK_BOUNDS.topLeft.x; chunkX <= MAP_CHUNK_BOUNDS.topRight.x; chunkX += chunkStep) {
      for (let chunkZ = MAP_CHUNK_BOUNDS.topLeft.z; chunkZ <= MAP_CHUNK_BOUNDS.bottomLeft.z; chunkZ += chunkStep) {
        const worldX = (chunkX - MAP_CHUNK_BOUNDS.topLeft.x) * chunkWidth - MAP_WIDTH_UNITS / 2;
        const worldZ = (chunkZ - MAP_CHUNK_BOUNDS.topLeft.z) * chunkHeight - MAP_HEIGHT_UNITS / 2;
        
        chunks.push({
          x: worldX,
          z: worldZ,
          width: chunkWidth * chunkStep,
          height: chunkHeight * chunkStep,
          chunkX,
          chunkZ
        });
      }
    }
    
    return chunks;
  }, [showChunks]);

  if (!showChunks) return null;

  return (
    <>
      {chunkGrid.map((chunk) => (
        <mesh 
          key={`chunk-${chunk.chunkX}-${chunk.chunkZ}`} 
          position={[chunk.x, 0.02, chunk.z]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[chunk.width, chunk.height]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.05}
            wireframe
            depthTest={false}
          />
        </mesh>
      ))}
    </>
  );
};

interface GridOverlaysProps {
  showGrid: boolean;
  showChunks: boolean;
}

const GridOverlays: React.FC<GridOverlaysProps> = ({ showGrid, showChunks }) => {
  return (
    <>
      <GridOverlay showGrid={showGrid} />
      <ChunkGrid showChunks={showChunks} />
    </>
  );
};

export default GridOverlays; 