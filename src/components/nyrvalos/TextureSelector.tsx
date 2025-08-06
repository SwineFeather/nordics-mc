import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TextureOption {
  name: string;
  path: string;
  description: string;
  type: 'base' | 'terrain' | 'misc' | 'heightmap';
}

const baseTextureOptions: TextureOption[] = [
  {
    name: 'Base Layer (Low)',
    path: '/nyrvalos/baselayer-low.jpg',
    description: 'Low resolution base layer texture',
    type: 'base'
  },
  {
    name: 'Base Layer (Medium)',
    path: '/nyrvalos/baselayer-med.jpg',
    description: 'Medium resolution base layer texture',
    type: 'base'
  },
  {
    name: 'Base Layer (Full)',
    path: '/nyrvalos/baselayer-full.jpg',
    description: 'Full resolution base layer texture',
    type: 'base'
  }
];

const heightmapTextureOptions: TextureOption[] = [
  {
    name: 'Heightmap (Low)',
    path: '/nyrvalos/heightmap-low.png',
    description: 'Low resolution heightmap',
    type: 'heightmap'
  },
  {
    name: 'Heightmap (Medium)',
    path: '/nyrvalos/heightmap-med.png',
    description: 'Medium resolution heightmap',
    type: 'heightmap'
  },
  {
    name: 'Heightmap (Full)',
    path: '/nyrvalos/heightmap-full.png',
    description: 'Full resolution heightmap',
    type: 'heightmap'
  }
];

const terrainTextureOptions: TextureOption[] = [
  {
    name: 'Terrain (Low)',
    path: '/nyrvalos/terrain-low.png',
    description: 'Low resolution terrain overlay',
    type: 'terrain'
  },
  {
    name: 'Terrain (Medium)',
    path: '/nyrvalos/terrain-med.png',
    description: 'Medium resolution terrain overlay',
    type: 'terrain'
  },
  {
    name: 'Terrain (Full)',
    path: '/nyrvalos/terrain-full.png',
    description: 'Full resolution terrain overlay',
    type: 'terrain'
  }
];

const miscTextureOptions: TextureOption[] = [
  {
    name: 'Misc (Low)',
    path: '/nyrvalos/misc-low.png',
    description: 'Low resolution misc overlay',
    type: 'misc'
  },
  {
    name: 'Misc (Medium)',
    path: '/nyrvalos/misc-med.png',
    description: 'Medium resolution misc overlay',
    type: 'misc'
  },
  {
    name: 'Misc (Full)',
    path: '/nyrvalos/misc-full.png',
    description: 'Full resolution misc overlay',
    type: 'misc'
  }
];

interface TextureSelectorProps {
  selectedBaseTexture: string;
  selectedHeightmapTexture: string;
  selectedTerrainTexture: string | null;
  selectedMiscTexture: string | null;
  onBaseTextureSelect: (texturePath: string) => void;
  onHeightmapTextureSelect: (texturePath: string) => void;
  onTerrainTextureSelect: (texturePath: string | null) => void;
  onMiscTextureSelect: (texturePath: string | null) => void;
}

const TextureSelector: React.FC<TextureSelectorProps> = ({ 
  selectedBaseTexture, 
  selectedHeightmapTexture,
  selectedTerrainTexture,
  selectedMiscTexture,
  onBaseTextureSelect, 
  onHeightmapTextureSelect,
  onTerrainTextureSelect,
  onMiscTextureSelect
}) => {
  const heightmapOptions = [
    { value: '/nyrvalos/heightmap.png', label: 'Heightmap (High Detail)' },
    { value: '/nyrvalos/heightmap-full.png', label: 'Heightmap Full' },
    { value: '/nyrvalos/heightmap-med.png', label: 'Heightmap Medium' },
    { value: '/nyrvalos/heightmap-low.png', label: 'Heightmap Low' }
  ];
  return (
    <Card className="absolute top-4 left-4 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-xl z-10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Texture Layers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Base Layer Selection */}
        <div>
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Base Layer (JPG)</Label>
          <div className="grid grid-cols-1 gap-2">
            {baseTextureOptions.map((option) => (
              <Button
                key={option.path}
                variant={selectedBaseTexture === option.path ? "default" : "outline"}
                size="sm"
                onClick={() => onBaseTextureSelect(option.path)}
                className="justify-start text-left h-auto p-2 text-xs"
              >
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Heightmap Selection */}
        <div>
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Heightmap (PNG)</Label>
          <div className="grid grid-cols-1 gap-2">
            {heightmapTextureOptions.map((option) => (
              <Button
                key={option.path}
                variant={selectedHeightmapTexture === option.path ? "default" : "outline"}
                size="sm"
                onClick={() => onHeightmapTextureSelect(option.path)}
                className="justify-start text-left h-auto p-2 text-xs"
              >
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Terrain Layer Toggle and Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Terrain Overlay (PNG)</Label>
            <Switch
              checked={selectedTerrainTexture !== null}
              onCheckedChange={(checked) => {
                if (checked) {
                  onTerrainTextureSelect('/nyrvalos/terrain-med.png');
                } else {
                  onTerrainTextureSelect(null);
                }
              }}
            />
          </div>
          {selectedTerrainTexture && (
            <div className="grid grid-cols-1 gap-2">
              {terrainTextureOptions.map((option) => (
                <Button
                  key={option.path}
                  variant={selectedTerrainTexture === option.path ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTerrainTextureSelect(option.path)}
                  className="justify-start text-left h-auto p-2 text-xs"
                >
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Misc Layer Toggle and Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Misc Overlay (PNG) - 10% Opacity</Label>
            <Switch
              checked={selectedMiscTexture !== null}
              onCheckedChange={(checked) => {
                if (checked) {
                  onMiscTextureSelect('/nyrvalos/misc-med.png');
                } else {
                  onMiscTextureSelect(null);
                }
              }}
            />
          </div>
          {selectedMiscTexture && (
            <div className="grid grid-cols-1 gap-2">
              {miscTextureOptions.map((option) => (
                <Button
                  key={option.path}
                  variant={selectedMiscTexture === option.path ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMiscTextureSelect(option.path)}
                  className="justify-start text-left h-auto p-2 text-xs"
                >
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default TextureSelector; 