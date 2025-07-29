// Map constants (15360x8832)
export const MAP_WIDTH_PIXELS = 15360;
export const MAP_HEIGHT_PIXELS = 8832;
export const MAP_WIDTH_UNITS = 100; // 3D units
export const MAP_HEIGHT_UNITS = 60; // 3D units

// Minecraft chunk constants
export const CHUNK_SIZE = 16;
export const BLOCKS_PER_CHUNK = 256; // 16x16

// Map boundaries in blocks
export const MAP_BOUNDS = {
  topLeft: { x: -7680, z: 4224 },
  topRight: { x: 7679, z: 4224 },
  bottomRight: { x: 7679, z: 13055 },
  bottomLeft: { x: -7680, z: 13055 }
};

// Map boundaries in chunks
export const MAP_CHUNK_BOUNDS = {
  topLeft: { x: -480, z: 264 },
  topRight: { x: 479, z: 264 },
  bottomRight: { x: 479, z: 815 },
  bottomLeft: { x: -480, z: 815 }
};

// Coordinate types
export interface ChunkCoords {
  x: number;
  z: number;
}

export interface BlockCoords {
  x: number;
  y: number;
  z: number;
}

export interface MapCoords {
  x: number;
  z: number;
}

// Game entity types
export interface Territory {
  id: string;
  name: string;
  owner: string;
  type: 'town' | 'nation' | 'claim';
  color: string;
  coordinates: { x: number; z: number };
  size: number;
  level: number;
  population: number;
  resources: string[];
  claims: Territory[];
  defense: number;
  military: number;
  wealth: number;
  influence: number;
}

export interface Trail {
  id: string;
  name: string;
  start: { x: number; z: number };
  end: { x: number; z: number };
  type: 'road' | 'trade' | 'military';
  level: number;
  owner: string;
  points?: { x: number; z: number }[]; // All trail coordinates
}

export interface Structure {
  id: string;
  name: string;
  type: 'castle' | 'fortress' | 'tower' | 'city' | 'outpost' | 'port' | 'mine' | 'farm';
  position: { x: number; z: number };
  owner: string;
  level: number;
  defense: number;
  population: number;
  description: string;
}

export interface Plot {
  id: number;
  town_id: number | null;
  town_name: string | null;
  world_name: string;
  x: number;
  z: number;
  plot_type: string | null;
  owner_uuid: string | null;
  owner_name: string | null;
  price: number | null;
  for_sale: boolean | null;
  market_value: number | null;
  created_at: string | null;
  last_updated: string | null;
}

// Utility functions for coordinate conversion
export const blockToChunk = (blockX: number, blockZ: number): ChunkCoords => ({
  x: Math.floor(blockX / CHUNK_SIZE),
  z: Math.floor(blockZ / CHUNK_SIZE)
});

export const chunkToBlock = (chunkX: number, chunkZ: number): { x: number, z: number } => ({
  x: chunkX * CHUNK_SIZE,
  z: chunkZ * CHUNK_SIZE
});

export const blockToMap = (blockX: number, blockZ: number): MapCoords => {
  // Convert block coordinates to map pixel coordinates
  const normalizedX = (blockX - MAP_BOUNDS.topLeft.x) / (MAP_BOUNDS.topRight.x - MAP_BOUNDS.topLeft.x);
  const normalizedZ = (blockZ - MAP_BOUNDS.topLeft.z) / (MAP_BOUNDS.bottomLeft.z - MAP_BOUNDS.topLeft.z);
  
  return {
    x: normalizedX * MAP_WIDTH_PIXELS,
    z: normalizedZ * MAP_HEIGHT_PIXELS
  };
};

export const mapToBlock = (mapX: number, mapZ: number): BlockCoords => {
  // Convert map pixel coordinates to block coordinates
  const normalizedX = mapX / MAP_WIDTH_PIXELS;
  const normalizedZ = mapZ / MAP_HEIGHT_PIXELS;
  
  const blockX = MAP_BOUNDS.topLeft.x + normalizedX * (MAP_BOUNDS.topRight.x - MAP_BOUNDS.topLeft.x);
  const blockZ = MAP_BOUNDS.topLeft.z + normalizedZ * (MAP_BOUNDS.bottomLeft.z - MAP_BOUNDS.topLeft.z);
  
  return {
    x: Math.round(blockX),
    y: 120, // Default Y level
    z: Math.round(blockZ)
  };
};

export const mapTo3D = (mapX: number, mapZ: number): { x: number, z: number } => {
  // Convert map pixel coordinates to 3D scene coordinates
  const normalizedX = mapX / MAP_WIDTH_PIXELS;
  const normalizedZ = mapZ / MAP_HEIGHT_PIXELS;
  
  return {
    x: (normalizedX - 0.5) * MAP_WIDTH_UNITS,
    z: (normalizedZ - 0.5) * MAP_HEIGHT_UNITS
  };
};

export const worldToMap = (worldX: number, worldZ: number): MapCoords => {
  // Convert 3D scene coordinates to map pixel coordinates
  const normalizedX = (worldX / MAP_WIDTH_UNITS) + 0.5;
  const normalizedZ = (worldZ / MAP_HEIGHT_UNITS) + 0.5;
  
  return {
    x: normalizedX * MAP_WIDTH_PIXELS,
    z: normalizedZ * MAP_HEIGHT_PIXELS
  };
}; 

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualitySettings {
  level: QualityLevel;
  textureQuality: QualityLevel;
  geometryQuality: QualityLevel;
  lightingQuality: QualityLevel;
} 