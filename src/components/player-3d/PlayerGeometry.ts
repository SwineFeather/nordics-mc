import * as THREE from 'three';

// Minecraft player model dimensions (in blocks)
export const MINECRAFT_SCALE = 0.0625; // 1/16 block scale

// Player model geometry dimensions - fixed positions with lower Y values
export const PLAYER_GEOMETRY = {
  head: { width: 8, height: 8, depth: 8, y: 20 }, // Lowered head position
  body: { width: 8, height: 12, depth: 4, y: 12 }, // Lowered body position
  armRight: { width: 4, height: 12, depth: 4, x: -6, y: 12 }, // Lowered right arm
  armLeft: { width: 4, height: 12, depth: 4, x: 6, y: 12 }, // Lowered left arm
  legRight: { width: 4, height: 12, depth: 4, x: -2, y: 0 }, // Lowered right leg
  legLeft: { width: 4, height: 12, depth: 4, x: 2, y: 0 } // Lowered left leg
};

// Fixed UV mapping for different body parts (normalized coordinates for 64x64 texture)
const createUVMapping = (x: number, y: number, width: number, height: number) => {
  return {
    x: x / 64,
    y: y / 64,
    width: width / 64,
    height: height / 64
  };
};

// Corrected UV coordinates for each body part - fixed mirroring
export const UV_COORDS = {
  head: {
    front: createUVMapping(8, 8, 8, 8),
    back: createUVMapping(24, 8, 8, 8),
    right: createUVMapping(0, 8, 8, 8),
    left: createUVMapping(16, 8, 8, 8),
    top: createUVMapping(8, 0, 8, 8),
    bottom: createUVMapping(16, 0, 8, 8)
  },
  body: {
    front: createUVMapping(20, 20, 8, 12),
    back: createUVMapping(32, 20, 8, 12),
    right: createUVMapping(16, 20, 4, 12),
    left: createUVMapping(28, 20, 4, 12),
    top: createUVMapping(20, 16, 8, 4),
    bottom: createUVMapping(28, 16, 8, 4)
  },
  armRight: {
    front: createUVMapping(44, 20, 4, 12),
    back: createUVMapping(52, 20, 4, 12),
    right: createUVMapping(40, 20, 4, 12),
    left: createUVMapping(48, 20, 4, 12),
    top: createUVMapping(44, 16, 4, 4),
    bottom: createUVMapping(48, 16, 4, 4)
  },
  armLeft: {
    front: createUVMapping(36, 52, 4, 12),
    back: createUVMapping(44, 52, 4, 12),
    right: createUVMapping(32, 52, 4, 12),
    left: createUVMapping(40, 52, 4, 12),
    top: createUVMapping(36, 48, 4, 4),
    bottom: createUVMapping(40, 48, 4, 4)
  },
  legRight: {
    front: createUVMapping(4, 20, 4, 12),
    back: createUVMapping(12, 20, 4, 12),
    right: createUVMapping(0, 20, 4, 12),
    left: createUVMapping(8, 20, 4, 12),
    top: createUVMapping(4, 16, 4, 4),
    bottom: createUVMapping(8, 16, 4, 4)
  },
  legLeft: {
    front: createUVMapping(20, 52, 4, 12),
    back: createUVMapping(28, 52, 4, 12),
    right: createUVMapping(16, 52, 4, 12),
    left: createUVMapping(24, 52, 4, 12),
    top: createUVMapping(20, 48, 4, 4),
    bottom: createUVMapping(24, 48, 4, 4)
  }
};

export const createBodyPartGeometry = (width: number, height: number, depth: number, uvCoords: any) => {
  const geometry = new THREE.BoxGeometry(
    width * MINECRAFT_SCALE,
    height * MINECRAFT_SCALE,
    depth * MINECRAFT_SCALE
  );

  const faceUV = [];

  // Right face (+X) - Adjusted for correct orientation
  const rightUV = uvCoords.right;
  faceUV.push(
    new THREE.Vector2(rightUV.x, rightUV.y), // Bottom-left
    new THREE.Vector2(rightUV.x + rightUV.width, rightUV.y), // Bottom-right
    new THREE.Vector2(rightUV.x, rightUV.y + rightUV.height), // Top-left
    new THREE.Vector2(rightUV.x + rightUV.width, rightUV.y + rightUV.height) // Top-right
  );

  // Left face (-X) - Mirrored horizontally
  const leftUV = uvCoords.left;
  faceUV.push(
    new THREE.Vector2(leftUV.x + leftUV.width, leftUV.y), // Bottom-right
    new THREE.Vector2(leftUV.x, leftUV.y), // Bottom-left
    new THREE.Vector2(leftUV.x + leftUV.width, leftUV.y + leftUV.height), // Top-right
    new THREE.Vector2(leftUV.x, leftUV.y + leftUV.height) // Top-left
  );

  // Top face (+Y) - Adjusted for correct orientation
  const topUV = uvCoords.top;
  faceUV.push(
    new THREE.Vector2(topUV.x, topUV.y + topUV.height), // Bottom-left
    new THREE.Vector2(topUV.x + topUV.width, topUV.y + topUV.height), // Bottom-right
    new THREE.Vector2(topUV.x, topUV.y), // Top-left
    new THREE.Vector2(topUV.x + topUV.width, topUV.y) // Top-right
  );

  // Bottom face (-Y) - Mirrored vertically
  const bottomUV = uvCoords.bottom;
  faceUV.push(
    new THREE.Vector2(bottomUV.x, bottomUV.y), // Top-left
    new THREE.Vector2(bottomUV.x + bottomUV.width, bottomUV.y), // Top-right
    new THREE.Vector2(bottomUV.x, bottomUV.y + bottomUV.height), // Bottom-left
    new THREE.Vector2(bottomUV.x + bottomUV.width, bottomUV.y + bottomUV.height) // Bottom-right
  );

  // Front face (+Z) - Adjusted for correct orientation
  const frontUV = uvCoords.front;
  faceUV.push(
    new THREE.Vector2(frontUV.x, frontUV.y), // Bottom-left
    new THREE.Vector2(frontUV.x + frontUV.width, frontUV.y), // Bottom-right
    new THREE.Vector2(frontUV.x, frontUV.y + frontUV.height), // Top-left
    new THREE.Vector2(frontUV.x + frontUV.width, frontUV.y + frontUV.height) // Top-right
  );

  // Back face (-Z) - Mirrored horizontally
  const backUV = uvCoords.back;
  faceUV.push(
    new THREE.Vector2(backUV.x + backUV.width, backUV.y), // Bottom-right
    new THREE.Vector2(backUV.x, backUV.y), // Bottom-left
    new THREE.Vector2(backUV.x + backUV.width, backUV.y + backUV.height), // Top-right
    new THREE.Vector2(backUV.x, backUV.y + backUV.height) // Top-left
  );

  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(faceUV.flatMap(v => [v.x, v.y]), 2));
  return geometry;
};
