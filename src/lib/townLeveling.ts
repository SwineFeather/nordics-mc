import { supabase } from '@/integrations/supabase/client';
import { townAchievements } from '@/config/townAchievements';

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

// Calculate level info from total XP using database function
export const calculateTownLevelInfo = async (totalXp: number): Promise<TownLevelInfo> => {
  try {
    const { data, error } = await supabase.rpc('calculate_town_level_from_xp', {
      town_xp: totalXp
    });

    if (error) {
      console.error('Error calculating town level from XP:', error);
      // Fallback to basic calculation
      return calculateTownLevelInfoSync(totalXp);
    }

    if (!data || data.length === 0) {
      return calculateTownLevelInfoSync(totalXp);
    }

    const levelData = data[0];
    
    // Get level definition from database for additional info
    const { data: levelDef } = await supabase
      .from('town_level_definitions')
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
    console.error('Error in calculateTownLevelInfo:', error);
    return calculateTownLevelInfoSync(totalXp);
  }
};

// Synchronous version for when we can't use the database function
export const calculateTownLevelInfoSync = (totalXp: number): TownLevelInfo => {
  // Updated level calculation based on new 50-level system
  const levels = [
    // Early Levels (1-10): Foundation and Growth
    { level: 1, xpRequired: 0, title: 'Outpost', description: 'A small gathering of settlers', color: '#6b7280' },
    { level: 2, xpRequired: 50, title: 'Camp', description: 'A temporary settlement', color: '#6b7280' },
    { level: 3, xpRequired: 125, title: 'Settlement', description: 'A permanent home for pioneers', color: '#10b981' },
    { level: 4, xpRequired: 225, title: 'Hamlet', description: 'A small but growing community', color: '#10b981' },
    { level: 5, xpRequired: 350, title: 'Village', description: 'A thriving rural settlement', color: '#10b981' },
    { level: 6, xpRequired: 500, title: 'Town', description: 'A bustling center of activity', color: '#3b82f6' },
    { level: 7, xpRequired: 700, title: 'Market Town', description: 'A hub of commerce and trade', color: '#3b82f6' },
    { level: 8, xpRequired: 950, title: 'Port Town', description: 'A coastal trading center', color: '#3b82f6' },
    { level: 9, xpRequired: 1250, title: 'Mining Town', description: 'A settlement built on resources', color: '#3b82f6' },
    { level: 10, xpRequired: 1600, title: 'Farming Town', description: 'A settlement sustained by agriculture', color: '#3b82f6' },
    
    // Mid Levels (11-25): Development and Prosperity
    { level: 11, xpRequired: 2000, title: 'Trading Post', description: 'A center of regional commerce', color: '#8b5cf6' },
    { level: 12, xpRequired: 2500, title: 'Crossroads', description: 'A town at the intersection of trade routes', color: '#8b5cf6' },
    { level: 13, xpRequired: 3100, title: 'Fortress Town', description: 'A well-defended settlement', color: '#8b5cf6' },
    { level: 14, xpRequired: 3800, title: 'University Town', description: 'A center of learning and knowledge', color: '#8b5cf6' },
    { level: 15, xpRequired: 4600, title: 'Craftsmen Town', description: 'A settlement of skilled artisans', color: '#8b5cf6' },
    { level: 16, xpRequired: 5500, title: 'Merchant Town', description: 'A wealthy trading center', color: '#f59e0b' },
    { level: 17, xpRequired: 6500, title: 'Guild Town', description: 'A settlement of organized crafts', color: '#f59e0b' },
    { level: 18, xpRequired: 7600, title: 'Harbor Town', description: 'A major port settlement', color: '#f59e0b' },
    { level: 19, xpRequired: 8800, title: 'Frontier Town', description: 'A settlement on the edge of civilization', color: '#f59e0b' },
    { level: 20, xpRequired: 10200, title: 'Industrial Town', description: 'A center of manufacturing', color: '#f59e0b' },
    { level: 21, xpRequired: 11700, title: 'Cultural Town', description: 'A center of arts and culture', color: '#ef4444' },
    { level: 22, xpRequired: 13300, title: 'Religious Town', description: 'A center of faith and spirituality', color: '#ef4444' },
    { level: 23, xpRequired: 15000, title: 'Academic Town', description: 'A center of research and education', color: '#ef4444' },
    { level: 24, xpRequired: 16800, title: 'Military Town', description: 'A settlement with strong defenses', color: '#ef4444' },
    { level: 25, xpRequired: 18700, title: 'Diplomatic Town', description: 'A center of international relations', color: '#ef4444' },
    
    // High Levels (26-40): Prestige and Influence
    { level: 26, xpRequired: 20700, title: 'Regional Capital', description: 'The leading town of a region', color: '#ec4899' },
    { level: 27, xpRequired: 22800, title: 'Provincial Capital', description: 'A capital of great importance', color: '#ec4899' },
    { level: 28, xpRequired: 25000, title: 'Territorial Capital', description: 'A capital of vast territories', color: '#ec4899' },
    { level: 29, xpRequired: 27300, title: 'Federal Capital', description: 'A capital of federal significance', color: '#ec4899' },
    { level: 30, xpRequired: 29700, title: 'Imperial Capital', description: 'A capital of imperial might', color: '#ec4899' },
    { level: 31, xpRequired: 32200, title: 'Royal Capital', description: 'A capital of royal authority', color: '#6366f1' },
    { level: 32, xpRequired: 34800, title: 'Noble Capital', description: 'A capital of noble heritage', color: '#6366f1' },
    { level: 33, xpRequired: 37500, title: 'Ancient Capital', description: 'A capital with ancient roots', color: '#6366f1' },
    { level: 34, xpRequired: 40300, title: 'Sacred Capital', description: 'A capital of divine significance', color: '#6366f1' },
    { level: 35, xpRequired: 43200, title: 'Legendary Capital', description: 'A capital of legendary status', color: '#6366f1' },
    { level: 36, xpRequired: 46200, title: 'Mythical Capital', description: 'A capital of mythical proportions', color: '#dc2626' },
    { level: 37, xpRequired: 49300, title: 'Divine Capital', description: 'A capital touched by the divine', color: '#dc2626' },
    { level: 38, xpRequired: 52500, title: 'Celestial Capital', description: 'A capital of celestial significance', color: '#dc2626' },
    { level: 39, xpRequired: 55800, title: 'Ethereal Capital', description: 'A capital beyond mortal understanding', color: '#dc2626' },
    { level: 40, xpRequired: 59200, title: 'Transcendent Capital', description: 'A capital that transcends reality', color: '#dc2626' },
    
    // Elite Levels (41-50): Ultimate Achievement
    { level: 41, xpRequired: 62700, title: 'Cosmic Capital', description: 'A capital of cosmic significance', color: '#be185d' },
    { level: 42, xpRequired: 66300, title: 'Dimensional Capital', description: 'A capital spanning dimensions', color: '#be185d' },
    { level: 43, xpRequired: 70000, title: 'Temporal Capital', description: 'A capital beyond time', color: '#be185d' },
    { level: 44, xpRequired: 73800, title: 'Spatial Capital', description: 'A capital beyond space', color: '#be185d' },
    { level: 45, xpRequired: 77700, title: 'Quantum Capital', description: 'A capital of quantum existence', color: '#be185d' },
    { level: 46, xpRequired: 81700, title: 'Void Capital', description: 'A capital in the void', color: '#7c3aed' },
    { level: 47, xpRequired: 85800, title: 'Infinity Capital', description: 'A capital of infinite possibilities', color: '#7c3aed' },
    { level: 48, xpRequired: 90000, title: 'Eternal Capital', description: 'A capital that will last forever', color: '#7c3aed' },
    { level: 49, xpRequired: 94300, title: 'Omnipotent Capital', description: 'A capital of ultimate power', color: '#7c3aed' },
    { level: 50, xpRequired: 98700, title: 'Transcendent Nexus', description: 'The ultimate town - beyond all comprehension', color: '#dc2626' },
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

// Claim a town achievement and award XP
export const claimTownAchievement = async (townId: string, tierId: string) => {
  try {
    console.log('Calling claim_town_achievement with:', { townId, tierId });
    
    const { data, error } = await supabase.rpc('claim_town_achievement', {
      p_town_id: townId,
      p_tier_id: tierId
    });

    if (error) {
      console.error('Error claiming town achievement:', error);
      return { success: false, message: error.message };
    }

    console.log('Claim result:', data);
    return data;
  } catch (error) {
    console.error('Error in claimTownAchievement:', error);
    return { success: false, message: 'Failed to claim achievement' };
  }
};

// Get town achievements from database
export const getTownAchievements = async (townId: string) => {
  try {
    const { data, error } = await supabase
      .from('town_unlocked_achievements')
      .select(`
        *,
        tier:town_achievement_tiers(
          *,
          definition:town_achievement_definitions(*)
        )
      `)
      .eq('town_id', townId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching town achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTownAchievements:', error);
    return [];
  }
};

// Get all town achievement definitions and tiers
export const getTownAchievementDefinitions = async () => {
  try {
    const { data, error } = await supabase
      .from('town_achievement_definitions')
      .select(`
        *,
        tiers:town_achievement_tiers(*)
      `)
      .order('id');

    if (error) {
      console.error('Error fetching town achievement definitions:', error);
      return [];
    }

    // If no data in database, return config-based definitions as fallback
    if (!data || data.length === 0) {
      console.log('No town achievement definitions in database, using config fallback');
      return townAchievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        stat: achievement.stat,
        created_at: new Date().toISOString(),
        tiers: achievement.tiers.map(tier => ({
          id: `${achievement.id}_tier_${tier.tier}`,
          achievement_id: achievement.id,
          tier: tier.tier,
          name: tier.name,
          description: tier.description,
          threshold: tier.threshold,
          points: tier.points,
          icon: 'trophy', // Default icon, will be mapped in component
          color: achievement.color,
          created_at: new Date().toISOString()
        }))
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTownAchievementDefinitions:', error);
    // Return config-based definitions as fallback
    return townAchievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      stat: achievement.stat,
      created_at: new Date().toISOString(),
              tiers: achievement.tiers.map(tier => ({
          id: `${achievement.id}_tier_${tier.tier}`,
          achievement_id: achievement.id,
          tier: tier.tier,
          name: tier.name,
          description: tier.description,
          threshold: tier.threshold,
          points: tier.points,
          icon: 'trophy', // Default icon, will be mapped in component
          color: achievement.color,
          created_at: new Date().toISOString()
        }))
    }));
  }
};

// Populate town achievement database with definitions from config
export const populateTownAchievements = async () => {
  try {
    console.log('Populating town achievement database...');
    
    // Insert achievement definitions
    for (const achievement of townAchievements) {
      const { error: defError } = await supabase
        .from('town_achievement_definitions')
        .upsert({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          stat: achievement.stat
        }, { onConflict: 'id' });

      if (defError) {
        console.error(`Error inserting achievement definition ${achievement.id}:`, defError);
        continue;
      }

      // Insert tiers for this achievement
      for (const tier of achievement.tiers) {
        const { error: tierError } = await supabase
          .from('town_achievement_tiers')
          .upsert({
            achievement_id: achievement.id,
            tier: tier.tier,
            name: tier.name,
            description: tier.description,
            threshold: tier.threshold,
            points: tier.points,
            icon: 'trophy', // Default icon, will be mapped in component
            color: achievement.color
          }, { onConflict: 'achievement_id,tier' });

        if (tierError) {
          console.error(`Error inserting tier ${tier.tier} for achievement ${achievement.id}:`, tierError);
        }
      }
    }

    console.log('Town achievement database populated successfully');
    return { success: true, message: 'Town achievements populated successfully' };
  } catch (error) {
    console.error('Error populating town achievements:', error);
    return { success: false, message: 'Failed to populate achievements' };
  }
};

// Sync all town achievements (admin function)
export const syncAllTownAchievements = async () => {
  try {
    const { data, error } = await supabase.rpc('sync_all_town_achievements');

    if (error) {
      console.error('Error syncing town achievements:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Town achievements synced successfully' };
  } catch (error) {
    console.error('Error in syncAllTownAchievements:', error);
    return { success: false, message: 'Failed to sync achievements' };
  }
}; 