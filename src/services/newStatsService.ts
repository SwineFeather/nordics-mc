import { supabase } from '@/integrations/supabase/client';
import type { PlayerProfile } from '@/types/player';

// Helper function to convert ticks to hours
const ticksToHours = (ticks: number): number => {
  return Math.floor(ticks / 72000); // 72000 ticks = 1 hour
};

// Helper function to convert centimeters to blocks
const cmToBlocks = (cm: number): number => {
  return Math.floor(cm / 100); // 100 cm = 1 block
};

// Helper function to safely get nested JSONB values
const getNestedStat = (stats: any, category: string, statName: string, defaultValue: number = 0): number => {
  if (!stats || typeof stats !== 'object') return defaultValue;
  if (!stats[category] || typeof stats[category] !== 'object') return defaultValue;
  const value = stats[category][statName];
  return typeof value === 'number' ? value : defaultValue;
};

// Comprehensive function to flatten all nested stats into individual properties
export const flattenNestedStats = (nestedStats: any): Record<string, number> => {
  const flatStats: Record<string, number> = {};
  
  // Handle case where stats might be a string that needs parsing
  if (typeof nestedStats === 'string') {
    try {
      nestedStats = JSON.parse(nestedStats);
    } catch (error) {
      console.error('Failed to parse stats string:', error);
      return flatStats;
    }
  }
  
  if (!nestedStats || typeof nestedStats !== 'object') {
    return flatStats;
  }
  
  // Process the nested structure
  
  // Process each category in the nested structure
  Object.entries(nestedStats).forEach(([category, categoryStats]: [string, any]) => {
    if (categoryStats && typeof categoryStats === 'string') {
      // Handle stringified stats format like "{item=value, item2=value2}"
      
      // Remove the outer braces and split by comma
      const cleanStats = categoryStats.replace(/^\{|\}$/g, '');
      if (cleanStats) {
        const statPairs = cleanStats.split(', ');
        statPairs.forEach(pair => {
          const [statName, valueStr] = pair.split('=');
          if (statName && valueStr) {
            const value = parseInt(valueStr, 10);
            if (!isNaN(value)) {
              // Create flat property names based on category
              let flatName: string;
              
              switch (category) {
                case 'custom':
                  // Custom stats keep their original names
                  flatName = statName;
                  break;
                case 'mined':
                  // Mining stats get _mined suffix
                  flatName = `${statName}_mined`;
                  break;
                case 'used':
                  // Used stats get _used suffix
                  flatName = `${statName}_used`;
                  break;
                case 'crafted':
                  // Crafted stats get _crafted suffix
                  flatName = `${statName}_crafted`;
                  break;
                case 'killed':
                  // Killed stats get _killed suffix
                  flatName = `${statName}_killed`;
                  break;
                case 'killed_by':
                  // Death stats get killed_by_ prefix
                  flatName = `killed_by_${statName}`;
                  break;
                case 'picked_up':
                  // Picked up stats get _picked_up suffix
                  flatName = `${statName}_picked_up`;
                  break;
                case 'dropped':
                  // Dropped stats get _dropped suffix
                  flatName = `${statName}_dropped`;
                  break;
                case 'broken':
                  // Broken stats get _broken suffix
                  flatName = `${statName}_broken`;
                  break;
                default:
                  // For any other categories, use category_statname format
                  flatName = `${category}_${statName}`;
                  break;
              }
              
              flatStats[flatName] = value;
            }
          }
        });
      }
    } else if (categoryStats && typeof categoryStats === 'object') {
      // Handle actual object format (fallback)
      Object.entries(categoryStats).forEach(([statName, value]: [string, any]) => {
        if (typeof value === 'number') {
          // Create flat property names based on category
          let flatName: string;
          
          switch (category) {
            case 'custom':
              // Custom stats keep their original names
              flatName = statName;
              break;
            case 'mined':
              // Mining stats get _mined suffix
              flatName = `${statName}_mined`;
              break;
            case 'used':
              // Used stats get _used suffix
              flatName = `${statName}_used`;
              break;
            case 'crafted':
              // Crafted stats get _crafted suffix
              flatName = `${statName}_crafted`;
              break;
            case 'killed':
              // Killed stats get _killed suffix
              flatName = `${statName}_killed`;
              break;
            case 'killed_by':
              // Death stats get killed_by_ prefix
              flatName = `killed_by_${statName}`;
              break;
            case 'picked_up':
              // Picked up stats get _picked_up suffix
              flatName = `${statName}_picked_up`;
              break;
            case 'dropped':
              // Dropped stats get _dropped suffix
              flatName = `${statName}_dropped`;
              break;
            case 'broken':
              // Broken stats get _broken suffix
              flatName = `${statName}_broken`;
              break;
            default:
              // For any other categories, use category_statname format
              flatName = `${category}_${statName}`;
              break;
          }
          
          flatStats[flatName] = value;
        }
      });
    }
  });
  
  return flatStats;
};

// Fetch players with their stats from the new structure
export const fetchPlayersFromNewStructure = async ({ limit, offset }: { limit: number; offset: number }) => {
  try {
    // Fetching players from new database structure
    
    // TEMPORARILY DISABLED - Database structure mismatch
    // Service temporarily disabled due to database structure mismatch
    return { players: [], count: 0 };
  } catch (error) {
    console.error('Error in fetchPlayersFromNewStructure:', error);
    return { players: [], count: 0 };
  }
};

// Get leaderboard data using the new structure with direct SQL queries
export const getLeaderboardFromNewStructure = async (statPath: string, limit: number = 100) => {
  try {
    console.log(`Fetching leaderboard for stat: ${statPath}`);
    
    // Split the stat path to determine category and stat name
    const pathParts = statPath.split('.');
    
    if (pathParts.length === 2) {
      const [category, statName] = pathParts;
      
      // Use direct SQL query since the RPC functions aren't available in types yet
      const { data, error } = await supabase
        .from('players')
        .select(`
          uuid,
          name,
          player_stats!inner (
            stats
          )
        `)
        .not('player_stats.stats', 'is', null)
        .order('player_stats.stats', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`Error fetching leaderboard for ${statPath}:`, error);
        return [];
      }

      // Process and filter the data
      const processedData = data
        .map((player: any) => {
          const stats = player.player_stats?.[0]?.stats;
          if (!stats || !stats[category] || !stats[category][statName]) {
            return null;
          }
          
          const value = stats[category][statName];
          if (typeof value !== 'number' || value <= 0) {
            return null;
          }

          return {
            uuid: player.uuid,
            username: player.name,
            value: value,
            rank: 0 // Will be set below
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, limit)
        .map((item: any, index: number) => ({
          ...item,
          rank: index + 1
        }));

      return processedData;
    } else {
      // For legacy flat structure stats, use the old parameter name that TypeScript expects
      const { data, error } = await supabase.rpc('get_top_players_by_stat', {
        stat_name_param: statPath,
        limit_count: limit
      });

      if (error) {
        console.error(`Error fetching leaderboard for ${statPath}:`, error);
        return [];
      }

      return data.map((item: any, index: number) => ({
        uuid: item.player_uuid || `player-${index}`,
        username: item.player_name,
        value: item.stat_value,
        rank: index + 1
      }));
    }
  } catch (error) {
    console.error('Error in getLeaderboardFromNewStructure:', error);
    return [];
  }
};

// Get award leaderboard
export const getAwardLeaderboard = async (awardId: string, limit: number = 100) => {
  try {
    const { data, error } = await supabase.rpc('get_award_leaderboard', {
      award_id_param: awardId,
      limit_count: limit
    });

    if (error) {
      console.error(`Error fetching award leaderboard for ${awardId}:`, error);
      return [];
    }

    return data.map((item: any, index: number) => ({
      username: item.player_name,
      medal: item.medal,
      points: parseFloat(item.points),
      achievedAt: item.achieved_at,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error in getAwardLeaderboard:', error);
    return [];
  }
};

// Get medal leaderboard
export const getMedalLeaderboard = async (medalType: 'bronze' | 'silver' | 'gold' | 'all' = 'all', limit: number = 100) => {
  try {
    const { data, error } = await supabase.rpc('get_medal_leaderboard', {
      medal_type: medalType,
      limit_count: limit
    });

    if (error) {
      console.error(`Error fetching medal leaderboard for ${medalType}:`, error);
      return [];
    }

    return data.map((item: any, index: number) => ({
      username: item.player_name,
      medalCount: item.medal_count,
      totalPoints: parseFloat(item.total_points),
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error in getMedalLeaderboard:', error);
    return [];
  }
};

// Get points leaderboard
export const getPointsLeaderboard = async (limit: number = 100) => {
  try {
    const { data, error } = await supabase.rpc('get_points_leaderboard', {
      limit_count: limit
    });

    if (error) {
      console.error('Error fetching points leaderboard:', error);
      return [];
    }

    return data.map((item: any, index: number) => ({
      username: item.player_name,
      totalPoints: parseFloat(item.total_points),
      bronzeCount: item.bronze_count,
      silverCount: item.silver_count,
      goldCount: item.gold_count,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error in getPointsLeaderboard:', error);
    return [];
  }
};
