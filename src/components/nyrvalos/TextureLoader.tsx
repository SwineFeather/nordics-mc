import React, { useState, useEffect } from 'react';
import { useQuality } from './QualityContext';

interface TextureLoaderProps {
  onTexturesLoaded: () => void;
}

const TextureLoader: React.FC<TextureLoaderProps> = ({ onTexturesLoaded }) => {
  const { getTexturePath } = useQuality();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const loadTextures = async () => {
      const textures = [
        { name: 'baselayer', path: getTexturePath('baselayer') },
        { name: 'misc', path: getTexturePath('misc') }
      ];

      let loadedCount = 0;
      const totalTextures = textures.length;

      const loadTexture = (texture: { name: string; path: string }): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            loadedCount++;
            const progress = (loadedCount / totalTextures) * 100;
            setLoadingProgress(progress);
            setLoadingText(`Loaded ${texture.name} (${loadedCount}/${totalTextures})`);
            console.log(`Successfully loaded texture: ${texture.path}`);
            console.log(`Image dimensions: ${img.width} x ${img.height}`);
            console.log(`Image natural dimensions: ${img.naturalWidth} x ${img.naturalHeight}`);
            resolve();
          };
          
          img.onerror = () => {
            console.warn(`Failed to load texture: ${texture.path}`);
            console.warn('Trying PNG fallback...');
            
            // Try PNG fallback
            const pngPath = texture.path.replace('.jpg', '.png');
            const pngImg = new Image();
            pngImg.crossOrigin = 'anonymous';
            
            pngImg.onload = () => {
              console.log(`Successfully loaded PNG fallback: ${pngPath}`);
              loadedCount++;
              const progress = (loadedCount / totalTextures) * 100;
              setLoadingProgress(progress);
              setLoadingText(`Loaded ${texture.name} (PNG fallback)`);
              resolve();
            };
            
            pngImg.onerror = () => {
              console.error(`Failed to load both JPG and PNG: ${texture.path}`);
              loadedCount++;
              const progress = (loadedCount / totalTextures) * 100;
              setLoadingProgress(progress);
              setLoadingText(`Failed to load ${texture.name}, continuing...`);
              resolve(); // Continue even if texture fails
            };
            
            pngImg.src = pngPath;
          };
          
          // Add timestamp to prevent caching issues
          const timestamp = Date.now();
          img.src = `${texture.path}?t=${timestamp}`;
        });
      };

      // Load textures sequentially to avoid overwhelming the browser
      for (const texture of textures) {
        await loadTexture(texture);
        // Small delay between loads to prevent browser freezing
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setLoadingText('Textures loaded successfully!');
      setTimeout(() => {
        onTexturesLoaded();
      }, 300);
    };

    loadTextures();
  }, [getTexturePath, onTexturesLoaded]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Loading Nyrvalos</h3>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center">{loadingText}</p>
        <p className="text-xs text-gray-500 text-center mt-2">
          {Math.round(loadingProgress)}% complete
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Using optimized JPG textures for better performance
        </p>
      </div>
    </div>
  );
};

export default TextureLoader; 