import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Territory, chunkToBlock, blockToMap, mapTo3D } from './types';
import { useQuality } from './QualityContext';

interface TerritoryMarkerProps {
  territory: Territory;
  isSelected: boolean;
  onSelect: () => void;
  showLabels: boolean;
}

const TerritoryMarker: React.FC<TerritoryMarkerProps> = ({ 
  territory, 
  isSelected, 
  onSelect, 
  showLabels 
}) => {
  // Validate coordinates to prevent NaN values
  const territoryX = isNaN(territory.coordinates.x) ? 0 : territory.coordinates.x;
  const territoryZ = isNaN(territory.coordinates.z) ? 0 : territory.coordinates.z;
  
  // Convert territory coordinates to block coordinates
  const blockCoords = {
    x: territoryX,
    z: territoryZ
  };
  
  // Convert block coordinates to map coordinates, then to 3D scene coordinates
  const mapCoords = blockToMap(blockCoords.x, blockCoords.z);
  const sceneCoords = mapTo3D(mapCoords.x, mapCoords.z);
  
  // Account for the 3x scaling used by TerrainMap
  const scaledSceneCoords = {
    x: sceneCoords.x * 3,
    z: sceneCoords.z * 3
  };
  
  // Generate color based on nation name (simplified for performance)
  const generateNationColor = (nationName: string | null): string => {
    if (!nationName) return '#808080'; // Gray for unknown nation
    
    // Simplified hash for better performance
    let hash = 0;
    for (let i = 0; i < Math.min(nationName.length, 10); i++) { // Limit to first 10 chars
      hash = ((hash << 5) - hash) + nationName.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Generate RGB values from the hash
    const r = Math.abs(hash) % 200 + 55;
    const g = Math.abs(hash >> 8) % 200 + 55;
    const b = Math.abs(hash >> 16) % 200 + 55;
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const territoryColor = generateNationColor(territory.owner);
  const selectedColor = isSelected ? '#ffff00' : territoryColor;
  
  const position = [
    scaledSceneCoords.x,
    0.1, // Slightly above ground
    scaledSceneCoords.z
  ];

  return (
    <group position={position as [number, number, number]}>
      {/* Territory Base */}
      <mesh 
        castShadow={false} 
        receiveShadow={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <cylinderGeometry args={[2, 2, 0.1, 8]} /> {/* Simplified geometry */}
        <meshBasicMaterial 
          color={selectedColor} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Territory Label */}
      {showLabels && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {territory.name}
          </div>
        </Html>
      )}
    </group>
  );
};

interface TerritoryMarkersProps {
  territories: Territory[];
  selectedTerritory: Territory | null;
  onTerritorySelect: (territory: Territory | null) => void;
  showTerritories: boolean;
  showLabels: boolean;
}

const TerritoryMarkers: React.FC<TerritoryMarkersProps> = ({
  territories,
  selectedTerritory,
  onTerritorySelect,
  showTerritories,
  showLabels
}) => {
  const { getMaxTerritories } = useQuality();
  
  console.log('TerritoryMarkers render:', { 
    territoriesCount: territories?.length, 
    showTerritories, 
    showLabels,
    maxTerritories: getMaxTerritories()
  });
  
  if (!showTerritories) {
    console.log('TerritoryMarkers: showTerritories is false, not rendering');
    return null;
  }

  if (!territories || territories.length === 0) {
    console.log('TerritoryMarkers: No territories data available');
    return null;
  }

  // Limit the number of territories based on quality settings
  const maxTerritories = getMaxTerritories();
  const limitedTerritories = territories.slice(0, maxTerritories);

  console.log('TerritoryMarkers: Rendering', limitedTerritories.length, 'of', territories.length, 'territories');

  return (
    <>
      {limitedTerritories.map((territory) => (
        <TerritoryMarker 
          key={territory.id}
          territory={territory}
          isSelected={selectedTerritory?.id === territory.id}
          onSelect={() => onTerritorySelect(territory)}
          showLabels={showLabels}
        />
      ))}
    </>
  );
};

export default TerritoryMarkers; 