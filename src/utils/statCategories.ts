
export interface StatCategory {
  key: string;
  name: string;
  color: string;
  bgColor: string;
  description: string;
}

export const STAT_CATEGORIES: Record<string, StatCategory> = {
  general: {
    key: 'general',
    name: 'General',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Basic gameplay statistics'
  },
  building: {
    key: 'building',
    name: 'Building',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Block placement and construction'
  },
  mining: {
    key: 'mining',
    name: 'Mining',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Block breaking and mining'
  },
  combat: {
    key: 'combat',
    name: 'Combat',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Fighting and damage dealing'
  },
  movement: {
    key: 'movement',
    name: 'Movement',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Walking, swimming, and transportation'
  },
  items: {
    key: 'items',
    name: 'Items',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Item usage and interaction'
  },
  crafting: {
    key: 'crafting',
    name: 'Crafting',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Item creation and crafting'
  },
  survival: {
    key: 'survival',
    name: 'Survival',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Deaths and survival mechanics'
  },
  food: {
    key: 'food',
    name: 'Food',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Eating and consumption'
  },
  exploration: {
    key: 'exploration',
    name: 'Exploration',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    description: 'World exploration and discovery'
  }
};

// Comprehensive stat name mapping for better readability
export const STAT_NAME_MAPPING: Record<string, string> = {
  // Time stats
  'play_time': 'Playtime',
  'playtimeHours': 'Playtime (Hours)',
  'play_one_minute': 'Active Playtime',
  'time_since_death': 'Time Since Last Death',
  'time_since_sleep': 'Time Since Last Sleep',
  
  // Movement
  'walk': 'Distance Walked',
  'walk_one_cm': 'Distance Walked',
  'sprint': 'Distance Sprinted',
  'sprint_one_cm': 'Distance Sprinted',
  'swim': 'Distance Swum',
  'aviate': 'Distance Flown',
  'climb': 'Distance Climbed',
  'fall': 'Distance Fallen',
  'dive': 'Distance Dived',
  'jump': 'Times Jumped',
  'crouch': 'Times Crouched',
  
  // Combat
  'mobKills': 'Mob Kills',
  'damage_dealt': 'Damage Dealt',
  'damageDealt': 'Total Damage Dealt',
  'damage_taken': 'Damage Taken',
  'damage_shield': 'Shield Damage Blocked',
  
  // Deaths
  'death': 'Total Deaths',
  'deaths': 'Deaths',
  
  // Building/Mining - Updated for new naming convention
  'blocksPlaced': 'Total Blocks Placed',
  'blocksBroken': 'Total Blocks Broken',
  
  // Items
  'drop': 'Times Dropped Items',
  'open_container': 'Containers Opened',
  'itemsCrafted': 'Items Crafted',
  'itemsDropped': 'Items Dropped',
  'itemsPickedUp': 'Items Picked Up',
  
  // Medals & Rankings
  'medalPoints': 'Medal Points',
  'goldMedals': 'Gold Medals',
  'silverMedals': 'Silver Medals',
  'bronzeMedals': 'Bronze Medals',
  
  // Exploration
  'balance': 'Current Balance'
};

// Category assignment for each stat - Updated for new naming conventions
export const STAT_CATEGORIES_MAPPING: Record<string, string> = {
  // General
  'play_time': 'general',
  'playtimeHours': 'general',
  'play_one_minute': 'general',
  'balance': 'general',
  'medalPoints': 'general',
  'goldMedals': 'general',
  'silverMedals': 'general',
  'bronzeMedals': 'general',
  
  // Movement
  'walk': 'movement',
  'walk_one_cm': 'movement',
  'sprint': 'movement',
  'sprint_one_cm': 'movement',
  'swim': 'movement',
  'aviate': 'movement',
  'climb': 'movement',
  'fall': 'movement',
  'dive': 'movement',
  'jump': 'movement',
  'crouch': 'movement',
  
  // Combat
  'mobKills': 'combat',
  'damage_dealt': 'combat',
  'damageDealt': 'combat',
  'damage_taken': 'combat',
  'damage_shield': 'combat',
  
  // Survival
  'death': 'survival',
  'deaths': 'survival',
  'time_since_death': 'survival',
  'time_since_sleep': 'survival',
  
  // Building/Mining
  'blocksPlaced': 'building',
  'blocksBroken': 'mining',
  
  // Items
  'drop': 'items',
  'open_container': 'items',
  'itemsDropped': 'items',
  'itemsPickedUp': 'items',
  
  // Crafting
  'itemsCrafted': 'crafting',
};

// Function to categorize stats based on their suffixes/prefixes
const categorizeStatBySuffix = (key: string): string => {
  if (key.endsWith('_mined')) return 'mining';
  if (key.endsWith('_used')) return 'building';
  if (key.endsWith('_crafted')) return 'crafting';
  if (key.endsWith('_killed')) return 'combat';
  if (key.startsWith('killed_by_')) return 'survival';
  if (key.endsWith('_picked_up')) return 'items';
  if (key.endsWith('_dropped')) return 'items';
  if (key.endsWith('_broken')) return 'items';
  
  // Check for specific stat patterns
  if (key.includes('eat_') || key.includes('drink_')) return 'food';
  if (key.includes('ride_') || key.includes('boat') || key.includes('horse')) return 'exploration';
  
  return 'general';
};

// Function to generate readable names for flattened stats
const generateStatName = (key: string): string => {
  // Handle special cases first
  if (STAT_NAME_MAPPING[key]) {
    return STAT_NAME_MAPPING[key];
  }
  
  // Handle suffixed stats
  if (key.endsWith('_mined')) {
    const item = key.replace('_mined', '');
    return `${formatItemName(item)} Mined`;
  }
  if (key.endsWith('_used')) {
    const item = key.replace('_used', '');
    return `${formatItemName(item)} Used`;
  }
  if (key.endsWith('_crafted')) {
    const item = key.replace('_crafted', '');
    return `${formatItemName(item)} Crafted`;
  }
  if (key.endsWith('_killed')) {
    const mob = key.replace('_killed', '');
    return `${formatItemName(mob)} Killed`;
  }
  if (key.startsWith('killed_by_')) {
    const cause = key.replace('killed_by_', '');
    return `Deaths by ${formatItemName(cause)}`;
  }
  if (key.endsWith('_picked_up')) {
    const item = key.replace('_picked_up', '');
    return `${formatItemName(item)} Picked Up`;
  }
  if (key.endsWith('_dropped')) {
    const item = key.replace('_dropped', '');
    return `${formatItemName(item)} Dropped`;
  }
  if (key.endsWith('_broken')) {
    const item = key.replace('_broken', '');
    return `${formatItemName(item)} Broken`;
  }
  
  // Default formatting
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to format item/mob names
const formatItemName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Priority stats that should not be filtered out
export const PRIORITY_STATS = new Set([
  'play_time',
  'playtimeHours',
  'blocksPlaced',
  'blocksBroken',
  'mobKills',
  'deaths',
  'damageDealt',
  'jump',
  'medalPoints',
  'goldMedals',
  'silverMedals',
  'bronzeMedals'
]);

// Stats to exclude (duplicates or low-value stats)
export const EXCLUDED_STATS = new Set([
  'ranks', // This is handled separately
  'play_one_minute', // Prefer play_time
  'time_since_sleep', // Usually not interesting
]);

export const formatStatName = (key: string): string => {
  return generateStatName(key);
};

export const getStatCategory = (key: string): StatCategory => {
  const categoryKey = STAT_CATEGORIES_MAPPING[key] || categorizeStatBySuffix(key);
  return STAT_CATEGORIES[categoryKey];
};

export const shouldIncludeStat = (key: string, value: any): boolean => {
  if (EXCLUDED_STATS.has(key)) return false;
  if (typeof value !== 'number') return false;
  if (value <= 0 && !PRIORITY_STATS.has(key)) return false;
  return true;
};
