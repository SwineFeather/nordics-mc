
// Utility functions for validating and processing player stats

export interface ValidatedStats {
  playtimeHours: number;
  blocksPlaced: number;
  blocksBroken: number;
  deaths: number;
  mobKills: number;
  jumps: number;
  damageDealt: number;
  balance: number;
  medalPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  survivalStreak: number;
  [key: string]: number;
}

export const validateStatValue = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  return 0;
};

export const validateStats = (stats: Record<string, any>): ValidatedStats => {
  const validated: ValidatedStats = {
    playtimeHours: validateStatValue(stats.playtimeHours),
    blocksPlaced: validateStatValue(stats.blocksPlaced),
    blocksBroken: validateStatValue(stats.blocksBroken),
    deaths: validateStatValue(stats.deaths),
    mobKills: validateStatValue(stats.mobKills),
    jumps: validateStatValue(stats.jumps),
    damageDealt: validateStatValue(stats.damageDealt),
    balance: validateStatValue(stats.balance),
    medalPoints: validateStatValue(stats.medalPoints),
    goldMedals: validateStatValue(stats.goldMedals),
    silverMedals: validateStatValue(stats.silverMedals),
    bronzeMedals: validateStatValue(stats.bronzeMedals),
    survivalStreak: validateStatValue(stats.survivalStreak),
  };

  // Add any additional stats from the original stats object
  Object.keys(stats).forEach(key => {
    if (!(key in validated)) {
      validated[key] = validateStatValue(stats[key]);
    }
  });

  return validated;
};

export const formatStatValue = (value: number, type: 'number' | 'time' | 'percentage' = 'number'): string => {
  if (!value || value === 0) return '0';
  
  switch (type) {
    case 'time':
      if (value < 24) return `${Math.round(value)}h`;
      const days = Math.floor(value / 24);
      const hours = Math.round(value % 24);
      return `${days}d ${hours}h`;
    
    case 'percentage':
      return `${Math.round(value * 100)}%`;
    
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
  }
};

export const calculatePlaytime = (ticks: number): number => {
  // Convert ticks to hours: 20 ticks per second, 3600 seconds per hour
  return Math.floor(ticks / 72000);
};

export const calculateSurvivalStreak = (timeSinceDeathTicks: number): number => {
  // Convert ticks to days: 20 ticks per second, 86400 seconds per day
  return Math.floor(timeSinceDeathTicks / (20 * 86400));
};
