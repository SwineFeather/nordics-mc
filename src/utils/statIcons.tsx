
import React from 'react';
import { 
  Clock, Pickaxe, Target, Sword, Heart, Trophy, 
  Zap, Diamond, Hammer, Ship, TreePine, 
  Award, BarChart3, Shield, Gem, Skull,
  Building, Mountain, Footprints, Apple,
  Compass, Package, Wrench, Fish, Beef,
  Carrot, Cookie, Milk, BedDouble, Car,
  MinusCircle, PlusCircle, Coins,
  Medal, Crown, MapPin, Binoculars
} from 'lucide-react';

export const getCategoryIcon = (categoryKey: string, className: string = "w-4 h-4") => {
  const iconMap: Record<string, React.ReactNode> = {
    general: <BarChart3 className={className} />,
    building: <Building className={className} />,
    mining: <Mountain className={className} />,
    combat: <Sword className={className} />,
    movement: <Footprints className={className} />,
    items: <Package className={className} />,
    crafting: <Wrench className={className} />,
    survival: <Heart className={className} />,
    food: <Apple className={className} />,
    exploration: <Compass className={className} />
  };

  return iconMap[categoryKey] || <BarChart3 className={className} />;
};

export const getStatIcon = (statKey: string, className: string = "w-4 h-4") => {
  // More specific icon mapping based on stat content
  const iconMap: Record<string, React.ReactNode> = {
    // Time and general
    'custom_minecraft_play_time': <Clock className={className} />,
    'playtimeHours': <Clock className={className} />,
    'play_one_minute': <Clock className={className} />,
    'play': <Clock className={className} />,
    'time_since_death': <Clock className={className} />,
    'time_since_sleep': <Clock className={className} />,
    
    // Movement
    'walk': <Footprints className={className} />,
    'sprint': <Zap className={className} />,
    'swim': <Ship className={className} />,
    'aviate': <Zap className={className} />,
    'climb': <Mountain className={className} />,
    'fall': <MinusCircle className={className} />,
    'dive': <Ship className={className} />,
    'jump': <Zap className={className} />,
    'crouch': <MinusCircle className={className} />,
    
    // Combat
    'kill_any': <Skull className={className} />,
    'mobKills': <Skull className={className} />,
    'damage_dealt': <Sword className={className} />,
    'damageDealt': <Sword className={className} />,
    'damage_taken': <Shield className={className} />,
    'damage_shield': <Shield className={className} />,
    
    // Deaths
    'death': <Heart className={className} />,
    'deaths': <Heart className={className} />,
    'killed_by_creeper': <Heart className={className} />,
    'killed_by_warden': <Heart className={className} />,
    
    // Building
    'use_dirt': <Pickaxe className={className} />,
    'blocksPlaced': <Building className={className} />,
    'place_torch': <Zap className={className} />,
    'place_stairs': <Building className={className} />,
    'place_wall': <Building className={className} />,
    'place_cactus': <TreePine className={className} />,
    'place_glass': <Building className={className} />,
    'place_rails': <Car className={className} />,
    'place_sign': <Building className={className} />,
    'place_banner': <Building className={className} />,
    'place_scaffolding': <Building className={className} />,
    'place_lantern': <Zap className={className} />,
    'place_candle': <Zap className={className} />,
    'place_sapling': <TreePine className={className} />,
    
    // Mining
    'mine_ground': <Pickaxe className={className} />,
    'mine_stone': <Mountain className={className} />,
    'mine_wood': <TreePine className={className} />,
    'mine_coal_ore': <Mountain className={className} />,
    'mine_iron_ore': <Mountain className={className} />,
    'mine_gold_ore': <Coins className={className} />,
    'mine_diamond_ore': <Diamond className={className} />,
    'mine_emerald_ore': <Gem className={className} />,
    'mine_redstone_ore': <Zap className={className} />,
    'mine_lapis_ore': <Gem className={className} />,
    'mine_copper_ore': <Mountain className={className} />,
    'mine_ancient_debris': <Diamond className={className} />,
    'mine_nether_quartz_ore': <Gem className={className} />,
    'blocksBroken': <Target className={className} />,
    
    // Items
    'drop': <MinusCircle className={className} />,
    'open_container': <Package className={className} />,
    'itemsDropped': <MinusCircle className={className} />,
    'itemsPickedUp': <PlusCircle className={className} />,
    'use_bow': <Target className={className} />,
    'use_crossbow': <Target className={className} />,
    'use_shears': <Wrench className={className} />,
    'use_flint': <Zap className={className} />,
    'use_hoe': <Hammer className={className} />,
    'break_tools': <Wrench className={className} />,
    'use_fireworks': <Zap className={className} />,
    'use_potion': <Package className={className} />,
    'use_egg': <Package className={className} />,
    'use_water_bucket': <Package className={className} />,
    'use_lava_bucket': <Package className={className} />,
    
    // Crafting
    'itemsCrafted': <Wrench className={className} />,
    'craft_bread': <Wrench className={className} />,
    'craft_tools': <Wrench className={className} />,
    'craft_armor': <Shield className={className} />,
    'craft_sword': <Sword className={className} />,
    'craft_compass': <Compass className={className} />,
    'craft_clock': <Clock className={className} />,
    'craft_paper': <Wrench className={className} />,
    'craft_bookshelf': <Wrench className={className} />,
    'enchant': <Gem className={className} />,
    
    // Food
    'eat_meat': <Beef className={className} />,
    'eat_fish': <Fish className={className} />,
    'eat_veggie': <Carrot className={className} />,
    'eat_cookie': <Cookie className={className} />,
    'eat_soup': <Apple className={className} />,
    'eat_rawmeat': <Beef className={className} />,
    'eat_junkfood': <Cookie className={className} />,
    'drink_milk': <Milk className={className} />,
    
    // Transportation & Exploration
    'ride_horse': <Car className={className} />,
    'ride_pig': <Car className={className} />,
    'ride_boat': <Ship className={className} />,
    'ride_minecart': <Car className={className} />,
    'ride_strider': <Car className={className} />,
    'biomes': <MapPin className={className} />,
    'sleep': <BedDouble className={className} />,
    'breed': <Heart className={className} />,
    'trade': <Coins className={className} />,
    
    // Medals
    'medalPoints': <Trophy className={className} />,
    'goldMedals': <Crown className={`${className} text-yellow-500`} />,
    'silverMedals': <Medal className={`${className} text-gray-400`} />,
    'bronzeMedals': <Award className={`${className} text-yellow-600`} />,
    
    // Economy
    'balance': <Coins className={className} />
  };

  return iconMap[statKey] || <BarChart3 className={className} />;
};
