
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlayerProfile } from '@/types/player';
import { calculateLevelInfo } from '@/lib/leveling';
import { validateStats } from '@/utils/statsValidation';
import { getComprehensivePlayerStats } from '@/services/cachedComprehensiveStatsService';

interface PlayerProfileFromDb {
  uuid: string;
  username: string;
  level: number;
  total_xp: number;
  first_joined: string | null;
  last_seen: string | null;
  is_online: boolean;
  created_at: string;
  stats: Record<string, any> | null;
  ranks: Record<string, any> | null;
  medals: Record<string, any> | null;
  stats_updated_at: string | null;
}

interface DetailedStats {
  [key: string]: number;
  play_one_minute?: number;
  play?: number;
  use_dirt?: number;
  mine_ground?: number;
  death?: number;
  kill_any?: number;
  damage_dealt?: number;
  time_since_death?: number;
}

const processPlayerProfile = async (player: PlayerProfileFromDb): Promise<PlayerProfile> => {
  const stats = player.stats || {};
  const ranks = player.ranks || {};
  const medals = player.medals || { points: 0, gold: 0, silver: 0, bronze: 0 };
  
  // Get comprehensive stats that include all possible stats (with caching)
  let detailedStats: DetailedStats = {};
  try {
    detailedStats = await getComprehensivePlayerStats(player.uuid);
  } catch (error) {
    // Network or parsing error - log but don't throw
    console.warn(`Failed to fetch comprehensive stats for ${player.uuid}:`, error);
  }

  // Process stats with comprehensive data priority
  const processedStats = {
    ...stats,
    // Use comprehensive stats for key metrics
    blocksPlaced: (detailedStats.use_dirt || 0) || (stats.blocksPlaced as number) || 0,
    blocksBroken: (detailedStats.mine_ground || 0) || (stats.blocksBroken as number) || 0,
    mobKills: (detailedStats.kill_any || 0) || (stats.mobKills as number) || 0,
    balance: (stats.balance as number) || 0,
    medalPoints: (medals.points as number) || 0,
    goldMedals: (medals.gold as number) || 0,
    silverMedals: (medals.silver as number) || 0,
    bronzeMedals: (medals.bronze as number) || 0,
    ranks: ranks,
    survivalStreak: Math.floor(((detailedStats.time_since_death || 0)) / 24000), // Convert ticks to days
    itemsCrafted: (stats.itemsCrafted as number) || 0,
    itemsDropped: (stats.itemsDropped as number) || 0,
    itemsPickedUp: (stats.itemsPickedUp as number) || 0,
    timesKilledBy: (stats.timesKilledBy as number) || 0,
    // Include all comprehensive stats for complete display and achievement processing
    ...detailedStats
  };

  // Validate the stats
  const validatedStats = validateStats(processedStats);

  // Fetch achievements
  const { data: achievementsData } = await supabase
    .from('unlocked_achievements')
    .select(`
      tier:achievement_tiers (
        *,
        definition:achievement_definitions (*)
      )
    `)
    .eq('player_uuid', player.uuid);

  const achievements = (achievementsData || [])
    .map((ua: any) => {
      if (!ua.tier || !ua.tier.definition) return null;
      return {
        ...ua.tier,
        achievementId: ua.tier.definition.id,
        achievementName: ua.tier.definition.name,
        stat: ua.tier.definition.stat,
        currentValue: detailedStats[ua.tier.definition.stat as keyof DetailedStats] ?? validatedStats[ua.tier.definition.stat as keyof typeof validatedStats] ?? 0,
        color: 'from-blue-500 to-purple-600',
      };
    })
    .filter((a: any) => a !== null);

  // Fetch badges for the player
  let badges = [];
  try {
    const { data: badgeData, error: badgeError } = await supabase
      .from('player_badges')
      .select('*')
      .eq('player_uuid', player.uuid)
      .order('is_verified', { ascending: false })
      .order('assigned_at', { ascending: false });
    if (badgeError) {
      console.warn('Error fetching badges for player:', player.uuid, badgeError);
    }
    badges = badgeData || [];
  } catch (err) {
    console.warn('Could not fetch badges for player:', player.uuid, err);
    badges = [];
  }

  // Calculate level info properly using the leveling system - AWAIT the promise
  const levelInfoFromLib = await calculateLevelInfo(player.total_xp || 0);
  const levelInfo = {
    level: levelInfoFromLib.level,
    totalXp: levelInfoFromLib.totalXp,
    xpInCurrentLevel: levelInfoFromLib.xpInCurrentLevel,
    xpForNextLevel: levelInfoFromLib.xpForNextLevel,
    progress: levelInfoFromLib.progress
  };
  
  // Fetch bio from auth profile if the player is linked to a user account
  let bio = '';
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('bio')
      .eq('minecraft_username', player.username)
      .single();
    
    if (profileData?.bio) {
      bio = profileData.bio;
    }
  } catch (error) {
    console.log('No auth profile linked for player:', player.username);
  }

  return {
    id: player.uuid,
    username: player.username,
    displayName: player.username,
    avatar: `https://mc-heads.net/avatar/${player.uuid}/100`,
    joinDate: player.first_joined || player.created_at,
    lastSeen: player.last_seen || player.created_at,
    isOnline: player.is_online || false,
    isWebsiteUser: false, // This will be updated by useProfiles hook
    bio: bio,
    stats: validatedStats,
    achievements: achievements,
    levelInfo: levelInfo,
    serverRole: 'Member',
    badges: badges, // Always include badges
  };
};

export const usePlayerProfile = (uuid: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['playerProfile', uuid],
    queryFn: async () => {
      console.log('Fetching individual player profile for UUID:', uuid);

      // 1. Fetch the latest stats for the player
      const { data: playerData, error } = await supabase
        .rpc('get_player_profile', { player_uuid_param: uuid });

      if (error) {
        console.error('Error fetching player profile:', error);
        throw error;
      }

      if (!playerData || playerData.length === 0) {
        console.log('No player found with UUID:', uuid);
        return null;
      }

      // 2. Call the achievement calculation function to unlock any new achievements
      //    (This is the on-the-fly unlocking step)
      try {
        // Fetch the latest stats JSON for the player
        const stats = playerData[0].stats;
        if (stats) {
          await supabase.rpc('calculate_player_achievements', {
            p_player_uuid: uuid,
            p_player_stats: stats,
          });
        }
      } catch (err) {
        console.warn('Could not update achievements for player:', uuid, err);
      }

      // 3. Continue processing the profile as before
      // Cast the data to match our interface
      const playerProfile: PlayerProfileFromDb = {
        uuid: playerData[0].uuid,
        username: playerData[0].username,
        level: playerData[0].level,
        total_xp: playerData[0].total_xp,
        first_joined: playerData[0].first_joined,
        last_seen: playerData[0].last_seen,
        is_online: playerData[0].is_online,
        created_at: playerData[0].created_at,
        stats: playerData[0].stats as Record<string, any> | null,
        ranks: playerData[0].ranks as Record<string, any> | null,
        medals: playerData[0].medals as Record<string, any> | null,
        stats_updated_at: playerData[0].stats_updated_at
      };

      const processedProfile = await processPlayerProfile(playerProfile);
      console.log('Successfully processed individual player profile:', processedProfile.username);

      return processedProfile;
    },
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    profile: data || null,
    loading: isLoading,
    error,
    refetch,
  };
};
