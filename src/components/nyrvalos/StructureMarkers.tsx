import React from 'react';
import { Html } from '@react-three/drei';
import { Structure, blockToMap, mapTo3D } from './types';

interface StructureMarkerProps {
  structure: Structure;
  showLabels: boolean;
}

const StructureMarker: React.FC<StructureMarkerProps> = ({ structure, showLabels }) => {
  // Validate coordinates to prevent NaN values
  const posX = isNaN(structure.position.x) ? 0 : structure.position.x;
  const posZ = isNaN(structure.position.z) ? 0 : structure.position.z;
  
  // Convert block coordinates to map coordinates, then to 3D scene coordinates
  const mapCoords = blockToMap(posX, posZ);
  const sceneCoords = mapTo3D(mapCoords.x, mapCoords.z);
  
  // Account for the 3x scaling used by TerrainMap
  const scaledSceneCoords = {
    x: sceneCoords.x * 3,
    z: sceneCoords.z * 3
  };
  
  const position = [
    scaledSceneCoords.x,
    0.5,
    scaledSceneCoords.z
  ];

  const getStructureGeometry = () => {
    switch (structure.type) {
      case 'castle':
        return <boxGeometry args={[1, 2, 1]} />;
      case 'fortress':
        return <cylinderGeometry args={[0.8, 1, 1.5, 6]} />;
      case 'tower':
        return <cylinderGeometry args={[0.3, 0.3, 3, 8]} />;
      case 'city':
        return <boxGeometry args={[2, 1, 2]} />;
      case 'outpost':
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case 'port':
        return <cylinderGeometry args={[0.5, 0.5, 0.5, 8]} />;
      case 'mine':
        return <boxGeometry args={[0.6, 0.6, 0.6]} />;
      case 'farm':
        return <boxGeometry args={[1.5, 0.3, 1.5]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getStructureColor = () => {
    switch (structure.type) {
      case 'castle': return '#8B4513';
      case 'fortress': return '#696969';
      case 'tower': return '#A0522D';
      case 'city': return '#FFD700';
      case 'outpost': return '#CD853F';
      case 'port': return '#4169E1';
      case 'mine': return '#2F4F4F';
      case 'farm': return '#228B22';
      default: return '#808080';
    }
  };

  return (
    <group position={position as [number, number, number]}>
      {/* Structure Base */}
      <mesh castShadow>
        {getStructureGeometry()}
        <meshLambertMaterial color={getStructureColor()} />
      </mesh>

      {/* Structure Label */}
      {showLabels && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            {structure.name}
          </div>
        </Html>
      )}
    </group>
  );
};

interface StructureMarkersProps {
  structures: Structure[];
  showStructures: boolean;
  showLabels: boolean;
}

const StructureMarkers: React.FC<StructureMarkersProps> = ({
  structures,
  showStructures,
  showLabels
}) => {
  if (!showStructures) return null;

  return (
    <>
      {structures.map((structure) => (
        <StructureMarker 
          key={structure.id}
          structure={structure}
          showLabels={showLabels}
        />
      ))}
    </>
  );
};

export default StructureMarkers; 