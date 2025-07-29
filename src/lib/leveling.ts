
import { supabase } from '@/integrations/supabase/client';

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  title?: string;
  description?: string;
  color?: string;
}

// Calculate level info from total XP using database function
export const calculateLevelInfo = async (totalXp: number): Promise<LevelInfo> => {
  try {
    const { data, error } = await supabase.rpc('calculate_level_from_xp', {
      player_xp: totalXp
    });

    if (error) {
      console.error('Error calculating level from XP:', error);
      // Fallback to basic calculation
      return calculateLevelInfoSync(totalXp);
    }

    if (!data || data.length === 0) {
      return calculateLevelInfoSync(totalXp);
    }

    const levelData = data[0];
    
    // Get level definition from database for additional info
    const { data: levelDef } = await supabase
      .from('level_definitions')
      .select('title, description, color')
      .eq('level', levelData.level)
      .single();

    return {
      level: levelData.level,
      totalXp: totalXp,
      xpInCurrentLevel: levelData.xp_in_current_level,
      xpForNextLevel: levelData.xp_for_next_level,
      progress: levelData.progress,
      title: levelDef?.title || `Level ${levelData.level}`,
      description: levelDef?.description || 'Current level',
      color: levelDef?.color || '#3b82f6'
    };
  } catch (error) {
    console.error('Error in calculateLevelInfo:', error);
    return calculateLevelInfoSync(totalXp);
  }
};

// Synchronous version for when we can't use the database function
export const calculateLevelInfoSync = (totalXp: number): LevelInfo => {
  // Basic level calculation based on XP thresholds
  const levels = [
    { level: 1, xpRequired: 0, title: 'Newcomer', description: 'Welcome to the server!', color: '#6b7280' },
    { level: 2, xpRequired: 100, title: 'Novice', description: 'Getting started', color: '#10b981' },
    { level: 3, xpRequired: 250, title: 'Apprentice', description: 'Learning the ropes', color: '#3b82f6' },
    { level: 4, xpRequired: 500, title: 'Journeyman', description: 'Making progress', color: '#8b5cf6' },
    { level: 5, xpRequired: 1000, title: 'Adventurer', description: 'Exploring the world', color: '#f59e0b' },
    { level: 6, xpRequired: 1750, title: 'Explorer', description: 'Discovering new places', color: '#06b6d4' },
    { level: 7, xpRequired: 2750, title: 'Veteran', description: 'Experienced player', color: '#84cc16' },
    { level: 8, xpRequired: 4000, title: 'Expert', description: 'Skilled and knowledgeable', color: '#f97316' },
    { level: 9, xpRequired: 6000, title: 'Master', description: 'Mastered the game', color: '#ef4444' },
    { level: 10, xpRequired: 8500, title: 'Champion', description: 'Elite player', color: '#a855f7' },
    { level: 11, xpRequired: 12000, title: 'Legend', description: 'Legendary status', color: '#dc2626' },
    { level: 12, xpRequired: 16500, title: 'Mythic', description: 'Mythical prowess', color: '#9333ea' },
    { level: 13, xpRequired: 22500, title: 'Ascended', description: 'Beyond mortal limits', color: '#1d4ed8' },
    { level: 14, xpRequired: 30000, title: 'Divine', description: 'Divine power', color: '#059669' },
    { level: 15, xpRequired: 40000, title: 'Transcendent', description: 'Transcended reality', color: '#be123c' },
  ];

  let currentLevel = 1;
  let currentLevelXp = 0;
  let nextLevelXp = 100;
  let levelInfo = levels[0];

  // Find current level
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXp >= levels[i].xpRequired) {
      currentLevel = levels[i].level;
      currentLevelXp = levels[i].xpRequired;
      levelInfo = levels[i];
      break;
    }
  }

  // Find next level XP requirement
  const nextLevelData = levels.find(l => l.level === currentLevel + 1);
  if (nextLevelData) {
    nextLevelXp = nextLevelData.xpRequired;
  } else {
    nextLevelXp = currentLevelXp + 100000; // No next level, use large number
  }

  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;
  const progress = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 100;

  return {
    level: currentLevel,
    totalXp: totalXp,
    xpInCurrentLevel: xpInCurrentLevel,
    xpForNextLevel: xpForNextLevel,
    progress: Math.round(progress * 100) / 100,
    title: levelInfo.title,
    description: levelInfo.description,
    color: levelInfo.color
  };
};

// Legacy sync function - now deprecated in favor of manual claiming
export const syncAllAchievements = async (): Promise<{ success: boolean; error?: string }> => {
  console.warn('syncAllAchievements is deprecated. Use manual achievement claiming instead.');
  return { 
    success: false, 
    error: 'This sync method is deprecated. Players should now manually claim their achievements.' 
  };
};
