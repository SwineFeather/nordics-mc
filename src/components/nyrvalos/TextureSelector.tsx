import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getMapImageUrl, getImagesByType, type MapImageConfig } from '@/utils/supabaseStorage';

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
  const baseTextureOptions = getImagesByType('baselayer');
  const heightmapTextureOptions = getImagesByType('heightmap');
  const terrainTextureOptions = getImagesByType('terrain');
  const miscTextureOptions = getImagesByType('misc');

  const heightmapOptions = [
    { value: getMapImageUrl('heightmap'), label: 'Heightmap (High Detail)' },
    { value: getMapImageUrl('heightmap-full'), label: 'Heightmap Full' },
    { value: getMapImageUrl('heightmap-med'), label: 'Heightmap Medium' },
    { value: getMapImageUrl('heightmap-low'), label: 'Heightmap Low' }
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
                variant={selectedBaseTexture === getMapImageUrl(option.path.split('/').pop()?.replace('.jpg', '') || '') ? "default" : "outline"}
                size="sm"
                onClick={() => onBaseTextureSelect(getMapImageUrl(option.path.split('/').pop()?.replace('.jpg', '') || ''))}
                className="justify-start text-left h-auto p-2 text-xs"
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.size} quality</div>
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
                variant={selectedHeightmapTexture === getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || '') ? "default" : "outline"}
                size="sm"
                onClick={() => onHeightmapTextureSelect(getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || ''))}
                className="justify-start text-left h-auto p-2 text-xs"
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.size} quality</div>
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
                  onTerrainTextureSelect(getMapImageUrl('terrain-med'));
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
                  variant={selectedTerrainTexture === getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || '') ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTerrainTextureSelect(getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || ''))}
                  className="justify-start text-left h-auto p-2 text-xs"
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.size} quality</div>
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
                  onMiscTextureSelect(getMapImageUrl('misc-med'));
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
                  variant={selectedMiscTexture === getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || '') ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMiscTextureSelect(getMapImageUrl(option.path.split('/').pop()?.replace('.png', '') || ''))}
                  className="justify-start text-left h-auto p-2 text-xs"
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.size} quality</div>
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