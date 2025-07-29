import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Trophy,
  Medal,
  Pickaxe,
  Sword,
  Clock,
  Activity,
  Target,
  Heart,
  Zap,
  Crown,
  Star,
  Award,
  Sparkles,
  Globe,
  Book,
  Wrench,
  Flame,
  Sun,
  Moon,
  Key,
  Lock,
  Smile,
  Ghost,
  Skull,
  Leaf,
  Rocket,
  Wand2,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Layers,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  Blocks,
  Hammer,
  Shield,
  Bot,
  Utensils,
  FlaskConical,
  Palette,
  Trees,
  Mountain,
  Factory,
  Lightbulb,
  Compass,
  Map,
  Gamepad2,
  Timer,
  Users,
  Building2,
  Car,
  Ship,
  Plane,
  Train,
  Bike,
  Footprints,
  Waves,
  RotateCcw,
  Music,
  Bed,
  Coffee,
  ChefHat,
  Sprout,
  Fish,
  Package,
  Handshake,
  Navigation,
  DoorOpen,
  CloudRain,
  Cloud,
  Wind,
  Earth,
  Store,
  Glasses,
  Feather,
  Bone,
  Shell,
  Gem,
  Diamond,
  Egg
} from 'lucide-react';

interface AllStatisticsModalProps {
  profile: any;
  onClose: () => void;
}

// Simplified stat categories
const SIMPLE_CATEGORIES = [
  { key: 'custom', name: 'Custom', color: 'text-blue-600' },
  { key: 'mined', name: 'Blocks Mined', color: 'text-green-600' },
  { key: 'used', name: 'Blocks Placed', color: 'text-orange-600' },
  { key: 'crafted', name: 'Items Crafted', color: 'text-yellow-600' },
  { key: 'picked_up', name: 'Items Picked Up', color: 'text-purple-600' },
  { key: 'dropped', name: 'Items Dropped', color: 'text-pink-600' },
  { key: 'broken', name: 'Items Broken', color: 'text-red-600' },
  { key: 'killed', name: 'Mobs Killed', color: 'text-indigo-600' },
  { key: 'killed_by', name: 'Killed By', color: 'text-gray-600' },
  { key: 'other', name: 'Other', color: 'text-gray-400' },
];

// Enhanced stat categories that match the actual possible_stats.json structure
const STAT_CATEGORIES = {
  'Mining & Breaking': {
    icon: Pickaxe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Blocks and items mined or broken',
    subcategories: {
      'Building Blocks': {
        icon: Blocks,
        description: 'Basic building materials',
        stats: ['stone', 'dirt', 'cobblestone', 'sand', 'gravel', 'clay', 'grass_block', 'podzol', 'mycelium', 'soul_sand']
      },
      'Wood & Trees': {
        icon: Trees,
        description: 'Wood types and tree materials',
        stats: ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'cherry_log', 'mangrove_log', 'bamboo', 'stripped_oak_log']
      },
      'Ores & Minerals': {
        icon: Diamond,
        description: 'Valuable ores and minerals',
        stats: ['diamond_ore', 'iron_ore', 'gold_ore', 'coal_ore', 'lapis_ore', 'redstone_ore', 'emerald_ore', 'copper_ore', 'ancient_debris', 'deepslate_diamond_ore']
      },
      'Stone Variants': {
        icon: Mountain,
        description: 'Various stone types',
        stats: ['andesite', 'diorite', 'granite', 'deepslate', 'tuff', 'calcite', 'basalt', 'blackstone', 'netherrack', 'end_stone']
      },
      'Decorative Blocks': {
        icon: Palette,
        description: 'Decorative and aesthetic blocks',
        stats: ['glass', 'stained_glass', 'carpet', 'banner', 'painting', 'flower_pot', 'bed', 'sign', 'fence', 'wall']
      },
      'Nether Blocks': {
        icon: Flame,
        description: 'Nether-specific materials',
        stats: ['nether_bricks', 'soul_soil', 'magma_block', 'shroomlight', 'warped_stem', 'crimson_stem', 'nether_wart', 'glowstone', 'quartz_block', 'obsidian']
      }
    }
  },
  'Items Picked Up': {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Items collected and picked up',
    subcategories: {
      'Food & Crops': {
        icon: Utensils,
        description: 'Food items and farmed crops',
        stats: ['wheat', 'carrot', 'potato', 'beetroot', 'pumpkin', 'melon', 'apple', 'bread', 'cooked_beef', 'cooked_porkchop']
      },
      'Materials & Resources': {
        icon: Gem,
        description: 'Raw materials and resources',
        stats: ['iron_ingot', 'gold_ingot', 'diamond', 'emerald', 'lapis_lazuli', 'quartz', 'coal', 'charcoal', 'flint', 'clay_ball']
      },
      'Tools & Equipment': {
        icon: Wrench,
        description: 'Tools and equipment items',
        stats: ['wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'wooden_sword', 'iron_sword', 'diamond_sword', 'bow', 'fishing_rod', 'bucket']
      },
      'Armor & Protection': {
        icon: Shield,
        description: 'Armor and protective items',
        stats: ['leather_helmet', 'iron_helmet', 'diamond_helmet', 'leather_chestplate', 'iron_chestplate', 'diamond_chestplate', 'turtle_helmet', 'elytra']
      },
      'Mob Drops': {
        icon: Skull,
        description: 'Items dropped by mobs',
        stats: ['string', 'spider_eye', 'bone', 'rotten_flesh', 'gunpowder', 'blaze_rod', 'ghast_tear', 'magma_cream', 'ender_pearl', 'slime_ball']
      }
    }
  },
  'Items Used': {
    icon: Handshake,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Items used and consumed',
    subcategories: {
      'Food & Drinks': {
        icon: Coffee,
        description: 'Consumable food and drink items',
        stats: ['bread', 'apple', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cake', 'cookie', 'milk_bucket', 'honey_bottle', 'potion']
      },
      'Building Materials': {
        icon: Building2,
        description: 'Materials used for building',
        stats: ['stone', 'dirt', 'oak_planks', 'birch_planks', 'spruce_planks', 'bricks', 'glass', 'wool', 'carpet', 'concrete']
      },
      'Tools & Weapons': {
        icon: Hammer,
        description: 'Tools and weapons used',
        stats: ['wooden_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'wooden_sword', 'iron_sword', 'diamond_sword', 'bow', 'fishing_rod', 'flint_and_steel', 'shears']
      },
      'Redstone & Automation': {
        icon: Zap,
        description: 'Redstone components and automation',
        stats: ['redstone', 'redstone_torch', 'redstone_block', 'repeater', 'comparator', 'piston', 'sticky_piston', 'dispenser', 'dropper', 'hopper']
      }
    }
  },
  'Items Crafted': {
    icon: Factory,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Items crafted and created',
    subcategories: {
      'Basic Crafting': {
        icon: Factory,
        description: 'Basic crafted items',
        stats: ['crafting_table', 'furnace', 'chest', 'torch', 'ladder', 'sign', 'fence', 'door', 'trapdoor', 'pressure_plate']
      },
      'Advanced Items': {
        icon: Lightbulb,
        description: 'Advanced crafted items',
        stats: ['beacon', 'enchanting_table', 'anvil', 'jukebox', 'note_block', 'dispenser', 'dropper', 'observer', 'target', 'lodestone']
      },
      'Tools & Equipment': {
        icon: Wrench,
        description: 'Crafted tools and equipment',
        stats: ['wooden_pickaxe', 'iron_pickaxe', 'diamond_pickaxe', 'wooden_sword', 'iron_sword', 'diamond_sword', 'bow', 'fishing_rod', 'bucket', 'compass']
      },
      'Decorative Items': {
        icon: Palette,
        description: 'Decorative crafted items',
        stats: ['painting', 'item_frame', 'flower_pot', 'banner', 'bed', 'carpet', 'glass_pane', 'stained_glass_pane', 'iron_bars', 'chain']
      }
    }
  },
  'Mob Interactions': {
    icon: Users,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Interactions with mobs and creatures',
    subcategories: {
      'Hostile Mobs Killed': {
        icon: Skull,
        description: 'Hostile mobs eliminated',
        stats: ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'blaze', 'ghast', 'wither_skeleton', 'piglin', 'hoglin']
      },
      'Passive Mobs Killed': {
        icon: Heart,
        description: 'Passive mobs eliminated',
        stats: ['cow', 'pig', 'sheep', 'chicken', 'rabbit', 'horse', 'donkey', 'llama', 'fox', 'bee']
      },
      'Animals Bred': {
        icon: Users,
        description: 'Animals bred and raised',
        stats: ['cow', 'pig', 'sheep', 'chicken', 'rabbit', 'horse', 'donkey', 'llama', 'fox', 'bee']
      },
      'Mob Spawn Eggs Used': {
        icon: Egg,
        description: 'Spawn eggs used',
        stats: ['cow_spawn_egg', 'pig_spawn_egg', 'sheep_spawn_egg', 'chicken_spawn_egg', 'zombie_spawn_egg', 'skeleton_spawn_egg', 'creeper_spawn_egg', 'enderman_spawn_egg']
      }
    }
  },
  'Movement & Travel': {
    icon: Footprints,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Movement and transportation statistics',
    subcategories: {
      'Distance Traveled': {
        icon: Map,
        description: 'Distance traveled by various means',
        stats: ['walk_one_cm', 'sprint_one_cm', 'crouch_one_cm', 'swim_one_cm', 'fall_one_cm', 'climb_one_cm', 'fly_one_cm', 'aviate_one_cm']
      },
      'Vehicle Travel': {
        icon: Car,
        description: 'Travel using vehicles',
        stats: ['boat_one_cm', 'horse_one_cm', 'minecart_one_cm', 'pig_one_cm', 'strider_one_cm', 'camel_one_cm']
      },
      'Actions': {
        icon: Activity,
        description: 'Movement-related actions',
        stats: ['jump', 'swim_one_cm', 'fall_one_cm', 'climb_one_cm', 'sprint_one_cm', 'crouch_one_cm']
      }
    }
  },
  'Time & Activity': {
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Time-based statistics and activity tracking',
    subcategories: {
      'Playtime': {
        icon: Timer,
        description: 'Time spent playing',
        stats: ['play_one_minute', 'total_world_time', 'time_since_death', 'time_since_rest', 'custom_minecraft_play_time']
      },
      'Interactions': {
        icon: Handshake,
        description: 'Various interactions and activities',
        stats: ['interact_with_crafting_table', 'interact_with_furnace', 'interact_with_anvil', 'interact_with_grindstone', 'interact_with_lectern']
      },
      'Actions': {
        icon: Activity,
        description: 'General actions and activities',
        stats: ['jump', 'drop', 'use_item', 'break_item', 'craft_item', 'enchant_item', 'repair_item']
      }
    }
  },
  'Special Categories': {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Special and unique statistics',
    subcategories: {
      'Advancements': {
        icon: Trophy,
        description: 'Advancement progress',
        stats: ['adventure/trade_at_world_height', 'husbandry/allay_deliver_to_note_block', 'nether/all_effects', 'adventure/very_very_frightening']
      },
      'Unique Items': {
        icon: Gem,
        description: 'Unique and special items',
        stats: ['nether_star', 'dragon_egg', 'elytra', 'totem_of_undying', 'heart_of_the_sea', 'ancient_debris', 'netherite_ingot']
      },
      'Music & Entertainment': {
        icon: Music,
        description: 'Music discs and entertainment items',
        stats: ['music_disc_13', 'music_disc_cat', 'music_disc_blocks', 'music_disc_chirp', 'music_disc_far', 'music_disc_mall', 'music_disc_mellohi', 'music_disc_stal']
      }
    }
  }
};

// Load possible stats from JSON file
const loadPossibleStats = async () => {
  try {
    const response = await fetch('/src/possible_stats.json');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('Failed to load possible_stats.json:', error);
  }
  return {};
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatTime = (hours: number): string => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${Math.floor(hours)}h`;
};

const formatDistance = (cm: number): string => {
  const meters = cm / 100;
  const km = meters / 1000;
  
  if (km >= 1) {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}Mm`; // Megameters
    }
    return `${km.toFixed(1)}km`;
  } else if (meters >= 1) {
    return `${meters.toFixed(1)}m`;
  } else {
    return `${cm.toFixed(0)}cm`;
  }
};

// Canonical stat key mapping function (must match backend logic)
function getFlatStatName(category: string, statName: string): string {
  switch (category) {
    case 'custom':      return statName;
    case 'mined':       return `${statName}_mined`;
    case 'used':        return `${statName}_used`;
    case 'crafted':     return `${statName}_crafted`;
    case 'killed':      return `${statName}_killed`;
    case 'killed_by':   return `killed_by_${statName}`;
    case 'picked_up':   return `${statName}_picked_up`;
    case 'dropped':     return `${statName}_dropped`;
    case 'broken':      return `${statName}_broken`;
    default:            return `${category}_${statName}`;
  }
}

const AllStatisticsModal: React.FC<AllStatisticsModalProps> = ({ profile, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [possibleStats, setPossibleStats] = useState<any>({});

  const stats = profile.stats || {};
  
  // Load possible stats on component mount
  useEffect(() => {
    loadPossibleStats().then(setPossibleStats);
  }, []);

  // Move getSimpleStatCategory inside the component to access possibleStats
  function getSimpleStatCategory(statKey: string): string {
    if (statKey.endsWith('_mined')) return 'mined';
    if (statKey.endsWith('_used')) return 'used';
    if (statKey.endsWith('_crafted')) return 'crafted';
    if (statKey.endsWith('_picked_up')) return 'picked_up';
    if (statKey.endsWith('_dropped')) return 'dropped';
    if (statKey.endsWith('_broken')) return 'broken';
    if (statKey.endsWith('_killed')) return 'killed';
    if (statKey.startsWith('killed_by_')) return 'killed_by';
    if (possibleStats?.custom && statKey in possibleStats.custom) return 'custom';
    return 'other';
  }

  // Get ALL stats including possible stats with zero values, using canonical mapping
  const allStats = useMemo(() => {
    const statsArray: Array<{
      key: string;
      value: number;
      displayName: string;
      category: string;
      isPossibleStat: boolean;
    }> = [];

    // Add all possible stats using canonical mapping
    Object.entries(possibleStats).forEach(([category, categoryStats]) => {
      if (typeof categoryStats === 'object' && categoryStats !== null) {
        Object.entries(categoryStats).forEach(([statName, _]) => {
          const flatKey = getFlatStatName(category, statName);
          const value = typeof stats[flatKey] === 'number' ? stats[flatKey] : 0;
          const simpleCategory = getSimpleStatCategory(flatKey);
          statsArray.push({
            key: flatKey,
            value,
            displayName: formatStatName(flatKey),
            category: simpleCategory,
            isPossibleStat: true
          });
        });
      }
    });

    // Add any extra stats present in the player stats but not in possible_stats.json
    Object.entries(stats).forEach(([key, value]) => {
      if (typeof value === 'number' && !statsArray.find(s => s.key === key)) {
        const simpleCategory = getSimpleStatCategory(key);
        statsArray.push({
          key,
          value: value as number,
          displayName: formatStatName(key),
          category: simpleCategory,
          isPossibleStat: false
        });
      }
    });

    return statsArray
      .filter(stat => 
        !searchTerm || 
        stat.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.key.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(stat => !selectedCategory || stat.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === 'value') {
          return sortOrder === 'desc' ? b.value - a.value : a.value - b.value;
        } else {
          return sortOrder === 'desc' 
            ? b.displayName.localeCompare(a.displayName)
            : a.displayName.localeCompare(b.displayName);
        }
      });
  }, [stats, possibleStats, searchTerm, sortBy, sortOrder, selectedCategory]);

  // Group stats by simple category
  const statsByCategory = useMemo(() => {
    const grouped: Record<string, typeof allStats> = {};
    allStats.forEach(stat => {
      if (!grouped[stat.category]) grouped[stat.category] = [];
      grouped[stat.category].push(stat);
    });
    return grouped;
  }, [allStats]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  function formatStatName(statKey: string): string {
    return statKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\b(Cm|Km|M|Mm)\b/g, (match) => match.toUpperCase());
  }

  function formatStatValue(key: string, value: number): string {
    // Distance statistics (convert from cm to km)
    if (key.includes('_cm') || 
        key === 'jump' || 
        key === 'walk' || 
        key === 'sprint' || 
        key === 'crouch' || 
        key === 'fly' || 
        key === 'swim' || 
        key === 'fall' || 
        key === 'climb' || 
        key === 'boat' || 
        key === 'horse' || 
        key === 'minecart' || 
        key === 'pig' || 
        key === 'ride' || 
        key === 'dive' || 
        key === 'walkOnWater' || 
        key === 'aviate' ||
        key === 'rideHorse' ||
        key === 'rideBoat' ||
        key === 'rideMinecart' ||
        key === 'ridePig' ||
        key === 'rideStrider') {
      return formatDistance(value);
    }
    
    // Time statistics (convert from ticks to hours)
    if (key.includes('time_') || key.includes('_time') || key === 'play_time' || key === 'sneak_time' || key === 'total_world_time' || key === 'playtimeHours' || key === 'survivalStreak') {
      return formatTime(value / 3600); // Convert ticks to hours
    }
    
    // Default number formatting
    return formatNumber(value);
  }

  // Category counts for filter buttons
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allStats.forEach(stat => {
      counts[stat.category] = (counts[stat.category] || 0) + 1;
    });
    return counts;
  }, [allStats]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/64`} />
              <AvatarFallback className="text-sm">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.displayName || profile.username}</h2>
              <p className="text-muted-foreground">All Statistics ({allStats.length} total)</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search statistics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'value' ? 'name' : 'value')}
            >
              {sortBy === 'value' ? <BarChart3 className="w-4 h-4 mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
              Sort by {sortBy === 'value' ? 'Value' : 'Name'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
              {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (expandedCategories.size === SIMPLE_CATEGORIES.length) {
                  setExpandedCategories(new Set());
                } else {
                  setExpandedCategories(new Set(SIMPLE_CATEGORIES.map(c => c.key)));
                }
              }}
            >
              {expandedCategories.size === SIMPLE_CATEGORIES.length ? (
                <ChevronRight className="w-4 h-4 mr-2" />
                ) : (
                <ChevronDown className="w-4 h-4 mr-2" />
              )}
              {expandedCategories.size === SIMPLE_CATEGORIES.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>

          {/* Category Filters */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Filter by Category:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                All Categories
              </Button>
              {SIMPLE_CATEGORIES.map(({ key, name, color }) => {
                const count = categoryCounts[key] || 0;
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center gap-2"
                  >
                    <Star className={`w-4 h-4 ${color}`} />
                    {name} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistics by Category */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {allStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No statistics found matching your search.' : 'No statistics available.'}
            </div>
          ) : (
            <div className="space-y-4">
              {SIMPLE_CATEGORIES.filter(cat => statsByCategory[cat.key] && statsByCategory[cat.key].length > 0).map(({ key, name, color }) => {
                const isExpanded = expandedCategories.has(key);
                return (
                  <Collapsible
                    key={key}
                    open={isExpanded}
                    onOpenChange={() => {
                      const newExpanded = new Set(expandedCategories);
                      if (newExpanded.has(key)) newExpanded.delete(key);
                      else newExpanded.add(key);
                      setExpandedCategories(newExpanded);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Star className={`w-5 h-5 ${color}`} />
                          <div className="font-medium">{name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {statsByCategory[key].length} stats
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
                        {statsByCategory[key].map((stat) => (
                          <Card key={stat.key} className={`hover:shadow-md transition-shadow ${stat.isPossibleStat && stat.value === 0 ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className={`w-4 h-4 ${color}`} />
                                    <h3 className="font-medium text-sm truncate" title={stat.displayName}>
                                      {stat.displayName}
                                    </h3>
                                    {stat.isPossibleStat && stat.value === 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        Zero
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-2xl font-bold text-primary">
                                    {formatStatValue(stat.key, stat.value)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {allStats.length} total statistics
              {Object.keys(statsByCategory).length > 0 && (
                <span className="ml-2">
                  across {Object.keys(statsByCategory).length} categories
                </span>
              )}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllStatisticsModal; 