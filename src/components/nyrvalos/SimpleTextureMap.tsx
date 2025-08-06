import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SimpleTextureMapProps {
  baseTexturePath: string;
  heightmapTexturePath: string;
  terrainTexturePath: string | null;
  miscTexturePath: string | null;
  politicalTexturePath: string | null;
  width: number;
  height: number;
  terrainSegments: number;
  waterSegments: number;
  qualityLevel: number;
  lowHeight?: number;
  midHeight?: number;
  highHeight?: number;
}

interface Textures {
  base: THREE.Texture;
  heightmap: THREE.Texture;
  terrain: THREE.Texture | null;
  misc: THREE.Texture | null;
  political: THREE.Texture | null;
}

const SimpleTextureMap: React.FC<SimpleTextureMapProps> = ({
  baseTexturePath,
  heightmapTexturePath,
  terrainTexturePath,
  miscTexturePath,
  politicalTexturePath,
  width,
  height,
  terrainSegments,
  waterSegments,
  qualityLevel,
  lowHeight = -0.01,
  midHeight = 0.0,
  highHeight = 0.1
}) => {
  const [textures, setTextures] = useState<Textures>({
    base: null,
    heightmap: null,
    terrain: null,
    misc: null,
    political: null
  });

  const [aspectRatio, setAspectRatio] = useState(1);
  const terrainMeshRef = useRef<THREE.Mesh>(null);
  const terrainOverlayMeshRef = useRef<THREE.Mesh>(null);
  const miscOverlayMeshRef = useRef<THREE.Mesh>(null);

  // Load textures with smoothing and blur effects
  useEffect(() => {
    console.log('Texture loading effect triggered with:', {
      baseTexturePath,
      heightmapTexturePath,
      terrainTexturePath,
      miscTexturePath,
      politicalTexturePath
    });
    
    const loader = new TextureLoader();
    
    // Load base texture
    loader.load(baseTexturePath, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      
      // Calculate aspect ratio
      const img = texture.image;
      if (img) {
        setAspectRatio(img.width / img.height);
      }
      
      setTextures(prev => ({ ...prev, base: texture }));
    });

    // Load heightmap texture with smoothing
    loader.load(heightmapTexturePath, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      
      // Apply smoothing and blur to heightmap
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        
        // Draw the original texture
        ctx.drawImage(texture.image, 0, 0);
        
        // Apply multiple blur passes for smooth heightmap
        for (let i = 0; i < 3; i++) {
          ctx.filter = 'blur(2px)';
          ctx.drawImage(canvas, 0, 0);
        }
        
        // Create new texture from smoothed canvas
        const smoothedTexture = new THREE.CanvasTexture(canvas);
        smoothedTexture.wrapS = THREE.RepeatWrapping;
        smoothedTexture.wrapT = THREE.RepeatWrapping;
        
        setTextures(prev => ({ ...prev, heightmap: smoothedTexture }));
      } else {
        setTextures(prev => ({ ...prev, heightmap: texture }));
      }
    });

    // Load terrain texture if provided
    if (terrainTexturePath) {
      loader.load(terrainTexturePath, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        setTextures(prev => ({ ...prev, terrain: texture }));
      });
    }

    // Load misc texture if provided
    if (miscTexturePath) {
      loader.load(miscTexturePath, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        setTextures(prev => ({ ...prev, misc: texture }));
      });
    }

    // Load political texture if provided
    if (politicalTexturePath) {
      console.log('Loading political texture:', politicalTexturePath);
      loader.load(politicalTexturePath, (texture) => {
        console.log('Political texture loaded successfully:', texture);
        console.log('Texture image:', texture.image);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        setTextures(prev => {
          console.log('Setting political texture in state');
          return { ...prev, political: texture };
        });
      }, (progress) => {
        console.log('Political texture loading progress:', progress);
      }, (error) => {
        console.error('Failed to load political texture:', error);
      });
    } else {
      console.log('No political texture path provided');
      setTextures(prev => ({ ...prev, political: null }));
    }
  }, [baseTexturePath, heightmapTexturePath, terrainTexturePath, miscTexturePath, politicalTexturePath]);

  // Calculate map dimensions based on aspect ratio
  const mapWidth = width;
  const mapHeight = width / aspectRatio;

  // Create terrain material with MASSIVE quality increase and smoothing
  const terrainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures.base,
      displacementMap: textures.heightmap,
      displacementScale: highHeight - lowHeight, // Dynamic scale based on height range
      displacementBias: lowHeight, // Start from low height
      roughness: 0.8, // More rough for better texture visibility
      metalness: 0.0, // No metalness for natural appearance
      normalScale: new THREE.Vector2(0.5, 0.5), // Increased normal mapping for better detail
    });
  }, [textures.base, textures.heightmap, lowHeight, highHeight]);

  // Create terrain overlay material
  const terrainOverlayMaterial = useMemo(() => {
    if (!textures.terrain) return null;
    
    return new THREE.MeshStandardMaterial({
      map: textures.terrain,
      transparent: true,
      alphaTest: 0.1,
      opacity: 0.8, // Slightly more opaque
      displacementMap: textures.heightmap,
      displacementScale: highHeight - lowHeight, // Same dynamic scale
      displacementBias: lowHeight, // Same bias
      roughness: 0.6, // Less rough
      metalness: 0.0,
    });
  }, [textures.terrain, textures.heightmap, lowHeight, highHeight]);

  // Create misc overlay material
  const miscOverlayMaterial = useMemo(() => {
    if (!textures.misc) return null;
    
    return new THREE.MeshStandardMaterial({
      map: textures.misc,
      transparent: true,
      alphaTest: 0.05,
      opacity: 0.15, // Slightly more visible
      displacementMap: textures.heightmap,
      displacementScale: highHeight - lowHeight, // Same dynamic scale
      displacementBias: lowHeight, // Same bias
      roughness: 0.5, // Less rough
      metalness: 0.0,
    });
  }, [textures.misc, textures.heightmap, lowHeight, highHeight]);

  // Create political overlay material
  const politicalOverlayMaterial = useMemo(() => {
    if (!textures.political) return null;
    
    console.log('Creating political overlay material');
    return new THREE.MeshStandardMaterial({
      map: textures.political,
      transparent: true,
      alphaTest: 0.1,
      opacity: 0.9, // High opacity for political map
      displacementMap: textures.heightmap,
      displacementScale: highHeight - lowHeight, // Same dynamic scale as terrain
      displacementBias: lowHeight, // Same bias as terrain
      roughness: 0.4, // Less rough for better visibility
      metalness: 0.0,
    });
  }, [textures.political, textures.heightmap, lowHeight, highHeight]);

  // Create frame material
  const frameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8B4513), // Saddle brown
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  if (!textures.base || !textures.heightmap) {
    return null;
  }

  const frameWidth = mapWidth + 0.4; // Frame extends 0.2 units on each side
  const frameHeight = mapHeight + 0.4;
  const frameDepth = 0.05; // Frame thickness
  const borderWidth = 0.2; // Width of the border

  // Debug logging for political overlay
  console.log('Rendering political overlay:', {
    hasPoliticalTexture: !!textures.political,
    hasPoliticalMaterial: !!politicalOverlayMaterial,
    politicalTexturePath,
    textures: Object.keys(textures)
  });

  return (
    <group>
      {/* Base terrain with MASSIVE quality increase */}
      <mesh 
        ref={terrainMeshRef}
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[mapWidth, mapHeight, terrainSegments, terrainSegments]} />
        <primitive object={terrainMaterial} attach="material" />
      </mesh>

      {/* Terrain overlay with heightmap */}
      {textures.terrain && terrainOverlayMaterial && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[mapWidth, mapHeight, terrainSegments, terrainSegments]} />
          <primitive object={terrainOverlayMaterial} attach="material" />
        </mesh>
      )}

      {/* Misc overlay with heightmap - only render if misc texture exists */}
      {textures.misc && miscOverlayMaterial && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[mapWidth, mapHeight, terrainSegments, terrainSegments]} />
          <primitive object={miscOverlayMaterial} attach="material" />
        </mesh>
      )}

      {/* Political overlay with heightmap - only render if political texture exists */}
      {textures.political && politicalOverlayMaterial && (
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[mapWidth, mapHeight, terrainSegments, terrainSegments]} />
          <primitive object={politicalOverlayMaterial} attach="material" />
        </mesh>
      )}
      {!textures.political && politicalTexturePath && (
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[mapWidth, mapHeight, 1, 1]} />
          <meshBasicMaterial color="lime" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Frame - Only the border, not covering the map */}
      {/* Top border */}
      <mesh position={[0, -0.05, (mapHeight + borderWidth) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[frameWidth, borderWidth, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Bottom border */}
      <mesh position={[0, -0.05, -(mapHeight + borderWidth) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[frameWidth, borderWidth, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Left border */}
      <mesh position={[-(mapWidth + borderWidth) / 2, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[borderWidth, mapHeight, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Right border */}
      <mesh position={[(mapWidth + borderWidth) / 2, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[borderWidth, mapHeight, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default SimpleTextureMap; 