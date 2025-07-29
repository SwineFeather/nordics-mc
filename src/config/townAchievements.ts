import { 
  Users, 
  Building2, 
  Crown, 
  Star, 
  Trophy, 
  Award,
  Globe,
  Home,
  Castle,
  Building,
  MapPin,
  Flag
} from 'lucide-react';

// Custom type for town achievements since they use different stats
export interface TownAchievementDefinition {
  id: string;
  name: string;
  description: string;
  stat: string;
  color: string;
  tiers: {
    tier: number;
    name: string;
    description: string;
    threshold: number;
    icon: any;
    points: number;
  }[];
}

export const townAchievements: TownAchievementDefinition[] = [
  {
    id: 'population',
    name: 'Population Growth',
    description: 'Grow your town population',
    stat: 'population',
    color: 'from-green-500 to-emerald-600',
    tiers: [
      { tier: 1, name: 'Small Settlement', description: 'Reach 3 residents', threshold: 3, icon: MapPin, points: 50 },
      { tier: 2, name: 'Growing Community', description: 'Reach 5 residents', threshold: 5, icon: Building, points: 100 },
      { tier: 3, name: 'Thriving Town', description: 'Reach 10 residents', threshold: 10, icon: Building2, points: 150 },
      { tier: 4, name: 'Major City', description: 'Reach 15 residents', threshold: 15, icon: Building2, points: 200 },
      { tier: 5, name: 'Metropolis', description: 'Reach 20 residents', threshold: 20, icon: Castle, points: 250 },
      { tier: 6, name: 'Mega City', description: 'Reach 30 residents', threshold: 30, icon: Crown, points: 300 },
      { tier: 7, name: 'Capital City', description: 'Reach 40 residents', threshold: 40, icon: Star, points: 350 },
      { tier: 8, name: 'Empire Capital', description: 'Reach 50 residents', threshold: 50, icon: Trophy, points: 400 },
    ],
  },
  {
    id: 'nation_member',
    name: 'Nation Member',
    description: 'Join a nation and become part of something greater',
    stat: 'nation_member',
    color: 'from-blue-500 to-purple-600',
    tiers: [
      { tier: 1, name: 'Nation Citizen', description: 'Join a nation', threshold: 1, icon: Globe, points: 100 },
    ],
  },
  {
    id: 'independent_town',
    name: 'Independent Spirit',
    description: 'Maintain independence as a sovereign town',
    stat: 'independent',
    color: 'from-orange-500 to-red-600',
    tiers: [
      { tier: 1, name: 'Independent Town', description: 'Remain independent', threshold: 1, icon: Home, points: 150 },
    ],
  },
  {
    id: 'capital_town',
    name: 'Capital Status',
    description: 'Become the capital of your nation',
    stat: 'capital',
    color: 'from-yellow-500 to-amber-600',
    tiers: [
      { tier: 1, name: 'Nation Capital', description: 'Become a nation capital', threshold: 1, icon: Crown, points: 200 },
    ],
  },
];

// Helper function to get town achievements based on town data
export const getTownAchievements = (town: any) => {
  const achievements: any[] = [];
  
  // Population achievements
  const populationAchievement = townAchievements.find(a => a.id === 'population');
  if (populationAchievement) {
    const population = town.population || 0;
    const highestTier = populationAchievement.tiers
      .filter(tier => population >= tier.threshold)
      .sort((a, b) => b.tier - a.tier)[0];
    
    if (highestTier) {
      achievements.push({
        ...highestTier,
        achievementId: populationAchievement.id,
        achievementName: populationAchievement.name,
        stat: populationAchievement.stat,
        currentValue: population,
        color: populationAchievement.color,
        unlocked: true,
      });
    }
  }
  
  // Nation member achievement
  if (town.nation_id && !town.is_independent) {
    const nationAchievement = townAchievements.find(a => a.id === 'nation_member');
    if (nationAchievement) {
      const tier = nationAchievement.tiers[0];
      achievements.push({
        ...tier,
        achievementId: nationAchievement.id,
        achievementName: nationAchievement.name,
        stat: nationAchievement.stat,
        currentValue: 1,
        color: nationAchievement.color,
        unlocked: true,
      });
    }
  }
  
  // Independent town achievement
  if (town.is_independent) {
    const independentAchievement = townAchievements.find(a => a.id === 'independent_town');
    if (independentAchievement) {
      const tier = independentAchievement.tiers[0];
      achievements.push({
        ...tier,
        achievementId: independentAchievement.id,
        achievementName: independentAchievement.name,
        stat: independentAchievement.stat,
        currentValue: 1,
        color: independentAchievement.color,
        unlocked: true,
      });
    }
  }
  
  // Capital town achievement (if town type contains "Capital")
  if (town.type && town.type.toLowerCase().includes('capital')) {
    const capitalAchievement = townAchievements.find(a => a.id === 'capital_town');
    if (capitalAchievement) {
      const tier = capitalAchievement.tiers[0];
      achievements.push({
        ...tier,
        achievementId: capitalAchievement.id,
        achievementName: capitalAchievement.name,
        stat: capitalAchievement.stat,
        currentValue: 1,
        color: capitalAchievement.color,
        unlocked: true,
      });
    }
  }
  
  return achievements;
}; 