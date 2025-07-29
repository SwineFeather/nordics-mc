import React from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface MapControlsProps {
  // Add any additional props if needed
}

const MapControls: React.FC<MapControlsProps> = () => {
  const { camera } = useThree();

  // Set initial camera position for immersive 3D view
  React.useEffect(() => {
    // Position camera for a larger flat map view
    camera.position.set(0, 80, 0);
    camera.lookAt(0, 0, 0);
    
    // Set camera properties for better 3D perception (only for PerspectiveCamera)
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 65; // Wider field of view for more immersive feel
      camera.near = 0.1;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={20}
      maxDistance={800}
      minPolarAngle={0.1} // Allow more vertical rotation
      maxPolarAngle={Math.PI / 2.1} // Almost overhead
      target={[0, 0, 0]}
      dampingFactor={0.05}
      enableDamping={true}
      zoomSpeed={2.5} // Faster zooming for better control
      panSpeed={2.0} // Faster panning
      rotateSpeed={0.8} // Slightly slower rotation for precision
    />
  );
};

export default MapControls; 