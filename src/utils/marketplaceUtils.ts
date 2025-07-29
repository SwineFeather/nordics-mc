// Utility functions for the marketplace

export const getItemImageUrl = (itemType: string): string => {
  // Convert item type to lowercase for the URL
  const itemName = itemType.toLowerCase();
  
  // Base URL for your Supabase storage
  const baseUrl = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/minecraft/item';
  
  return `${baseUrl}/${itemName}.png`;
};

export const getItemIcon = (itemType: string): string => {
  // Fallback emojis for items that might not have images
  const fallbackIcons: { [key: string]: string } = {
    // Ores and Minerals
    'diamond': '💎',
    'iron_ingot': '⚒️',
    'gold_ingot': '🥇',
    'emerald': '💚',
    'coal': '🖤',
    'redstone': '🔴',
    'lapis_lazuli': '🔵',
    'quartz': '⚪',
    'netherite': '🖤',
    
    // Building Materials
    'stone': '🪨',
    'cobblestone': '🪨',
    'dirt': '🟫',
    'sand': '🟨',
    'gravel': '🟫',
    'clay': '🟫',
    'glass': '🪟',
    'wool': '🧶',
    'concrete': '🧱',
    
    // Wood and Plants
    'wood': '🪵',
    'oak_log': '🪵',
    'spruce_log': '🪵',
    'birch_log': '🪵',
    'jungle_log': '🪵',
    'acacia_log': '🪵',
    'dark_oak_log': '🪵',
    'planks': '🪵',
    'leaves': '🍃',
    'sapling': '🌱',
    
    // Food and Agriculture
    'food': '🍖',
    'bread': '🍞',
    'apple': '🍎',
    'carrot': '🥕',
    'potato': '🥔',
    'wheat': '🌾',
    'seeds': '🌱',
    'beef': '🥩',
    'chicken': '🍗',
    'fish': '🐟',
    'milk': '🥛',
    'egg': '🥚',
    
    // Potions and Brewing
    'potion': '🧪',
    'brewing_stand': '🧪',
    'blaze_powder': '🔥',
    'nether_wart': '🌿',
    'spider_eye': '🕷️',
    'fermented_spider_eye': '🕷️',
    'glowstone_dust': '✨',
    'redstone_dust': '🔴',
    
    // Combat and Tools
    'weapon': '⚔️',
    'sword': '⚔️',
    'axe': '🪓',
    'pickaxe': '⛏️',
    'shovel': '🪚',
    'hoe': '🌾',
    'bow': '🏹',
    'arrow': '🏹',
    'armor': '🛡️',
    'helmet': '🪖',
    'chestplate': '🛡️',
    'leggings': '🛡️',
    'boots': '👢',
    'shield': '🛡️',
    
    // Enchanting and Magic
    'book': '📚',
    'enchantment': '✨',
    'experience': '💎',
    'ender_pearl': '🔮',
    'eye_of_ender': '👁️',
    'blaze_rod': '🔥',
    'ghast_tear': '💧',
    
    // Transportation
    'boat': '🚣',
    'minecart': '🚂',
    'rail': '🚂',
    'saddle': '🪑',
    'elytra': '🦋',
    
    // Decoration and Special
    'banner': '🏁',
    'painting': '🖼️',
    'item_frame': '🖼️',
    'flower': '🌸',
    'dye': '🎨',
    'candle': '🕯️',
    'lantern': '🏮',
    
    // Redstone and Technical
    'lever': '⚡',
    'button': '🔘',
    'pressure_plate': '⚡',
    'piston': '🔧',
    'hopper': '🪣',
    'chest': '📦',
    'furnace': '🔥',
    'crafting_table': '🛠️',
    'anvil': '🔨',
    
    // Nether and End
    'end': '🌌',
    'obsidian': '🖤',
    'crying_obsidian': '💧',
    'end_stone': '🌌',
    'purpur': '🟣',
    
    // Default fallbacks
    'block': '🧱',
    'item': '📦',
    'tool': '🔧',
    'material': '📦'
  };

  const item = itemType.toLowerCase();
  
  // Check for exact matches first
  if (fallbackIcons[item]) return fallbackIcons[item];
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(fallbackIcons)) {
    if (item.includes(key)) return icon;
  }
  
  // Check for common patterns
  if (item.includes('_block')) return '🧱';
  if (item.includes('_ore')) return '⛏️';
  if (item.includes('_ingot')) return '⚒️';
  if (item.includes('_nugget')) return '⚒️';
  if (item.includes('_gem')) return '💎';
  if (item.includes('_crystal')) return '💎';
  if (item.includes('_shard')) return '💎';
  if (item.includes('_fragment')) return '💎';
  if (item.includes('_dust')) return '✨';
  if (item.includes('_powder')) return '✨';
  if (item.includes('_essence')) return '✨';
  if (item.includes('_core')) return '💎';
  if (item.includes('_pearl')) return '🔮';
  if (item.includes('_eye')) return '👁️';
  if (item.includes('_rod')) return '🔥';
  if (item.includes('_tear')) return '💧';
  if (item.includes('_wing')) return '🦋';
  if (item.includes('_feather')) return '🪶';
  if (item.includes('_bone')) return '🦴';
  if (item.includes('_string')) return '🧵';
  if (item.includes('_leather')) return '🟫';
  if (item.includes('_wool')) return '🧶';
  if (item.includes('_carpet')) return '🟫';
  if (item.includes('_bed')) return '🛏️';
  if (item.includes('_door')) return '🚪';
  if (item.includes('_trapdoor')) return '🚪';
  if (item.includes('_fence')) return '🚧';
  if (item.includes('_gate')) return '🚪';
  if (item.includes('_wall')) return '🧱';
  if (item.includes('_stairs')) return '📐';
  if (item.includes('_slab')) return '📏';
  if (item.includes('_button')) return '🔘';
  if (item.includes('_pressure_plate')) return '⚡';
  if (item.includes('_lever')) return '⚡';
  if (item.includes('_switch')) return '⚡';
  if (item.includes('_sensor')) return '📡';
  if (item.includes('_detector')) return '📡';
  if (item.includes('_observer')) return '👁️';
  if (item.includes('_comparator')) return '⚖️';
  if (item.includes('_repeater')) return '🔁';
  if (item.includes('_torch')) return '🔥';
  if (item.includes('_lantern')) return '🏮';
  if (item.includes('_candle')) return '🕯️';
  if (item.includes('_lamp')) return '💡';
  if (item.includes('_light')) return '💡';
  if (item.includes('_glow')) return '✨';
  if (item.includes('_shiny')) return '✨';
  if (item.includes('_bright')) return '✨';
  if (item.includes('_luminous')) return '✨';
  if (item.includes('_radiant')) return '✨';
  if (item.includes('_brilliant')) return '✨';
  if (item.includes('_sparkling')) return '✨';
  if (item.includes('_twinkling')) return '✨';
  if (item.includes('_shimmering')) return '✨';
  if (item.includes('_glimmering')) return '✨';
  if (item.includes('_scintillating')) return '✨';
  if (item.includes('_iridescent')) return '🌈';
  if (item.includes('_prismatic')) return '🌈';
  if (item.includes('_chromatic')) return '🌈';
  if (item.includes('_spectral')) return '👻';
  if (item.includes('_ethereal')) return '👻';
  if (item.includes('_mystical')) return '🔮';
  if (item.includes('_magical')) return '🔮';
  if (item.includes('_enchanted')) return '✨';
  if (item.includes('_cursed')) return '👻';
  if (item.includes('_blessed')) return '🙏';
  if (item.includes('_holy')) return '🙏';
  if (item.includes('_divine')) return '🙏';
  if (item.includes('_sacred')) return '🙏';
  if (item.includes('_celestial')) return '⭐';
  if (item.includes('_cosmic')) return '🌌';
  if (item.includes('_stellar')) return '⭐';
  if (item.includes('_lunar')) return '🌙';
  if (item.includes('_solar')) return '☀️';
  if (item.includes('_nebular')) return '🌌';
  if (item.includes('_galactic')) return '🌌';
  if (item.includes('_universal')) return '🌌';
  if (item.includes('_infinite')) return '♾️';
  if (item.includes('_eternal')) return '♾️';
  if (item.includes('_timeless')) return '♾️';
  if (item.includes('_immortal')) return '♾️';
  if (item.includes('_legendary')) return '👑';
  if (item.includes('_mythical')) return '🐉';
  if (item.includes('_epic')) return '⚡';
  if (item.includes('_rare')) return '💎';
  if (item.includes('_uncommon')) return '🟢';
  if (item.includes('_common')) return '⚪';
  if (item.includes('_basic')) return '⚪';
  if (item.includes('_simple')) return '⚪';
  if (item.includes('_standard')) return '⚪';
  if (item.includes('_normal')) return '⚪';
  if (item.includes('_regular')) return '⚪';
  if (item.includes('_ordinary')) return '⚪';
  if (item.includes('_plain')) return '⚪';
  if (item.includes('_vanilla')) return '🍦';
  if (item.includes('_default')) return '⚪';
  if (item.includes('_generic')) return '📦';
  
  return '📦'; // Default fallback
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const formatLastUpdated = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const getTypeColor = (type: 'buy' | 'sell'): string => {
  return type === 'buy' ? 'bg-green-500' : 'bg-blue-500';
};

export const getTypeIcon = (type: 'buy' | 'sell') => {
  return type === 'buy' ? '📥' : '📤';
};

export const getStockDisplay = (stock: number, unlimited: boolean): string => {
  if (unlimited) return '∞';
  return stock.toString();
};

export const getStockColor = (stock: number, unlimited: boolean): string => {
  if (unlimited) return 'text-green-600';
  if (stock === 0) return 'text-red-600';
  if (stock < 10) return 'text-orange-600';
  return 'text-green-600';
};

export const formatCoordinates = (x: number, y: number, z: number): string => {
  return `${x}, ${y}, ${z}`;
};

export const getWorldDisplayName = (world: string): string => {
  const worldNames: { [key: string]: string } = {
    'world': 'Overworld',
    'world_nether': 'Nether',
    'world_the_end': 'The End',
    'nether': 'Nether',
    'end': 'The End',
    'overworld': 'Overworld',
    'the_end': 'The End'
  };
  
  return worldNames[world.toLowerCase()] || world;
};

export const getItemDisplayName = (itemType: string, displayName: string | null): string => {
  if (displayName) {
    // If display_name exists, capitalize first letter and make rest lowercase
    return displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
  }
  
  // Convert item_type to readable format
  return itemType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 