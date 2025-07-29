import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useQuality } from './QualityContext';
import { heightmapProcessor, HeightmapData } from '@/utils/heightmapProcessor';

interface TerrainMapProps {
  mapWidth: number;
  mapHeight: number;
  onMapClick: (event: any) => void;
}

const TerrainMap: React.FC<TerrainMapProps> = ({ mapWidth, mapHeight, onMapClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [heightmapData, setHeightmapData] = useState<HeightmapData | null>(null);
  const [terrainGeometry, setTerrainGeometry] = useState<THREE.BufferGeometry | null>(null);
  const { getTexturePath, getGeometrySegments } = useQuality();

  // Memoize texture path to prevent unnecessary reloads
  const texturePath = useMemo(() => getTexturePath('baselayer'), [getTexturePath]);

  console.log('TerrainMap render:', {
    mapWidth,
    mapHeight,
    texturePath,
    heightmapData: !!heightmapData,
    terrainGeometry: !!terrainGeometry
  });

  // Load heightmap data once (non-blocking)
  useEffect(() => {
    const loadHeightmap = async () => {
      try {
        console.log('Loading heightmap data for 3D terrain...');
        const data = await heightmapProcessor.loadHeightmapData();
        setHeightmapData(data);
        console.log('Heightmap data loaded successfully');
      } catch (error) {
        console.warn('Heightmap loading failed, using flat terrain:', error);
        // Continue with flat terrain
      }
    };

    loadHeightmap();
  }, []);

  // Generate 3D terrain geometry from heightmap (non-blocking)
  useEffect(() => {
    if (!heightmapData) return;

    // Temporarily disable 3D terrain to debug texture issue
    console.log('3D terrain generation temporarily disabled for debugging');
    return;

    try {
      console.log('Generating 3D terrain geometry...');
      
      // Calculate geometry segments based on quality
      const baseSegments = 32; // Reduced for better performance
      const segments = getGeometrySegments(baseSegments);
      const widthSegments = segments;
      const heightSegments = Math.floor(segments * (mapHeight / mapWidth));

      // Create geometry
      const geometry = new THREE.PlaneGeometry(
        mapWidth * 3, 
        mapHeight * 3, 
        widthSegments, 
        heightSegments
      );

      // Get position attribute
      const positions = geometry.attributes.position;
      const uvs = geometry.attributes.uv;
      const vertexCount = positions.count;

      console.log('Applying heightmap to', vertexCount, 'vertices');

      // Apply heightmap to vertices while preserving UV coordinates
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // Convert 3D coordinates to normalized heightmap coordinates
        const normalizedX = (x / (mapWidth * 3)) + 0.5;
        const normalizedZ = (z / (mapHeight * 3)) + 0.5;

        // Sample height from heightmap
        const height = heightmapProcessor.getHeightAt(normalizedX, normalizedZ);
        
        // Apply height to Y coordinate (with scaling)
        const heightScale = 2.0; // Reduced for more subtle terrain
        positions.setY(i, height * heightScale);

        // Ensure UV coordinates are preserved (they should already be correct)
        if (uvs) {
          // UV coordinates should already be set correctly by PlaneGeometry
          // Just verify they're in the right range
          const u = uvs.getX(i);
          const v = uvs.getY(i);
          uvs.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
        }
      }

      // Update geometry
      positions.needsUpdate = true;
      if (uvs) {
        uvs.needsUpdate = true;
      }
      geometry.computeVertexNormals();

      setTerrainGeometry(geometry);
      console.log('3D terrain geometry generated successfully');
    } catch (error) {
      console.warn('3D terrain generation failed, using flat terrain:', error);
      // Continue with flat terrain
    }
  }, [heightmapData, mapWidth, mapHeight, getGeometrySegments]);

  // Load base texture with optimized settings
  const baseTexture = useTexture(texturePath, (texture) => {
    console.log('Base texture loaded successfully:', texturePath);
    
    // Optimize texture for performance
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.premultiplyAlpha = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    if (texture.image) {
      texture.image.crossOrigin = 'anonymous';
      console.log('Texture image loaded:', texture.image.width, 'x', texture.image.height);
    }
  });

  // Create material
  const material = useMemo(() => {
    if (!baseTexture) {
      console.log('No base texture available, using fallback material');
      return new THREE.MeshBasicMaterial({
        color: 0x4a7c59, // Green color for fallback
        side: THREE.DoubleSide
      });
    }

    return new THREE.MeshBasicMaterial({
      map: baseTexture,
      transparent: false,
      side: THREE.DoubleSide,
      color: 0xffffff
    });
  }, [baseTexture]);

  // Create fallback flat geometry
  const fallbackGeometry = useMemo(() => {
    const segments = getGeometrySegments(32);
    console.log('Creating fallback flat geometry with', segments, 'segments');
    return new THREE.PlaneGeometry(mapWidth * 3, mapHeight * 3, segments, segments);
  }, [mapWidth, mapHeight, getGeometrySegments]);

  // Use 3D terrain if available, otherwise fallback to flat
  const geometryToUse = terrainGeometry || fallbackGeometry;

  console.log('Rendering terrain with:', {
    hasGeometry: !!geometryToUse,
    hasMaterial: !!material,
    hasTexture: !!baseTexture,
    is3D: !!terrainGeometry
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} // Rotate plane to be horizontal
      receiveShadow={false}
      onClick={onMapClick}
    >
      <primitive object={geometryToUse} />
      <primitive object={material} />
    </mesh>
  );
};

export default TerrainMap; 