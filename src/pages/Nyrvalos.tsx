import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Globe } from 'lucide-react';
import SimpleMapScene from '@/components/nyrvalos/SimpleMapScene';
import TextureSelector from '@/components/nyrvalos/TextureSelector';
import QualitySettings from '@/components/nyrvalos/QualitySettings';
import { getMapImageUrl } from '@/utils/supabaseStorage';

const Nyrvalos: React.FC = () => {
  const [selectedBaseTexture, setSelectedBaseTexture] = useState(getMapImageUrl('baselayer-med'));
  const [selectedHeightmapTexture, setSelectedHeightmapTexture] = useState(getMapImageUrl('heightmap-med'));
  const [selectedTerrainTexture, setSelectedTerrainTexture] = useState<string | null>(getMapImageUrl('terrain-med')); // On by default
  const [selectedMiscTexture, setSelectedMiscTexture] = useState<string | null>(getMapImageUrl('misc-med')); // On by default
  
  // Quality settings state
  const [showFPS, setShowFPS] = useState(false);
  const [textureQuality, setTextureQuality] = useState('full'); // Default to full texture quality
  const qualityLevel = 1; // Fixed to medium 3D quality

  // Layer visibility state
  const [showPoliticalMap, setShowPoliticalMap] = useState(false);

  // Fixed height values - Reduced for less dramatic terrain
  const lowHeight = -0.01; // Black areas (ocean/lowlands) - Less deep
  const midHeight = 0.0; // Grey areas (hills/plains) - Neutral
  const highHeight = 0.1; // White areas (mountains) - Less high

  // Get texture paths based on quality setting
  const getTexturePath = (basePath: string, quality: string) => {
    // Extract the base key from the Supabase URL
    const urlParts = basePath.split('/');
    const filename = urlParts[urlParts.length - 1];
    const baseKey = filename.replace(/(low|med|full)/, '').replace(/\.(jpg|png)$/, '');
    
    // Map quality to size
    const qualityMap: Record<string, string> = {
      'low': 'low',
      'med': 'med', 
      'full': 'full'
    };
    
    const targetSize = qualityMap[quality] || 'med';
    return getMapImageUrl(`${baseKey}-${targetSize}`);
  };

  const currentBaseTexture = getTexturePath(selectedBaseTexture, textureQuality);
  const currentHeightmapTexture = getTexturePath(selectedHeightmapTexture, textureQuality);
  const currentTerrainTexture = selectedTerrainTexture ? getTexturePath(selectedTerrainTexture, textureQuality) : null;
  const currentMiscTexture = selectedMiscTexture ? getTexturePath(selectedMiscTexture, textureQuality) : null;
  const currentPoliticalTexture = showPoliticalMap ? getMapImageUrl('political') : null;

  // Debug logging
  console.log('Political map state:', { showPoliticalMap, currentPoliticalTexture });

  const handleBaseTextureSelect = (texturePath: string) => {
    setSelectedBaseTexture(texturePath);
  };

  const handleHeightmapTextureSelect = (texturePath: string) => {
    setSelectedHeightmapTexture(texturePath);
  };

  const handleTerrainTextureSelect = (texturePath: string | null) => {
    setSelectedTerrainTexture(texturePath);
  };

  const handleMiscTextureSelect = (texturePath: string | null) => {
    setSelectedMiscTexture(texturePath);
  };

  const handleTextureQualityChange = (quality: string) => {
    setTextureQuality(quality);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-blue-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nyrvalos</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">3D Layered Texture Viewer with Water Effects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-120px)] relative">
        {/* Texture Selector */}
        <TextureSelector 
          selectedBaseTexture={selectedBaseTexture}
          selectedHeightmapTexture={selectedHeightmapTexture}
          selectedTerrainTexture={selectedTerrainTexture}
          selectedMiscTexture={selectedMiscTexture}
          onBaseTextureSelect={handleBaseTextureSelect}
          onHeightmapTextureSelect={handleHeightmapTextureSelect}
          onTerrainTextureSelect={handleTerrainTextureSelect}
          onMiscTextureSelect={handleMiscTextureSelect}
        />

        {/* Quality Settings */}
        <div className="absolute top-4 right-4 z-10">
          <QualitySettings
            showFPS={showFPS}
            onShowFPSChange={setShowFPS}
            textureQuality={textureQuality}
            onTextureQualityChange={handleTextureQualityChange}
            showPoliticalMap={showPoliticalMap}
            onShowPoliticalMapChange={setShowPoliticalMap}
          />
        </div>

        {/* 3D Map Area */}
        <div className="w-full h-full relative">
          {/* BlueMap Overlay - Shows when zoomed in close */}
          {/* Removed BlueMap functionality */}

          <Canvas
            camera={{ 
              position: [0, 15, 0], // Proper overhead view
              fov: 50, // Wider FOV for better overview
              near: 0.1,
              far: 1000
            }}
            style={{ background: 'transparent' }}
            gl={{ 
              antialias: true,
              powerPreference: "high-performance",
              alpha: true,
              depth: true,
              stencil: false,
              preserveDrawingBuffer: false
            }}
            dpr={[0.5, 1]}
            performance={{ min: 0.5 }}
            shadows
          >
            <SimpleMapScene 
              baseTexturePath={currentBaseTexture}
              heightmapTexturePath={currentHeightmapTexture}
              terrainTexturePath={currentTerrainTexture}
              miscTexturePath={currentMiscTexture}
              politicalTexturePath={currentPoliticalTexture}
              width={20}
              height={20}
              qualityLevel={qualityLevel}
              showFPS={showFPS}
              lowHeight={lowHeight}
              midHeight={midHeight}
              highHeight={highHeight}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Nyrvalos; 