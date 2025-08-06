import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stats } from '@react-three/drei';
import * as THREE from 'three';
import SimpleTextureMap from './SimpleTextureMap';

interface SimpleMapSceneProps {
  baseTexturePath: string;
  heightmapTexturePath: string;
  terrainTexturePath: string | null;
  miscTexturePath: string | null;
  politicalTexturePath: string | null;
  width?: number;
  height?: number;
  qualityLevel?: number;
  showFPS?: boolean;
  lowHeight?: number;
  midHeight?: number;
  highHeight?: number;
}

const SimpleMapScene: React.FC<SimpleMapSceneProps> = ({ 
  baseTexturePath,
  heightmapTexturePath,
  terrainTexturePath,
  miscTexturePath,
  politicalTexturePath,
  width = 20,
  height = 20,
  qualityLevel = 1, // Default to medium quality
  showFPS = false,
  lowHeight = -0.01,
  midHeight = 0.0,
  highHeight = 0.1
}) => {
  // Calculate geometry segments based on quality level
  const terrainSegments = Math.pow(2, 8 + qualityLevel); // 256, 512, 1024, 1536, 2048
  const waterSegments = Math.pow(2, 7 + qualityLevel); // 128, 256, 512, 768, 1024

  return (
    <>
      {/* Balanced Lighting - Less bright with warm tones */}
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.25} color="#fff5f0" />
      
      {/* Main directional light */}
      <directionalLight
        position={[15, 20, 10]}
        intensity={0.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Secondary fill light with warm tone */}
      <directionalLight
        position={[-10, 15, -5]}
        intensity={0.2}
        color="#ffe8d6"
        castShadow
      />
      
      {/* Rim light with red tint for atmosphere */}
      <directionalLight
        position={[0, 10, -15]}
        intensity={0.15}
        color="#ffeedd"
      />
      
      {/* Warm accent light */}
      <directionalLight
        position={[5, 12, 8]}
        intensity={0.1}
        color="#ffd4b3"
      />

      {/* Sky */}
      <Sky 
        distance={450000} 
        sunPosition={[0, 1, 0]} 
        inclination={0.5} 
        azimuth={0.25} 
      />

      {/* FPS Counter */}
      {showFPS && <Stats />}

      {/* 3D Map */}
      <SimpleTextureMap
        baseTexturePath={baseTexturePath}
        heightmapTexturePath={heightmapTexturePath}
        terrainTexturePath={terrainTexturePath}
        miscTexturePath={miscTexturePath}
        politicalTexturePath={politicalTexturePath}
        width={width}
        height={height}
        terrainSegments={terrainSegments}
        waterSegments={waterSegments}
        qualityLevel={qualityLevel}
        lowHeight={lowHeight}
        midHeight={midHeight}
        highHeight={highHeight}
      />

      {/* Camera Controls - Enhanced movement with smoother panning and strict rotation limits */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        // Zoom settings - Much stronger zooming
        minDistance={1}
        maxDistance={50}
        zoomSpeed={2.0} // Increased from 1.0 for stronger zooming
        // Rotation limits - allow top view but prevent looking down too much
        minPolarAngle={0} // 0 degrees minimum (top view allowed)
        maxPolarAngle={Math.PI / 2.5} // ~72 degrees maximum (prevent looking down too much)
        // Azimuth rotation limits - prevent full 360 rotation
        minAzimuthAngle={-Math.PI / 3} // -60 degrees
        maxAzimuthAngle={Math.PI / 3} // +60 degrees
        // Enhanced smooth damping with more smoothing
        enableDamping={true}
        dampingFactor={0.12} // Increased from 0.08 for more smoothing
        rotateSpeed={0.6} // Reduced from 0.8 for smoother rotation
        // Pan settings - Slower and more controlled
        panSpeed={0.8} // Reduced from 1.5 for slower, more controlled panning
        // Target and initial position
        target={[0, 0, 0]}
      />
    </>
  );
};

export default SimpleMapScene; 