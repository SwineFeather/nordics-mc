
// Using a reliable third-party API for Mojang profiles to avoid rate limits
const PLAYER_API_URL = 'https://api.ashcon.app/mojang/v2/user/';

export const fetchPlayerInfo = async (uuid: string): Promise<{ uuid: string, username: string }> => {
  try {
    const response = await fetch(`${PLAYER_API_URL}${uuid}`);
    if (!response.ok) {
      // Fallback for players not found on this API, or API errors
      return { uuid, username: uuid }; 
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch player info for ${uuid}`, error);
    return { uuid, username: uuid };
  }
};

import { supabase } from '@/integrations/supabase/client';
import type { PlayerProfile } from '@/types/player';
import { calculateLevelInfo } from '@/lib/leveling';
import type { UnlockedAchievement } from '@/types/achievements';

// Helper function to get detailed player stats from JSON files
const getDetailedPlayerStats = async (uuid: string): Promise<Record<string, number>> => {
  try {
    const response = await fetch(`/stats/data/playerdata/${uuid}.json`);
    if (!response.ok) {
      return {};
    }
    const data = await response.json();
    const stats: Record<string, number> = {};
    
    // Extract values from the detailed data structure
    Object.entries(data).forEach(([key, statData]: [string, any]) => {
      if (statData && typeof statData.value === 'number') {
        stats[key] = statData.value;
      }
    });
    
    return stats;
  } catch (error) {
    console.warn(`Failed to fetch detailed stats for ${uuid}:`, error);
    return {};
  }
};

export const fetchPlayerProfilesFromDb = async ({ limit, offset }: { limit: number, offset: number }) => {
    const { data: playersData, error, count } = await supabase
    .from('players')
    .select(`
      uuid,
      name,
      created_at,
      last_seen,
      updated_at,
      player_stats (
        stats
      ),
      unlocked_achievements (
        tier:achievement_tiers (
          *,
          definition:achievement_definitions (*)
        )
      )
    `, { count: 'exact' })
    .order('last_seen', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching player profiles:', error);
    throw new Error(error.message);
  }

  const profiles: PlayerProfile[] = await Promise.all(playersData.map(async (player: any): Promise<PlayerProfile> => {
    const statsData = player.player_stats?.stats || {};

    // Get detailed stats from JSON files
    const detailedStats = await getDetailedPlayerStats(player.uuid);

    // Calculate proper playtime in hours (play stat is in ticks, 20 ticks per second)
    const playtimeTicks = detailedStats.play_one_minute || detailedStats.play || 0;
    const playtimeHours = Math.floor(playtimeTicks / 72000); // 20 ticks/sec * 3600 sec/hour

    // Fixed stat mappings with proper calculations
    const stats = {
      ...statsData,
      playtimeHours: playtimeHours,
      blocksPlaced: (detailedStats.use_dirt as number) || (statsData.blocksPlaced as number) || 0,
      blocksBroken: (detailedStats.mine_ground as number) || (statsData.blocksBroken as number) || 0,
      deaths: (detailedStats.death as number) || (statsData.deaths as number) || 0,
      mobKills: (detailedStats.kill_any as number) || (statsData.mobKills as number) || 0,
      jumps: (detailedStats.jump as number) || (statsData.jumps as number) || 0,
      damageDealt: (detailedStats.damage_dealt as number) || (statsData.damageDealt as number) || 0,
      balance: (statsData.balance as number) || 0,
      monument_builds: (statsData.monument_builds as number) || 0,
      medalPoints: 0,
      goldMedals: 0,
      silverMedals: 0,
      bronzeMedals: 0,
      ranks: {},
      survivalStreak: Math.floor(((detailedStats.time_since_death as number) || 0) / 24000), // Convert ticks to days
      // Additional stats for achievements
      use_dirt: (detailedStats.use_dirt as number) || 0,
      mine_ground: (detailedStats.mine_ground as number) || 0,
      kill_any: (detailedStats.kill_any as number) || 0,
      jump: (detailedStats.jump as number) || 0,
      damage_dealt: (detailedStats.damage_dealt as number) || 0,
      sprint: (detailedStats.sprint as number) || 0,
      mine_diamond_ore: (detailedStats.mine_diamond_ore as number) || 0,
      use_hoe: (detailedStats.use_hoe as number) || 0,
      ride_boat: (detailedStats.ride_boat as number) || 0,
      mine_wood: (detailedStats.mine_wood as number) || 0,
      death: (detailedStats.death as number) || 0,
    };

    const achievements: UnlockedAchievement[] = (player.unlocked_achievements || [])
      .map((ua: any) => {
        if (!ua.tier || !ua.tier.definition) return null;
        return {
          ...ua.tier,
          achievementId: ua.tier.definition.id,
          achievementName: ua.tier.definition.name,
          stat: ua.tier.definition.stat,
          currentValue: detailedStats[ua.tier.definition.stat as keyof typeof detailedStats] ?? stats[ua.tier.definition.stat as keyof typeof stats] ?? 0,
          color: 'from-blue-500 to-purple-600', // Default color, should be from achievement definition
        };
      })
      .filter((a: UnlockedAchievement | null): a is UnlockedAchievement => a !== null);
    
    // Calculate level info properly using the leveling system - AWAIT the promise
    const levelInfoFromLib = await calculateLevelInfo(0); // Use 0 XP since we don't have XP data
    const levelInfo = {
      level: levelInfoFromLib.level,
      totalXp: levelInfoFromLib.totalXp,
      xpInCurrentLevel: levelInfoFromLib.xpInCurrentLevel,
      xpForNextLevel: levelInfoFromLib.xpForNextLevel,
      progress: levelInfoFromLib.progress
    };
    
    return {
      id: player.uuid,
      username: player.name, // Use 'name' field from database
      displayName: player.name,
      avatar: `https://minotar.net/helm/${player.uuid}/100.png`,
      isOnline: false, // This will be updated by useProfiles hook
      isWebsiteUser: false, // This will be updated by useProfiles hook
      stats: stats,
      joinDate: player.created_at, // Use actual created_at timestamp
      lastSeen: new Date(player.last_seen * 1000).toISOString(), // Convert Unix timestamp to ISO string
      achievements: achievements,
      levelInfo: levelInfo,
      nation: '', // Placeholder for future implementation
      town: '', // Placeholder for future implementation
    };
  }));

  return { profiles, count: count ?? 0 };
};
