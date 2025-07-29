import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import TerrainMap from './TerrainMap';
import TerritoryMarkers from './TerritoryMarkers';
import TrailLines from './TrailLines';
import StructureMarkers from './StructureMarkers';
import PlotMarkers from './PlotMarkers';
import GridOverlays from './GridOverlays';
import MapControls from './MapControls';
import { 
  Territory, 
  Trail, 
  Structure, 
  Plot,
  BlockCoords, 
  ChunkCoords, 
  MapCoords,
  MAP_WIDTH_UNITS,
  MAP_HEIGHT_UNITS,
  MAP_WIDTH_PIXELS,
  MAP_HEIGHT_PIXELS,
  worldToMap,
  mapToBlock,
  blockToChunk
} from './types';

// Simple lighting component as fallback
const SimpleLighting: React.FC = () => (
  <>
    <ambientLight intensity={1.5} color="#ffffff" />
    <directionalLight 
      position={[0, 100, 0]} 
      intensity={1.2} 
      castShadow={true}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
    <directionalLight position={[50, 50, 50]} intensity={0.8} />
    <directionalLight position={[-50, 30, -50]} intensity={0.4} />
  </>
);

interface MapSceneProps {
  mapWidth: number;
  mapHeight: number;
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
}

const MapScene: React.FC<MapSceneProps> = ({
  mapWidth,
  mapHeight,
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
  const { camera } = useThree();

  // Test coordinate conversion on component mount
  React.useEffect(() => {
    // Test the coordinate conversion functions
    console.log('=== Testing Coordinate Conversion ===');
    
    // Test top-left corner
    const testBlockCoords = { x: -7680, z: 4224 };
    const testMapCoords = worldToMap(
      (0 - 0.5) * MAP_WIDTH_UNITS, 
      (0 - 0.5) * MAP_HEIGHT_UNITS
    );
    const convertedBlockCoords = mapToBlock(testMapCoords.x, testMapCoords.z);
    
    console.log('Expected top-left block coords:', testBlockCoords);
    console.log('Map coords for top-left:', testMapCoords);
    console.log('Converted back to block coords:', convertedBlockCoords);
    
    // Test bottom-right corner
    const testBlockCoords2 = { x: 7679, z: 13055 };
    const testMapCoords2 = worldToMap(
      (1 - 0.5) * MAP_WIDTH_UNITS, 
      (1 - 0.5) * MAP_HEIGHT_UNITS
    );
    const convertedBlockCoords2 = mapToBlock(testMapCoords2.x, testMapCoords2.z);
    
    console.log('Expected bottom-right block coords:', testBlockCoords2);
    console.log('Map coords for bottom-right:', testMapCoords2);
    console.log('Converted back to block coords:', convertedBlockCoords2);
  }, []);

  // Handle map clicks
  const handleMapClick = (event: any) => {
    event.stopPropagation();
    
    // Get intersection point
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Convert mouse position to normalized device coordinates
    // Handle both native events and synthetic events
    let rect;
    if (event.currentTarget && event.currentTarget.getBoundingClientRect) {
      rect = event.currentTarget.getBoundingClientRect();
    } else if (event.target && event.target.getBoundingClientRect) {
      rect = event.target.getBoundingClientRect();
    } else {
      // Fallback to window dimensions
      rect = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Create a ground plane for intersection testing
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      // Debug: Log the 3D intersection point
      console.log('3D Intersection Point:', {
        x: intersectionPoint.x,
        z: intersectionPoint.z
      });
      
      // Debug: Log the expected 3D scene bounds
      console.log('Expected 3D Scene Bounds:', {
        width: MAP_WIDTH_UNITS,
        height: MAP_HEIGHT_UNITS,
        topLeft: { x: -MAP_WIDTH_UNITS/2, z: -MAP_HEIGHT_UNITS/2 },
        bottomRight: { x: MAP_WIDTH_UNITS/2, z: MAP_HEIGHT_UNITS/2 }
      });
      
      // Convert 3D scene coordinates to map coordinates
      // The 3D scene uses a different coordinate system than the map
      // We need to convert from 3D scene coordinates to map pixel coordinates
      // Note: TerrainMap scales the geometry by 3x, so we need to account for that
      const scaledX = intersectionPoint.x / 3;
      const scaledZ = intersectionPoint.z / 3;
      
      const normalizedX = (scaledX / MAP_WIDTH_UNITS) + 0.5;
      const normalizedZ = (scaledZ / MAP_HEIGHT_UNITS) + 0.5;
      
      console.log('Normalized coordinates:', { x: normalizedX, z: normalizedZ });
      
      const mapCoords = {
        x: normalizedX * MAP_WIDTH_PIXELS,
        z: normalizedZ * MAP_HEIGHT_PIXELS
      };
      
      // Debug: Log the map coordinates
      console.log('Map Coordinates:', mapCoords);
      
      // Convert to block coordinates
      const blockCoords = mapToBlock(mapCoords.x, mapCoords.z);
      
      // Debug: Log the block coordinates
      console.log('Block Coordinates:', blockCoords);
      
      // Convert to chunk coordinates
      const chunkCoords = blockToChunk(blockCoords.x, blockCoords.z);
      
      onMapClick(blockCoords, chunkCoords, mapCoords);
    }
  };

  return (
    <>
      {/* Lighting */}
      <SimpleLighting />

      {/* Main Terrain Map */}
      <TerrainMap 
        mapWidth={mapWidth} 
        mapHeight={mapHeight} 
        onMapClick={handleMapClick} 
      />

      {/* Territory Markers */}
      <TerritoryMarkers
        territories={territories}
        selectedTerritory={selectedTerritory}
        onTerritorySelect={onTerritorySelect}
        showTerritories={showTerritories}
        showLabels={showLabels}
      />

      {/* Trail Lines - TEMPORARILY DISABLED FOR TROUBLESHOOTING */}
      {/* <TrailLines 
        trails={trails} 
        showTrails={showTrails} 
      /> */}

      {/* Structure Markers - TEMPORARILY DISABLED FOR TROUBLESHOOTING */}
      {/* <StructureMarkers
        structures={structures}
        showStructures={showStructures}
        showLabels={showLabels}
      /> */}

      {/* Plot Markers */}
      <PlotMarkers
        plots={plots}
        showPlots={showPlots}
        showLabels={showLabels}
      />

      {/* Grid Overlays - TEMPORARILY DISABLED FOR TROUBLESHOOTING */}
      {/* <GridOverlays 
        showGrid={showGrid} 
        showChunks={showChunks} 
      /> */}

      {/* Camera Controls */}
      <MapControls />
    </>
  );
};

export default MapScene; 