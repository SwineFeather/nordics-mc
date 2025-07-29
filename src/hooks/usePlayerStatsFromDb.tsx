
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlayerProfile } from '@/types/player';
import { calculateLevelInfoSync } from '@/lib/leveling';

interface PlayerStatsResponse {
  players: PlayerProfile[];
  count: number;
}

export const fetchPlayerProfilesFromDb = async ({ limit, offset }: { limit: number; offset: number }): Promise<PlayerStatsResponse> => {
  try {
    console.log('Fetching player profiles from database...');
    
    // Remove any limit if not specified or set to a very high number to get ALL players
    const actualLimit = limit === -1 ? 10000 : limit;
    
    const { data: playersData, error: playersError, count } = await supabase
      .from('players')
      .select(`
        uuid,
        username,
        level,
        total_xp,
        first_joined,
        last_seen,
        is_online,
        created_at,
        player_stats!fk_player_stats_player_uuid (
          stats,
          ranks,
          medals
        ),
        unlocked_achievements (
          tier:achievement_tiers (
            *,
            definition:achievement_definitions (*)
          )
        )
      `, { count: 'exact' })
      .order('total_xp', { ascending: false, nullsFirst: false })
      .limit(actualLimit);

    if (playersError) {
      console.error('Error fetching players:', playersError);
      throw playersError;
    }

    if (!playersData || playersData.length === 0) {
      console.log('No players found in database');
      return { players: [], count: 0 };
    }

    console.log(`Processing ${playersData.length} players from database`);

    const processedPlayers = playersData.map((player: any): PlayerProfile => {
      const stats = player.player_stats?.[0]?.stats || {};
      const ranks = player.player_stats?.[0]?.ranks || {};
      const medals = player.player_stats?.[0]?.medals || { points: 0, gold: 0, silver: 0, bronze: 0 };
      
      // Calculate level info from XP using new system
      const levelInfo = calculateLevelInfoSync(player.total_xp || 0);
      
      // Calculate survival streak (days since last death)
      const lastDeathTime = stats.deaths_time || 0;
      const currentTime = Date.now();
      const survivalStreakDays = lastDeathTime > 0 ? Math.floor((currentTime - lastDeathTime) / (1000 * 60 * 60 * 24)) : 0;
      
      // Process achievements
      const achievements = (player.unlocked_achievements || [])
        .map((ua: any) => {
          if (!ua.tier || !ua.tier.definition) return null;
          return {
            ...ua.tier,
            achievementId: ua.tier.definition.id,
            achievementName: ua.tier.definition.name,
            stat: ua.tier.definition.stat,
            currentValue: stats[ua.tier.definition.stat] || 0,
            color: 'from-blue-500 to-purple-600',
          };
        })
        .filter((a: any) => a !== null);
      
      return {
        id: player.uuid,
        username: player.username,
        displayName: player.username,
        avatar: `https://mc-heads.net/avatar/${player.uuid}/100`,
        joinDate: player.first_joined || player.created_at,
        lastSeen: player.last_seen || player.created_at,
        isOnline: player.is_online || false,
        isWebsiteUser: false,
        stats: {
          blocksPlaced: stats.use_dirt || 0,
          blocksBroken: stats.mine_ground || 0,
          mobKills: stats.kill_any || 0,
          balance: stats.balance || 0,
          medalPoints: medals.points || 0,
          goldMedals: medals.gold || 0,
          silverMedals: medals.silver || 0,
          bronzeMedals: medals.bronze || 0,
          ranks: ranks,
          itemsCrafted: stats.custom_minecraft_crafted_wooden_pickaxe || 0,
          itemsDropped: stats.custom_minecraft_dropped_dirt || 0,
          itemsPickedUp: stats.custom_minecraft_picked_up_dirt || 0,
          timesKilledBy: stats.timesKilledBy || 0,
          survivalStreak: survivalStreakDays,
          // Include all raw stats for comprehensive display and achievement processing
          ...stats
        },
        achievements: achievements,
        levelInfo: levelInfo,
        serverRole: 'Member',
      };
    });

    console.log(`Successfully processed ${processedPlayers.length} players`);

    return {
      players: processedPlayers,
      count: count || 0
    };
  } catch (error) {
    console.error('Error in fetchPlayerProfilesFromDb:', error);
    return { players: [], count: 0 };
  }
};

export const usePlayerStatsFromDb = ({ limit }: { limit: number }) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['playerProfilesFromSupabase', limit],
    queryFn: () => fetchPlayerProfilesFromDb({ limit: limit === -1 ? -1 : limit, offset: 0 }),
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
  });

  const profiles = data?.players ?? [];
  const total = data?.count ?? 0;
  const hasMore = total > 0 && profiles.length < total;

  return {
    profiles,
    loading: isLoading,
    total,
    hasMore,
    loadingMore: isFetching && !isLoading,
    error,
  };
};
