import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PLAYER_GEOMETRY, UV_COORDS, MINECRAFT_SCALE, createBodyPartGeometry } from './PlayerGeometry';

interface PlayerMeshProps {
  playerName: string;
}

const PlayerMesh: React.FC<PlayerMeshProps> = ({ playerName }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const { gl } = useThree();
  
  // Load skin texture
  const skinTexture = useLoader(TextureLoader, `https://mc-heads.net/skin/${playerName}`);
  
  useEffect(() => {
    if (skinTexture) {
      skinTexture.magFilter = THREE.NearestFilter;
      skinTexture.minFilter = THREE.NearestFilter;
      skinTexture.flipY = false;
      skinTexture.wrapS = THREE.ClampToEdgeWrapping;
      skinTexture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [skinTexture]);

  // Mouse interaction handlers
  useEffect(() => {
    const handleMouseDown = () => {
      setIsDragging(true);
      setAutoRotate(false);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setRotation(prev => ({
          x: prev.x + event.movementY * 0.01,
          y: prev.y + event.movementX * 0.01
        }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setTimeout(() => setAutoRotate(true), 2000);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, gl.domElement]);

  // Animation frame
  useFrame((state) => {
    if (groupRef.current) {
      if (autoRotate && !isDragging) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
        groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
      } else {
        groupRef.current.rotation.x = rotation.x;
        groupRef.current.rotation.y = rotation.y;
      }
    }
  });

  // Create material with skin texture
  const material = skinTexture ? new THREE.MeshLambertMaterial({ 
    map: skinTexture,
    transparent: true,
    alphaTest: 0.5
  }) : new THREE.MeshLambertMaterial({ color: "#8B4513" });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Head */}
      <mesh 
        position={[0, PLAYER_GEOMETRY.head.y * MINECRAFT_SCALE + 0.0625, 0]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.head.width,
          PLAYER_GEOMETRY.head.height,
          PLAYER_GEOMETRY.head.depth,
          UV_COORDS.head
        )}
        material={material}
      />

      {/* Body */}
      <mesh 
        position={[0, PLAYER_GEOMETRY.body.y * MINECRAFT_SCALE, 0]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.body.width,
          PLAYER_GEOMETRY.body.height,
          PLAYER_GEOMETRY.body.depth,
          UV_COORDS.body
        )}
        material={material}
      />

      {/* Right Arm */}
      <mesh 
        position={[
          PLAYER_GEOMETRY.armRight.x * MINECRAFT_SCALE,
          PLAYER_GEOMETRY.armRight.y * MINECRAFT_SCALE,
          0
        ]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.armRight.width,
          PLAYER_GEOMETRY.armRight.height,
          PLAYER_GEOMETRY.armRight.depth,
          UV_COORDS.armRight
        )}
        material={material}
      />

      {/* Left Arm */}
      <mesh 
        position={[
          PLAYER_GEOMETRY.armLeft.x * MINECRAFT_SCALE,
          PLAYER_GEOMETRY.armLeft.y * MINECRAFT_SCALE,
          0
        ]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.armLeft.width,
          PLAYER_GEOMETRY.armLeft.height,
          PLAYER_GEOMETRY.armLeft.depth,
          UV_COORDS.armLeft
        )}
        material={material}
      />

      {/* Right Leg */}
      <mesh 
        position={[
          PLAYER_GEOMETRY.legRight.x * MINECRAFT_SCALE,
          PLAYER_GEOMETRY.legRight.y * MINECRAFT_SCALE,
          0
        ]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.legRight.width,
          PLAYER_GEOMETRY.legRight.height,
          PLAYER_GEOMETRY.legRight.depth,
          UV_COORDS.legRight
        )}
        material={material}
      />

      {/* Left Leg */}
      <mesh 
        position={[
          PLAYER_GEOMETRY.legLeft.x * MINECRAFT_SCALE,
          PLAYER_GEOMETRY.legLeft.y * MINECRAFT_SCALE,
          0
        ]}
        geometry={createBodyPartGeometry(
          PLAYER_GEOMETRY.legLeft.width,
          PLAYER_GEOMETRY.legLeft.height,
          PLAYER_GEOMETRY.legLeft.depth,
          UV_COORDS.legLeft
        )}
        material={material}
      />
    </group>
  );
};

export default PlayerMesh;