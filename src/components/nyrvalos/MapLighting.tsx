import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from './QualityContext';

const MapLighting: React.FC = () => {
  const { scene } = useThree();
  const { getLightingEnabled, getShadowEnabled } = useQuality();

  const lightingEnabled = getLightingEnabled();
  const shadowsEnabled = getShadowEnabled();

  React.useEffect(() => {
    // Enable shadows for better 3D depth based on quality settings
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = shadowsEnabled;
        child.receiveShadow = shadowsEnabled;
      }
    });
  }, [scene, shadowsEnabled]);

  if (!lightingEnabled) {
    // Minimal lighting for low quality
    return (
      <>
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight position={[0, 100, 0]} intensity={0.4} />
      </>
    );
  }

  return (
    <>
      {/* Ambient Lighting - moderate overall illumination */}
      <ambientLight intensity={0.7} color="#ffffff" />
      
      {/* Main Directional Light - simplified for performance */}
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={0.8} 
        castShadow={shadowsEnabled}
        shadow-mapSize-width={shadowsEnabled ? 1024 : 512}
        shadow-mapSize-height={shadowsEnabled ? 1024 : 512}
        shadow-camera-far={400}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light - reduces harsh shadows */}
      <directionalLight position={[-30, 80, -30]} intensity={0.3} color="#ffffff" />
    </>
  );
};

// Ensure proper default export
export default MapLighting; 