import React from 'react';
import * as THREE from 'three';
import { Trail, blockToMap, mapTo3D } from './types';

interface TrailLineProps {
  trail: Trail;
}

const TrailLine: React.FC<TrailLineProps> = ({ trail }) => {
  // Defensive checks for trail structure
  if (!trail || !trail.start || !trail.end) {
    console.warn('Invalid trail data:', trail);
    return null;
  }

  // Validate coordinates to prevent NaN values
  const startX = isNaN(trail.start.x) ? 0 : trail.start.x;
  const startZ = isNaN(trail.start.z) ? 0 : trail.start.z;
  const endX = isNaN(trail.end.x) ? 0 : trail.end.x;
  const endZ = isNaN(trail.end.z) ? 0 : trail.end.z;

  // Convert block coordinates to map coordinates, then to 3D scene coordinates
  const startMapCoords = blockToMap(startX, startZ);
  const endMapCoords = blockToMap(endX, endZ);
  const startSceneCoords = mapTo3D(startMapCoords.x, startMapCoords.z);
  const endSceneCoords = mapTo3D(endMapCoords.x, endMapCoords.z);

  // Account for the 3x scaling used by TerrainMap
  const scaledStartCoords = {
    x: startSceneCoords.x * 3,
    z: startSceneCoords.z * 3
  };
  const scaledEndCoords = {
    x: endSceneCoords.x * 3,
    z: endSceneCoords.z * 3
  };

  const start = new THREE.Vector3(
    scaledStartCoords.x,
    0.05, // Stick to ground
    scaledStartCoords.z
  );
  const end = new THREE.Vector3(
    scaledEndCoords.x,
    0.05, // Stick to ground
    scaledEndCoords.z
  );

  // Skip rendering if points are invalid
  if (start.distanceTo(end) < 0.1) {
    return null;
  }

  // Use all the actual trail points if available, otherwise use start/end
  let trailPoints: THREE.Vector3[] = [];
  
  if (trail.points && trail.points.length > 2) {
    // Convert all trail points to 3D coordinates
    trailPoints = trail.points.map(point => {
      const mapCoords = blockToMap(point.x, point.z);
      const sceneCoords = mapTo3D(mapCoords.x, mapCoords.z);
      return new THREE.Vector3(
        sceneCoords.x * 3,
        0.05, // Stick to ground
        sceneCoords.z * 3
      );
    });
  } else {
    // Fallback to start/end if no intermediate points
    trailPoints = [start, end];
  }

  // Create a worm-like path by placing individual blocks along the trail
  const blockSize = 0.1; // Each block is 0.1 units (1 block in Minecraft)
  const blockSpacing = 0.08; // Slightly overlapping blocks for smooth connection
  const pathBlocks: THREE.Vector3[] = [];
  
  // Generate blocks along the entire trail path
  for (let i = 0; i < trailPoints.length - 1; i++) {
    const segmentStart = trailPoints[i];
    const segmentEnd = trailPoints[i + 1];
    const segmentDistance = segmentStart.distanceTo(segmentEnd);
    
    // Calculate how many blocks we need for this segment
    const numBlocks = Math.max(1, Math.floor(segmentDistance / blockSpacing));
    
    for (let j = 0; j <= numBlocks; j++) {
      const t = j / numBlocks;
      const blockPosition = segmentStart.clone().lerp(segmentEnd, t);
      pathBlocks.push(blockPosition);
    }
  }

  // Remove duplicate blocks (blocks that are too close together)
  const uniqueBlocks: THREE.Vector3[] = [];
  for (const block of pathBlocks) {
    const isDuplicate = uniqueBlocks.some(existing => 
      existing.distanceTo(block) < blockSpacing * 0.5
    );
    if (!isDuplicate) {
      uniqueBlocks.push(block);
    }
  }

  // Get trail color based on type
  const getTrailColor = () => {
    switch (trail.type) {
      case 'military': return '#EF4444'; // Red
      case 'trade': return '#F59E0B'; // Orange
      case 'road': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  // Create a single geometry for all blocks
  const geometry = new THREE.BoxGeometry(blockSize, blockSize * 0.3, blockSize);
  const material = new THREE.MeshLambertMaterial({
    color: getTrailColor(),
    transparent: true,
    opacity: 0.9
  });

  return (
    <group>
      {uniqueBlocks.map((blockPosition, index) => (
        <mesh
          key={index}
          position={blockPosition}
          geometry={geometry}
          material={material}
          castShadow
        />
      ))}
    </group>
  );
};

interface TrailLinesProps {
  trails: Trail[];
  showTrails: boolean;
}

const TrailLines: React.FC<TrailLinesProps> = ({ trails, showTrails }) => {
  if (!showTrails) return null;

  // Filter out invalid trails
  const validTrails = trails.filter(trail => 
    trail && 
    trail.start && 
    trail.end && 
    typeof trail.start.x === 'number' && 
    typeof trail.start.z === 'number' &&
    typeof trail.end.x === 'number' && 
    typeof trail.end.z === 'number'
  );

  return (
    <>
      {validTrails.map((trail) => (
        <TrailLine key={trail.id} trail={trail} />
      ))}
    </>
  );
};

export default TrailLines; 