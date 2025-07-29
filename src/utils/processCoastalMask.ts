// Utility to pre-process the coastal mask texture
// This creates a simple lookup table for land/water areas

export interface CoastalMaskData {
  width: number;
  height: number;
  landMap: boolean[][]; // 2D array where true = land, false = water
}

export const processCoastalMask = async (): Promise<CoastalMaskData> => {
  console.log('processCoastalMask: Starting...');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('processCoastalMask: Image loaded, processing pixels...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const landMap: boolean[][] = [];
      
      // Initialize the 2D array
      for (let y = 0; y < img.height; y++) {
        landMap[y] = [];
        for (let x = 0; x < img.width; x++) {
          landMap[y][x] = false;
        }
      }
      
      // Process each pixel
      let landCount = 0;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4;
          const red = imageData.data[index];
          
          // White pixels (red > 200) are land
          if (red > 200) {
            landMap[y][x] = true;
            landCount++;
          }
        }
      }
      
      console.log(`Processed coastal mask: ${landCount} land pixels out of ${img.width * img.height} total pixels`);
      
      resolve({
        width: img.width,
        height: img.height,
        landMap
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load coastal mask image'));
    };
    
    img.src = '/nyrvalos/heightmapVector-full.png';
  });
};

// Function to check if a plot is on land using pre-processed data
export const isPlotOnLand = (
  plot: { x: number; z: number }, 
  maskData: CoastalMaskData
): boolean => {
  const plotX = isNaN(plot.x) ? 0 : plot.x;
  const plotZ = isNaN(plot.z) ? 0 : plot.z;
  
  // Convert to block coordinates
  const blockX = plotX * 16;
  const blockZ = plotZ * 16;
  
  // Check if within map bounds
  const inBounds = blockX >= -7680 && blockX <= 7679 && 
                  blockZ >= 4224 && blockZ <= 13055;
  
  if (!inBounds) return false;
  
  // Convert block coordinates to texture coordinates
  const textureX = Math.floor(((blockX + 7680) / 15360) * maskData.width);
  const textureY = Math.floor(((blockZ - 4224) / 8832) * maskData.height);
  
  // Flip Y coordinate (texture is top-down)
  const flippedY = maskData.height - textureY;
  
  // Clamp coordinates to image bounds
  const clampedX = Math.max(0, Math.min(textureX, maskData.width - 1));
  const clampedY = Math.max(0, Math.min(flippedY, maskData.height - 1));
  
  // Check if this pixel is land in the 2D array
  return maskData.landMap[clampedY]?.[clampedX] || false;
}; 