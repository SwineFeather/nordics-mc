
import { 
  Clock, Hammer, Pickaxe, Swords, Trophy, 
  Coins, Mountain, Zap, Footprints, Ship, Award,
  TreePine, Sprout
} from 'lucide-react';
import type { AchievementDefinition } from '@/types/achievements';

export const achievements: AchievementDefinition[] = [
  {
    id: 'playtime',
    name: 'Time Lord',
    description: 'Accumulate playtime on the server',
    stat: 'custom_minecraft_play_time', // Fixed: was custom_minecraft_playtime
    color: 'from-blue-500 to-purple-600',
    tiers: [
      { tier: 1, name: 'Newcomer', description: 'Play for 1 hour', threshold: 1, icon: Clock, points: 50 },
      { tier: 2, name: 'Regular', description: 'Play for 10 hours', threshold: 10, icon: Clock, points: 100 },
      { tier: 3, name: 'Dedicated', description: 'Play for 50 hours', threshold: 50, icon: Clock, points: 150 },
      { tier: 4, name: 'Veteran', description: 'Play for 100 hours', threshold: 100, icon: Clock, points: 200 },
      { tier: 5, name: 'Time Lord', description: 'Play for 500 hours', threshold: 500, icon: Clock, points: 250 },
    ],
  },
  {
    id: 'blocks_placed',
    name: 'Master Builder',
    description: 'Place blocks to build amazing structures',
    stat: 'blocksPlaced',
    color: 'from-green-500 to-emerald-600',
    tiers: [
      { tier: 1, name: 'Builder', description: 'Place 1,000 blocks', threshold: 1000, icon: Hammer, points: 50 },
      { tier: 2, name: 'Constructor', description: 'Place 5,000 blocks', threshold: 5000, icon: Hammer, points: 100 },
      { tier: 3, name: 'Engineer', description: 'Place 25,000 blocks', threshold: 25000, icon: Hammer, points: 150 },
      { tier: 4, name: 'Master Builder', description: 'Place 100,000 blocks', threshold: 100000, icon: Hammer, points: 200 },
      { tier: 5, name: 'Architect', description: 'Place 500,000 blocks', threshold: 500000, icon: Hammer, points: 250 },
    ],
  },
  {
    id: 'blocks_broken',
    name: 'Excavator',
    description: 'Break blocks to gather resources',
    stat: 'blocksBroken',
    color: 'from-yellow-500 to-orange-600',
    tiers: [
      { tier: 1, name: 'Digger', description: 'Break 1,000 blocks', threshold: 1000, icon: Pickaxe, points: 50 },
      { tier: 2, name: 'Miner', description: 'Break 5,000 blocks', threshold: 5000, icon: Pickaxe, points: 100 },
      { tier: 3, name: 'Quarryman', description: 'Break 25,000 blocks', threshold: 25000, icon: Pickaxe, points: 150 },
      { tier: 4, name: 'Strip Miner', description: 'Break 100,000 blocks', threshold: 100000, icon: Pickaxe, points: 200 },
      { tier: 5, name: 'Excavator', description: 'Break 500,000 blocks', threshold: 500000, icon: Pickaxe, points: 250 },
    ],
  },
  {
    id: 'mob_kills',
    name: 'Monster Hunter',
    description: 'Defeat hostile mobs and creatures',
    stat: 'mobKills',
    color: 'from-purple-500 to-indigo-600',
    tiers: [
      { tier: 1, name: 'Hunter', description: 'Kill 100 mobs', threshold: 100, icon: Swords, points: 50 },
      { tier: 2, name: 'Warrior', description: 'Kill 500 mobs', threshold: 500, icon: Swords, points: 100 },
      { tier: 3, name: 'Champion', description: 'Kill 2,500 mobs', threshold: 2500, icon: Swords, points: 150 },
      { tier: 4, name: 'Gladiator', description: 'Kill 10,000 mobs', threshold: 10000, icon: Swords, points: 200 },
      { tier: 5, name: 'Slayer', description: 'Kill 50,000 mobs', threshold: 50000, icon: Swords, points: 250 },
    ],
  },
  {
    id: 'boat_captain',
    name: 'Boat Captain',
    description: 'Navigate the seas and waterways',
    stat: 'ride_boat',
    color: 'from-cyan-500 to-blue-600',
    tiers: [
      { tier: 1, name: 'Sailor', description: 'Ride a boat for 1km', threshold: 1000, icon: Ship, points: 50 },
      { tier: 2, name: 'Navigator', description: 'Ride a boat for 5km', threshold: 5000, icon: Ship, points: 100 },
      { tier: 3, name: 'Seafarer', description: 'Ride a boat for 25km', threshold: 25000, icon: Ship, points: 150 },
      { tier: 4, name: 'Admiral', description: 'Ride a boat for 100km', threshold: 100000, icon: Ship, points: 200 },
      { tier: 5, name: 'Boat Captain', description: 'Ride a boat for 500km', threshold: 500000, icon: Ship, points: 250 },
    ],
  },
  {
    id: 'wood_cutter',
    name: 'Wood Cutter',
    description: 'Harvest wood from trees',
    stat: 'mine_wood',
    color: 'from-amber-600 to-yellow-700',
    tiers: [
      { tier: 1, name: 'Lumberjack', description: 'Cut 100 oak logs', threshold: 100, icon: TreePine, points: 50 },
      { tier: 2, name: 'Forester', description: 'Cut 500 oak logs', threshold: 500, icon: TreePine, points: 100 },
      { tier: 3, name: 'Tree Feller', description: 'Cut 2,500 oak logs', threshold: 2500, icon: TreePine, points: 150 },
      { tier: 4, name: 'Master Logger', description: 'Cut 10,000 oak logs', threshold: 10000, icon: TreePine, points: 200 },
      { tier: 5, name: 'Wood Cutter', description: 'Cut 25,000 oak logs', threshold: 25000, icon: TreePine, points: 250 },
    ],
  },
  {
    id: 'balance',
    name: 'Financier',
    description: 'Accumulate wealth and riches',
    stat: 'balance',
    color: 'from-yellow-500 to-amber-600',
    tiers: [
      { tier: 1, name: 'Saver', description: 'Have 10,000 coins', threshold: 10000, icon: Coins, points: 10 },
      { tier: 2, name: 'Investor', description: 'Have 50,000 coins', threshold: 50000, icon: Coins, points: 20 },
      { tier: 3, name: 'Wealthy', description: 'Have 250,000 coins', threshold: 250000, icon: Coins, points: 30 },
      { tier: 4, name: 'Rich', description: 'Have 1,000,000 coins', threshold: 1000000, icon: Coins, points: 40 },
      { tier: 5, name: 'Financier', description: 'Have 5,000,000 coins', threshold: 5000000, icon: Coins, points: 50 },
    ],
  },
  {
    id: 'diamond_miner',
    name: 'Diamond Miner',
    description: 'Mine diamond ore blocks',
    stat: 'mine_diamond_ore',
    color: 'from-blue-400 to-cyan-600',
    tiers: [
      { tier: 1, name: 'Shiny Finder', description: 'Mine 1 diamond ore', threshold: 1, icon: Mountain, points: 100 },
      { tier: 2, name: 'Gem Seeker', description: 'Mine 10 diamond ore', threshold: 10, icon: Mountain, points: 200 },
      { tier: 3, name: 'Treasure Hunter', description: 'Mine 50 diamond ore', threshold: 50, icon: Mountain, points: 300 },
      { tier: 4, name: 'Deep Delver', description: 'Mine 200 diamond ore', threshold: 200, icon: Mountain, points: 400 },
      { tier: 5, name: 'Diamond King', description: 'Mine 1000 diamond ore', threshold: 1000, icon: Mountain, points: 500 },
    ],
  },
  {
    id: 'wheat_farmer',
    name: 'Wheat Farmer',
    description: 'Harvest wheat crops',
    stat: 'mined.wheat',
    color: 'from-yellow-400 to-green-500',
    tiers: [
      { tier: 1, name: 'Harvester', description: 'Harvest 100 wheat', threshold: 100, icon: Sprout, points: 50 },
      { tier: 2, name: 'Field Worker', description: 'Harvest 500 wheat', threshold: 500, icon: Sprout, points: 100 },
      { tier: 3, name: 'Crop Master', description: 'Harvest 2,500 wheat', threshold: 2500, icon: Sprout, points: 150 },
      { tier: 4, name: 'Golden Farmer', description: 'Harvest 10,000 wheat', threshold: 10000, icon: Sprout, points: 200 },
      { tier: 5, name: 'Wheat Baron', description: 'Harvest 50,000 wheat', threshold: 50000, icon: Sprout, points: 250 },
    ],
  },
];
