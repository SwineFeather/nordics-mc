export interface Town {
  id: string;
  name: string;
  mayor: string;
  mayor_name?: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
  created_at: string;
  updated_at: string;
  total_xp?: number;
  level?: number;
  balance?: number;
  location_x?: number | null;
  location_z?: number | null;
  nation?: {
    name: string;
    color?: string;
    type?: string;
  };
}

export interface TownLevelInfo {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  title?: string;
  description?: string;
  color?: string;
}

export interface TownAchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  created_at: string;
}

export interface TownAchievementTier {
  id: string;
  achievement_id: string;
  tier: number;
  name: string;
  description: string;
  threshold: number;
  points: number;
  icon: string;
  color: string;
  created_at: string;
}

export interface TownUnlockedAchievement {
  id: string;
  town_id: string;
  tier_id: string;
  unlocked_at: string;
  claimed_at?: string;
  is_claimed: boolean;
  tier?: TownAchievementTier & {
    definition?: TownAchievementDefinition;
  };
}

export interface TownProfilePicture {
  name: string;
  url: string;
  width: number;
  height: number;
}

// Function to normalize entity name for safe filename generation
export const normalizeEntityName = (name: string): string => {
  // First, normalize Unicode characters (decomposes characters like å, ö, ä)
  const normalized = name.normalize('NFD');
  
  // Create a mapping for Nordic and other special characters
  const charMap: { [key: string]: string } = {
    // Nordic characters
    'å': 'a',
    'ä': 'a', 
    'ö': 'o',
    'Å': 'A',
    'Ä': 'A',
    'Ö': 'O',
    // Other common special characters
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'ë': 'e',
    'á': 'a',
    'à': 'a',
    'â': 'a',
    'ã': 'a',
    'í': 'i',
    'ì': 'i',
    'î': 'i',
    'ï': 'i',
    'ó': 'o',
    'ò': 'o',
    'ô': 'o',
    'õ': 'o',
    'ú': 'u',
    'ù': 'u',
    'û': 'u',
    'ü': 'u',
    'ý': 'y',
    'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'ß': 'ss',
    // Remove diacritics (combining marks)
    '\u0300': '', // grave accent
    '\u0301': '', // acute accent
    '\u0302': '', // circumflex
    '\u0303': '', // tilde
    '\u0304': '', // macron
    '\u0306': '', // breve
    '\u0307': '', // dot above
    '\u0308': '', // diaeresis
    '\u0309': '', // hook above
    '\u030A': '', // ring above
    '\u030B': '', // double acute
    '\u030C': '', // caron
    '\u0327': '', // cedilla
    '\u0328': '', // ogonek
  };

  // Replace special characters
  let result = normalized;
  for (const [char, replacement] of Object.entries(charMap)) {
    result = result.replace(new RegExp(char, 'g'), replacement);
  }

  // Remove any remaining non-alphanumeric characters except spaces and underscores
  result = result
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  // Ensure the result is not empty
  if (!result) {
    result = 'unnamed';
  }

  return result;
};

// Function to get town profile picture URL with dynamic sizing
export const getTownProfilePicture = (townName: string, imageUrl?: string | null): TownProfilePicture => {
  // If a custom image URL is provided, use it
  if (imageUrl) {
    return {
      name: townName,
      url: imageUrl,
      width: 300,
      height: 200
    };
  }
  
  // Otherwise, generate the default URL using normalized filename
  const baseUrl = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/nation-town-images/towns/';
  const cleanName = normalizeEntityName(townName);
  const url = `${baseUrl}${cleanName}.png`;
  
  // Default dimensions - will be updated when image loads
  return {
    name: townName,
    url,
    width: 300,
    height: 200
  };
};

// Function to handle image loading and maintain aspect ratio
export const handleTownImageLoad = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  setImageDimensions: (dimensions: { width: number; height: number }) => void
) => {
  const img = event.target as HTMLImageElement;
  const { naturalWidth, naturalHeight } = img;
  
  // Calculate aspect ratio and set appropriate dimensions
  const aspectRatio = naturalWidth / naturalHeight;
  let displayWidth = 300;
  let displayHeight = 200;
  
  if (aspectRatio > 1.5) {
    // Wide image
    displayWidth = 400;
    displayHeight = Math.round(400 / aspectRatio);
  } else if (aspectRatio < 0.75) {
    // Tall image
    displayHeight = 300;
    displayWidth = Math.round(300 * aspectRatio);
  } else {
    // Square-ish image
    displayWidth = 300;
    displayHeight = Math.round(300 / aspectRatio);
  }
  
  setImageDimensions({ width: displayWidth, height: displayHeight });
}; 