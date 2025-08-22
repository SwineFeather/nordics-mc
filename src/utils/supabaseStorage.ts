import { supabase } from '@/integrations/supabase/client';

const STORAGE_BUCKET = 'map-images';

export interface MapImageConfig {
  path: string;
  label: string;
  size: 'low' | 'med' | 'full';
  type: 'baselayer' | 'heightmap' | 'terrain' | 'misc' | 'heightmapVector' | 'political';
}

export const MAP_IMAGES: Record<string, MapImageConfig> = {
  // Base layer textures
  'baselayer-low': {
    path: `${STORAGE_BUCKET}/baselayer-low.jpg`,
    label: 'Base Layer (Low Quality)',
    size: 'low',
    type: 'baselayer'
  },
  'baselayer-med': {
    path: `${STORAGE_BUCKET}/baselayer-med.jpg`,
    label: 'Base Layer (Medium Quality)',
    size: 'med',
    type: 'baselayer'
  },
  'baselayer-full': {
    path: `${STORAGE_BUCKET}/baselayer-full.jpg`,
    label: 'Base Layer (Full Quality)',
    size: 'full',
    type: 'baselayer'
  },

  // Heightmap textures
  'heightmap-low': {
    path: `${STORAGE_BUCKET}/heightmap-low.png`,
    label: 'Heightmap (Low Quality)',
    size: 'low',
    type: 'heightmap'
  },
  'heightmap-med': {
    path: `${STORAGE_BUCKET}/heightmap-med.png`,
    label: 'Heightmap (Medium Quality)',
    size: 'med',
    type: 'heightmap'
  },
  'heightmap-full': {
    path: `${STORAGE_BUCKET}/heightmap-full.png`,
    label: 'Heightmap (Full Quality)',
    size: 'full',
    type: 'heightmap'
  },
  'heightmap': {
    path: `${STORAGE_BUCKET}/heightmap.png`,
    label: 'Heightmap (High Detail)',
    size: 'full',
    type: 'heightmap'
  },

  // Terrain textures
  'terrain-low': {
    path: `${STORAGE_BUCKET}/terrain-low.png`,
    label: 'Terrain (Low Quality)',
    size: 'low',
    type: 'terrain'
  },
  'terrain-med': {
    path: `${STORAGE_BUCKET}/terrain-med.png`,
    label: 'Terrain (Medium Quality)',
    size: 'med',
    type: 'terrain'
  },
  'terrain-full': {
    path: `${STORAGE_BUCKET}/terrain-full.png`,
    label: 'Terrain (Full Quality)',
    size: 'full',
    type: 'terrain'
  },

  // Misc textures
  'misc-low': {
    path: `${STORAGE_BUCKET}/misc-low.png`,
    label: 'Misc (Low Quality)',
    size: 'low',
    type: 'misc'
  },
  'misc-med': {
    path: `${STORAGE_BUCKET}/misc-med.png`,
    label: 'Misc (Medium Quality)',
    size: 'med',
    type: 'misc'
  },
  'misc-full': {
    path: `${STORAGE_BUCKET}/misc-full.png`,
    label: 'Misc (Full Quality)',
    size: 'full',
    type: 'misc'
  },

  // Heightmap vector textures
  'heightmapVector-low': {
    path: `${STORAGE_BUCKET}/heightmapVector-low.png`,
    label: 'Heightmap Vector (Low Quality)',
    size: 'low',
    type: 'heightmapVector'
  },
  'heightmapVector-med': {
    path: `${STORAGE_BUCKET}/heightmapVector-med.png`,
    label: 'Heightmap Vector (Medium Quality)',
    size: 'med',
    type: 'heightmapVector'
  },
  'heightmapVector-full': {
    path: `${STORAGE_BUCKET}/heightmapVector-full.png`,
    label: 'Heightmap Vector (Full Quality)',
    size: 'full',
    type: 'heightmapVector'
  },

  // Political maps
  'political-2025-04-20': {
    path: `${STORAGE_BUCKET}/political-maps/2025-04-20.jpg`,
    label: 'Political Map - April 20, 2025',
    size: 'full',
    type: 'political'
  },
  'political-2024-02-24': {
    path: `${STORAGE_BUCKET}/political-maps/2024-02-24.png`,
    label: 'Political Map - February 24, 2024',
    size: 'full',
    type: 'political'
  },
  'political-2024-01-06': {
    path: `${STORAGE_BUCKET}/political-maps/2024-01-06.png`,
    label: 'Political Map - January 6, 2024',
    size: 'full',
    type: 'political'
  },
  'political-2023-12-21': {
    path: `${STORAGE_BUCKET}/political-maps/2023-12-21.jpg`,
    label: 'Political Map - December 21, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-11-12': {
    path: `${STORAGE_BUCKET}/political-maps/2023-11-12.png`,
    label: 'Political Map - November 12, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-10-29': {
    path: `${STORAGE_BUCKET}/political-maps/2023-10-29.png`,
    label: 'Political Map - October 29, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-10-10': {
    path: `${STORAGE_BUCKET}/political-maps/2023-10-10.png`,
    label: 'Political Map - October 10, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-10-08': {
    path: `${STORAGE_BUCKET}/political-maps/2023-10-08.png`,
    label: 'Political Map - October 8, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-10-02': {
    path: `${STORAGE_BUCKET}/political-maps/2023-10-02.png`,
    label: 'Political Map - October 2, 2023',
    size: 'full',
    type: 'political'
  },
  'political-2023-10-01': {
    path: `${STORAGE_BUCKET}/political-maps/2023-10-01.png`,
    label: 'Political Map - October 1, 2023',
    size: 'full',
    type: 'political'
  },

  // Legacy political map (from nyrvalos)
  'political': {
    path: `${STORAGE_BUCKET}/2025NordicsMapWeek16small.jpg`,
    label: 'Political Map',
    size: 'full',
    type: 'political'
  }
};

/**
 * Get the public URL for a map image from Supabase storage
 */
export function getMapImageUrl(imageKey: string): string {
  const config = MAP_IMAGES[imageKey];
  if (!config) {
    console.warn(`Unknown map image key: ${imageKey}`);
    return '';
  }

  console.log(`Getting URL for ${imageKey}:`, config);

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(config.path);

  console.log(`Supabase response for ${imageKey}:`, data);

  return data.publicUrl;
}

/**
 * Get the public URL for a map image by path
 */
export function getMapImageUrlByPath(path: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get all available image configurations for a specific type
 */
export function getImagesByType(type: MapImageConfig['type']): MapImageConfig[] {
  return Object.values(MAP_IMAGES).filter(img => img.type === type);
}

/**
 * Get all available image configurations for a specific size
 */
export function getImagesBySize(size: MapImageConfig['size']): MapImageConfig[] {
  return Object.values(MAP_IMAGES).filter(img => img.size === size);
}

/**
 * Get the default image for a specific type and size
 */
export function getDefaultImage(type: MapImageConfig['type'], size: MapImageConfig['size'] = 'med'): MapImageConfig | null {
  return Object.values(MAP_IMAGES).find(img => img.type === type && img.size === size) || null;
}

/**
 * Test function to verify Supabase client is working
 */
export function testSupabaseConnection(): void {
  console.log('Testing Supabase connection...');
  console.log('Supabase client:', supabase);
  console.log('Storage bucket:', STORAGE_BUCKET);
  
  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl('test');
    
    console.log('Supabase storage working:', data);
  } catch (err) {
    console.error('Supabase connection test failed:', err);
  }
}

/**
 * Get political map URL by date
 */
export function getPoliticalMapUrl(date: string): string {
  const politicalKey = `political-${date}`;
  console.log('getPoliticalMapUrl called with:', { date, politicalKey });
  
  const config = MAP_IMAGES[politicalKey];
  if (!config) {
    console.warn(`Unknown political map key: ${politicalKey}`);
    console.log('Available political keys:', Object.keys(MAP_IMAGES).filter(key => key.startsWith('political-')));
    return '';
  }
  
  console.log('Found config:', config);
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(config.path);
  
  console.log('Supabase response:', data);
  
  return data.publicUrl;
}

/**
 * Get all available political map dates
 */
export function getAvailablePoliticalMapDates(): string[] {
  return Object.keys(MAP_IMAGES)
    .filter(key => key.startsWith('political-'))
    .map(key => key.replace('political-', ''));
}
