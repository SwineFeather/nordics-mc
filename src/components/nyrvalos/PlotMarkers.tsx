import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Plot, blockToMap, mapTo3D } from './types';

interface PlotMarkersProps {
  plots: Plot[];
  showPlots: boolean;
  showLabels: boolean;
}

const PlotMarkers: React.FC<PlotMarkersProps> = ({ plots, showPlots }) => {
  console.log('PlotMarkers render:', { 
    showPlots, 
    plotsLength: plots?.length, 
    plots: plots?.slice(0, 3)
  });

  if (!showPlots) {
    console.log('PlotMarkers: Not rendering - showPlots is false');
    return null;
  }

  // If no plots data, create a test plot
  const plotsToRender = plots && plots.length > 0 ? plots : [
    {
      id: 999,
      town_id: null,
      town_name: 'Test Town',
      world_name: 'world',
      x: 0,
      z: 0,
      plot_type: null,
      owner_uuid: null,
      owner_name: null,
      price: null,
      for_sale: null,
      market_value: null,
      created_at: null,
      last_updated: null
    }
  ];

  console.log('PlotMarkers: Using', plotsToRender.length, 'plots to render');

  // Generate 3D plot objects
  const plotElements = useMemo(() => {
    console.log('PlotMarkers: Generating 3D plot elements for', plotsToRender.length, 'plots');
    
    return plotsToRender.map((plot, index) => {
      const plotX = isNaN(plot.x) ? 0 : plot.x;
      const plotZ = isNaN(plot.z) ? 0 : plot.z;
      const blockCoords = { x: plotX * 16, z: plotZ * 16 };
      const mapCoords = blockToMap(blockCoords.x, blockCoords.z);
      const sceneCoords = mapTo3D(mapCoords.x, mapCoords.z);
      const scaledSceneCoords = { x: sceneCoords.x * 3, z: sceneCoords.z * 3 };
      
      // Color by town name
      let hash = 0;
      if (plot.town_name) {
        for (let i = 0; i < plot.town_name.length; i++) {
          hash = ((hash << 5) - hash) + plot.town_name.charCodeAt(i);
          hash = hash & hash;
        }
      }
      const r = (Math.abs(hash) % 180 + 75) / 255;
      const g = (Math.abs(hash >> 8) % 180 + 75) / 255;
      const b = (Math.abs(hash >> 16) % 180 + 75) / 255;

      if (index < 3) {
        console.log(`Plot ${index}:`, {
          original: { x: plot.x, z: plot.z },
          blockCoords,
          mapCoords,
          sceneCoords,
          scaledSceneCoords,
          color: { r, g, b },
          town: plot.town_name
        });
      }

      // Use bright red for test plot
      const isTestPlot = plot.id === 999;
      const color = isTestPlot ? new THREE.Color(1, 0, 0) : new THREE.Color(r, g, b);

      // Create a 3D building-like object positioned on flat terrain
      return (
        <group key={`plot-${index}`} position={[scaledSceneCoords.x, 0.1, scaledSceneCoords.z]}>
          {/* Base foundation */}
          <mesh position={[0, 0.1, 0]} castShadow={false} receiveShadow={false}>
            <boxGeometry args={[2.5, 0.2, 2.5]} />
            <meshBasicMaterial color={color} opacity={0.8} transparent={true} />
          </mesh>
          
          {/* Main building */}
          <mesh position={[0, 0.8, 0]} castShadow={false} receiveShadow={false}>
            <boxGeometry args={[2.0, 1.4, 2.0]} />
            <meshBasicMaterial color={color} />
          </mesh>
          
          {/* Roof */}
          <mesh position={[0, 1.5, 0]} castShadow={false} receiveShadow={false}>
            <coneGeometry args={[1.5, 0.8, 4]} />
            <meshBasicMaterial color={color} />
          </mesh>
          
          {/* Flag pole for visibility */}
          <mesh position={[0, 2.5, 0]} castShadow={false} receiveShadow={false}>
            <cylinderGeometry args={[0.05, 0.05, 1.0]} />
            <meshBasicMaterial color={0x8B4513} />
          </mesh>
          
          {/* Flag */}
          <mesh position={[0.3, 2.8, 0]} castShadow={false} receiveShadow={false}>
            <boxGeometry args={[0.6, 0.3, 0.05]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      );
    });
  }, [plotsToRender]);

  console.log('PlotMarkers: Returning', plotElements.length, '3D plot elements');
  return <>{plotElements}</>;
};

export default PlotMarkers; 