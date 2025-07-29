// Heightmap processing utility for Nyrvalos terrain
// This converts the heightmap PNG to optimized JSON data for better performance

export interface HeightmapData {
  width: number;
  height: number;
  heights: number[];
  minHeight: number;
  maxHeight: number;
  scale: number;
}

export class HeightmapProcessor {
  private static instance: HeightmapProcessor;
  private heightmapData: HeightmapData | null = null;
  private processing = false;

  static getInstance(): HeightmapProcessor {
    if (!HeightmapProcessor.instance) {
      HeightmapProcessor.instance = new HeightmapProcessor();
    }
    return HeightmapProcessor.instance;
  }

  async loadHeightmapData(): Promise<HeightmapData> {
    if (this.heightmapData) {
      console.log('Heightmap data already loaded, returning cached data');
      return this.heightmapData;
    }

    if (this.processing) {
      console.log('Heightmap processing already in progress, waiting...');
      while (this.processing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.heightmapData!;
    }

    this.processing = true;
    console.log('Loading heightmap data from PNG...');

    try {
      // Use the medium resolution heightmap instead of full for better performance
      const response = await fetch('/nyrvalos/heightmapVector-med.png');
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      
      console.log('Heightmap image loaded:', imageBitmap.width, 'x', imageBitmap.height);
      
      // Check if the image is too large
      const maxPixels = 1024 * 1024; // 1M pixels max
      if (imageBitmap.width * imageBitmap.height > maxPixels) {
        console.warn('Heightmap too large, using downsampled version');
        // Create a smaller canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions to fit within maxPixels
        const aspectRatio = imageBitmap.width / imageBitmap.height;
        let newWidth = Math.sqrt(maxPixels * aspectRatio);
        let newHeight = maxPixels / newWidth;
        
        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw the image scaled down
        ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
        console.log('Downsampled to:', newWidth, 'x', newHeight);
        
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        
        // Extract height values (using red channel for grayscale)
        const heights: number[] = [];
        let minHeight = 255;
        let maxHeight = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const height = data[i]; // Red channel
          heights.push(height);
          minHeight = Math.min(minHeight, height);
          maxHeight = Math.max(maxHeight, height);
        }
        
        this.heightmapData = {
          width: newWidth,
          height: newHeight,
          heights,
          minHeight,
          maxHeight,
          scale: 1.0
        };
      } else {
        // Use original size if it's small enough
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        ctx.drawImage(imageBitmap, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract height values (using red channel for grayscale)
        const heights: number[] = [];
        let minHeight = 255;
        let maxHeight = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const height = data[i]; // Red channel
          heights.push(height);
          minHeight = Math.min(minHeight, height);
          maxHeight = Math.max(maxHeight, height);
        }
        
        this.heightmapData = {
          width: canvas.width,
          height: canvas.height,
          heights,
          minHeight,
          maxHeight,
          scale: 1.0
        };
      }
      
      console.log('Heightmap data loaded successfully:', {
        width: this.heightmapData.width,
        height: this.heightmapData.height,
        minHeight: this.heightmapData.minHeight,
        maxHeight: this.heightmapData.maxHeight,
        totalPixels: this.heightmapData.heights.length
      });
      
      this.processing = false;
      return this.heightmapData;
      
    } catch (error) {
      this.processing = false;
      console.error('Failed to load heightmap data:', error);
      
      // Fallback: create a simple flat heightmap
      console.log('Creating fallback flat heightmap');
      const fallbackData: HeightmapData = {
        width: 256,
        height: 256,
        heights: new Array(256 * 256).fill(128), // Flat terrain
        minHeight: 128,
        maxHeight: 128,
        scale: 1.0
      };
      
      this.heightmapData = fallbackData;
      return fallbackData;
    }
  }

  // Get height at specific coordinates (normalized 0-1)
  getHeightAt(x: number, z: number): number {
    if (!this.heightmapData) {
      console.warn('Heightmap data not loaded');
      return 0;
    }

    // Clamp coordinates to valid range
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedZ = Math.max(0, Math.min(1, z));
    
    // Convert to pixel coordinates
    const pixelX = Math.floor(clampedX * (this.heightmapData.width - 1));
    const pixelZ = Math.floor(clampedZ * (this.heightmapData.height - 1));
    
    // Get pixel index (note: image data is stored top-to-bottom)
    const index = pixelZ * this.heightmapData.width + pixelX;
    
    if (index >= 0 && index < this.heightmapData.heights.length) {
      return this.heightmapData.heights[index] / 255.0; // Normalize to 0-1
    }
    
    return 0;
  }

  // Get height at world coordinates (converted to normalized)
  getHeightAtWorldCoords(worldX: number, worldZ: number): number {
    // Convert world coordinates to normalized coordinates
    // This assumes the world bounds from types.ts
    const MAP_BOUNDS = {
      topLeft: { x: -7680, z: 4224 },
      bottomRight: { x: 7679, z: 13055 }
    };
    
    const normalizedX = (worldX - MAP_BOUNDS.topLeft.x) / (MAP_BOUNDS.bottomRight.x - MAP_BOUNDS.topLeft.x);
    const normalizedZ = (worldZ - MAP_BOUNDS.topLeft.z) / (MAP_BOUNDS.bottomRight.z - MAP_BOUNDS.topLeft.z);
    
    return this.getHeightAt(normalizedX, normalizedZ);
  }

  // Clear cached data (useful for memory management)
  clearCache(): void {
    this.heightmapData = null;
    console.log('Heightmap cache cleared');
  }

  // Get cached data
  getCachedData(): HeightmapData | null {
    return this.heightmapData;
  }
}

// Export singleton instance
export const heightmapProcessor = HeightmapProcessor.getInstance(); 