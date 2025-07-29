import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlayerProfile } from '@/types/player';
import { validateStats } from '@/utils/statsValidation';
import { calculateLevelInfoSync } from '@/lib/leveling';

interface PlayerSearchResponse {
  players: PlayerProfile[];
  count: number;
}

interface PlayerProfileFromDb {
  uuid: string;
  name: string;
  created_at: string;
  last_seen: number;
  updated_at: string;
  stats?: Record<string, any> | null;
  ranks?: Record<string, any> | null;
  medals?: Record<string, any> | null;
}

interface PlayerBadge {
  id: string;
  player_uuid: string;
  badge_type: string;
  badge_color: string;
  is_verified: boolean;
  assigned_at: string;
  assigned_by?: string;
  icon: string;
  icon_only: boolean;
}

// Cache for detailed stats to avoid repeated file fetches
const detailedStatsCache = new Map<string, any>();

// Cache for badges to avoid repeated database queries
const badgesCache = new Map<string, PlayerBadge[]>();

// Fetch detailed stats for a single player
const getDetailedPlayerStats = async (uuid: string): Promise<any> => {
  // Check cache first
  if (detailedStatsCache.has(uuid)) {
    return detailedStatsCache.get(uuid);
  }

  try {
    const response = await fetch(`/stats/data/playerdata/${uuid}.json`);
    
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      return {};
    }
    
    const data = await response.json();
    const stats: any = {};
    
    Object.entries(data).forEach(([key, statData]: [string, any]) => {
      if (statData && typeof statData.value === 'number') {
        stats[key] = statData.value;
      }
    });
    
    // Cache the result
    detailedStatsCache.set(uuid, stats);
    return stats;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {};
    } else {
      console.warn(`Failed to fetch detailed stats for ${uuid}:`, error);
      return {};
    }
  }
};

// Fetch badges for a single player
const getPlayerBadges = async (uuid: string): Promise<PlayerBadge[]> => {
  // Check cache first
  if (badgesCache.has(uuid)) {
    return badgesCache.get(uuid)!;
  }

  try {
    const { data, error } = await supabase
      .from('player_badges')
      .select('*')
      .eq('player_uuid', uuid)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    const badges = data || [];
    
    // Cache the result
    badgesCache.set(uuid, badges);
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

// Process player profile from database data
const processPlayerProfileFromDb = (player: PlayerProfileFromDb, detailedStats: any, badges: PlayerBadge[]): PlayerProfile => {
  const totalXp = detailedStats.total_xp || 0;
  const levelInfo = calculateLevelInfoSync(totalXp);
  
  // Validate and process stats
  const validatedStats = validateStats(detailedStats);
  
  // Process badges
  const processedBadges = badges.map(badge => ({
    id: badge.id,
    player_uuid: badge.player_uuid,
    badge_type: badge.badge_type,
    badge_color: badge.badge_color,
    is_verified: badge.is_verified,
    assigned_at: badge.assigned_at,
    assigned_by: badge.assigned_by,
    icon: badge.icon,
    icon_only: badge.icon_only
  }));

  return {
    id: player.uuid,
    username: player.name,
    displayName: player.name,
    joinDate: player.created_at,
    lastSeen: player.last_seen.toString(),
    stats: validatedStats,
    badges: processedBadges,
    serverRole: 'player', // Default role, will be updated by the main hook
    isOnline: false, // Will be updated by the main hook
    isWebsiteUser: false, // Default value
    achievements: [], // Default empty array
  };
};

// Search for players by name
const searchPlayers = async (searchTerm: string): Promise<PlayerSearchResponse> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return { players: [], count: 0 };
  }

  try {
    console.log(`Searching for players with term: "${searchTerm}"`);
    
    // Search for players by name (case-insensitive)
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .ilike('name', `%${searchTerm.trim()}%`)
      .order('last_seen', { ascending: false })
      .limit(20); // Limit search results to 20 players

    if (playersError) {
      console.error('Error searching players:', playersError);
      throw playersError;
    }

    if (!playersData || playersData.length === 0) {
      return { players: [], count: 0 };
    }

    // Map to PlayerProfileFromDb
    const playerProfiles: PlayerProfileFromDb[] = playersData.map((player: any) => ({
      uuid: player.uuid,
      name: player.name,
      created_at: player.created_at,
      last_seen: player.last_seen,
      updated_at: player.updated_at
    }));

    // Fetch detailed stats and badges for all found players in parallel
    const uuids = playerProfiles.map(p => p.uuid);
    const [detailedStatsPromises, badgesPromises] = await Promise.all([
      Promise.all(uuids.map(uuid => getDetailedPlayerStats(uuid))),
      Promise.all(uuids.map(uuid => getPlayerBadges(uuid)))
    ]);

    // Process players with their data
    const profiles = playerProfiles.map((player, index) => {
      const detailedStats = detailedStatsPromises[index];
      const badges = badgesPromises[index];
      
      return processPlayerProfileFromDb(player, detailedStats, badges);
    });

    return {
      players: profiles,
      count: profiles.length
    };
  } catch (error) {
    console.error('Error in searchPlayers:', error);
    return { players: [], count: 0 };
  }
};

export const usePlayerSearch = (searchTerm: string) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['playerSearch', searchTerm],
    queryFn: () => searchPlayers(searchTerm),
    enabled: searchTerm.trim().length >= 2, // Only search when term is 2+ characters
    retry: 1,
    retryDelay: 500,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  const players = data?.players ?? [];
  const count = data?.count ?? 0;

  return {
    players,
    count,
    loading: isLoading,
    loadingMore: isFetching && !isLoading,
    error,
  };
}; 