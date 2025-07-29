
import React from 'react';
import { 
  Clock, Pickaxe, Target, Sword, Heart, Trophy, 
  Zap, Diamond, Hammer, Ship, TreePine, 
  Award, BarChart3, Shield, Gem, Skull
} from 'lucide-react';

export const getStatIcon = (statKey: string, className: string = "w-4 h-4") => {
  const iconMap: Record<string, React.ReactNode> = {
    // Time and social
    playtimeHours: <Clock className={className} />,
    medalPoints: <Trophy className={className} />,
    
    // Building
    blocksPlaced: <Pickaxe className={className} />,
    blocksBroken: <Target className={className} />,
    use_dirt: <Pickaxe className={className} />,
    mine_ground: <Target className={className} />,
    mine_wood: <TreePine className={className} />,
    use_hoe: <Hammer className={className} />,
    
    // Combat
    mobKills: <Sword className={className} />,
    damageDealt: <Sword className={className} />,
    kill_any: <Skull className={className} />,
    damage_dealt: <Zap className={className} />,
    
    // Survival
    deaths: <Heart className={className} />,
    mine_diamond_ore: <Diamond className={className} />,
    
    // Movement/Exploration
    jumps: <Zap className={className} />,
    sprint: <Zap className={className} />,
    ride_boat: <Ship className={className} />,
    
    // Medals
    goldMedals: <Award className={`${className} text-yellow-500`} />,
    silverMedals: <Award className={`${className} text-gray-400`} />,
    bronzeMedals: <Award className={`${className} text-yellow-600`} />,
  };

  return iconMap[statKey] || <BarChart3 className={className} />;
};
