
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLeaderboardFromNewStructure } from '@/services/newStatsService';

export const useStatLeaderboard = (statKey: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['statLeaderboard', statKey],
    queryFn: async () => {
      // Try new system first
      console.log(`Attempting to fetch leaderboard for ${statKey} from new system`);
      
      try {
        // Map old stat keys to new JSONB paths and flattened names
        const statPathMap: Record<string, string> = {
          // Legacy mappings for backward compatibility
          'playtimeHours': 'custom.play_time',
          'blocksPlaced': 'used.dirt', // Use most common placed block as proxy
          'blocksBroken': 'mined.stone', // Use most common mined block as proxy
          'mobKills': 'killed.zombie', // Use most common killed mob as proxy
          'jumps': 'custom.jump',
          'damageDealt': 'custom.damage_dealt',
          'walk_one_cm': 'custom.walk_one_cm',
          'sprint_one_cm': 'custom.sprint_one_cm',
          'deaths': 'custom.deaths',
          'damage_dealt': 'custom.damage_dealt',
          'play_time': 'custom.play_time',
          
          // Direct stat mappings (for flattened stats)
          'stone_mined': 'mined.stone',
          'cobblestone_mined': 'mined.cobblestone',
          'dirt_mined': 'mined.dirt',
          'oak_log_mined': 'mined.oak_log',
          'grass_block_mined': 'mined.grass_block',
          'diamond_ore_mined': 'mined.diamond_ore',
          'iron_ore_mined': 'mined.iron_ore',
          'coal_ore_mined': 'mined.coal_ore',
          'gold_ore_mined': 'mined.gold_ore',
          
          // Used/placed stats
          'dirt_used': 'used.dirt',
          'cobblestone_used': 'used.cobblestone',
          'oak_planks_used': 'used.oak_planks',
          'stone_used': 'used.stone',
          
          // Combat stats
          'zombie_killed': 'killed.zombie',
          'skeleton_killed': 'killed.skeleton',
          'spider_killed': 'killed.spider',
          'creeper_killed': 'killed.creeper',
          'cow_killed': 'killed.cow',
          'pig_killed': 'killed.pig',
          'chicken_killed': 'killed.chicken',
          'sheep_killed': 'killed.sheep',
          
          // Crafting stats
          'oak_planks_crafted': 'crafted.oak_planks',
          'stick_crafted': 'crafted.stick',
          'crafting_table_crafted': 'crafted.crafting_table',
          'furnace_crafted': 'crafted.furnace',
          'bread_crafted': 'crafted.bread',
          
          // Custom stats
          'jump': 'custom.jump',
          'walk': 'custom.walk_one_cm',
          'sprint': 'custom.sprint_one_cm',
          'swim': 'custom.swim',
          'fall': 'custom.fall',
          'climb': 'custom.climb',
          'crouch': 'custom.crouch',
          
          // Death stats
          'killed_by_zombie': 'killed_by.zombie',
          'killed_by_skeleton': 'killed_by.skeleton',
          'killed_by_creeper': 'killed_by.creeper',
          'killed_by_spider': 'killed_by.spider',
        };

        const newStatPath = statPathMap[statKey] || statKey;
        const newData = await getLeaderboardFromNewStructure(newStatPath, 100);
        
        if (newData && newData.length > 0) {
          console.log(`Successfully fetched ${newData.length} entries from new system`);
          return newData;
        }
      } catch (newError) {
        console.warn('New system failed, falling back to old system:', newError);
      }

      // Fallback to old system
      console.log(`Falling back to old system for ${statKey}`);
      const { data: statsData, error } = await supabase
        .from('player_stats')
        .select(`
          player_uuid,
          stats,
          players (
            name
          )
        `)
        .order(`stats->>${statKey}`, { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) {
        console.error(`Error fetching leaderboard for ${statKey}:`, error);
        throw error;
      }

      const leaderboardData = statsData
        .map((p: any) => {
          const value = p.stats?.[statKey];
          if (value === undefined || value === null || value === 0) return null;

          return {
            uuid: p.player_uuid,
            username: p.players?.name || p.player_uuid,
            value: Number(value),
          };
        })
        .filter((p): p is { uuid: string; username: string; value: number } => p !== null)
        .sort((a, b) => b.value - a.value) // Ensure proper numeric sorting
        .map((p, index) => ({
          ...p,
          rank: index + 1,
        }));

      return leaderboardData;
    },
    enabled: !!statKey,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
  });

  return { leaderboardData: data ?? [], loading: isLoading };
};
