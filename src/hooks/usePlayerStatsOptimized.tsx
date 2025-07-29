
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlayerProfile } from '@/types/player';
import { validateStats } from '@/utils/statsValidation';
import { calculateLevelInfoSync } from '@/lib/leveling';
import { getComprehensivePlayerStats } from '@/services/comprehensiveStatsService';
import { getComprehensivePlayerStatsBatch } from '@/services/cachedComprehensiveStatsService';

interface PlayerStatsResponse {
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

// Cache for all players with their priority scores
const allPlayersCache = new Map<string, { profile: PlayerProfile; priority: number }>();

// Top 50 players by playtime (SwineFeather first, then the rest)
const TOP_PLAYERS_BY_PLAYTIME = [
  '9af29b79-1017-455c-9e9b-073be806070f', // SwineFeather (Admin)
  '75c88432-a4ed-4f01-a660-b98783a0ed1b', // LordNovember64
  'da616567-2b70-4be5-bab6-e2e3852559eb', // Golli1432
  '27bb781d-5f62-4543-a069-77adc116ee5f', // Aytte
  '4dc2109d-95c3-4822-914e-ed164bfc3171', // Volymskala
  '2b3273dd-e2f5-4304-ba9d-7a7508a4a39c', // ImpalumRekted
  '1e0f36ad-256c-45cd-af46-c8c113af9883', // NL_Kommiedant
  'e2c9a0a5-72e9-419b-bb9e-9accdd6d738e', // raikia_
  'e222eb39-2c6e-4971-b2e6-e50e11967dbd', // Femfe
  '4440bf97-ac79-490c-9136-b0ca86c44c94', // Occypolojee
  '7f4e5948-d1fc-4c55-b6e4-da8dd5e009ef', // Aetzrak
  '0a462d6e-3de9-4a0c-a509-83caccd9f200', // Danny_boy95
  '5fa6e75f-ff5f-45fb-9caa-65ba1becb52c', // CrispyChickes
  '83170932-9d0d-4222-98fa-b9e744bc5d9c', // Elmureee
  '8e194000-71dd-4fbc-b27b-41ba2e8d5086', // _Bamson
  'f556595c-08b7-492c-bdb8-4ca50dc26eb0', // Svardmastaren
  '46a8c57d-2861-48ce-b29b-bbe001e9a4ef', // Redapo15
  'cc96d930-265a-41b4-bc1b-2369d2090f55', // yumsi_
  'b4aa321d-efd3-4c7d-aca1-417923c8f9bb', // LJJW2020
  '85c4a3d7-5584-4851-963d-807147e15b5c', // Adamism1
  'dd3c5057-82fa-4095-a90c-a9149f33bd15', // Jipes_
  '9a8a5c1a-1cf9-4ebd-8ca6-2440f67e4fe6', // nil_esc
  '02513333-75e9-4362-9284-a4f71b0e50c3', // _WhoKnew_
  'f70bd359-f888-43b3-b584-b726763f8fc8', // Xavierr21
  '6ef45aa4-ca4e-4362-bf8f-a6455d42e9ee', // RiverPens
  '294ae756-bad7-4edc-a614-730c97c07c71', // Linitist
  'e9a27ebe-550f-4501-bd6b-0b36822433b4', // davidrye
  'ab2d3c24-beee-4c41-b0ed-405bb8953973', // rainnn_
  '5c88c5e1-d7f4-49ec-b7a9-d59e493d52b2', // captainxo1
  '7fa1db47-5a3a-42c3-80a0-b23aa0c1fda2', // FiskerGuten
  '8c926aef-5e13-4be9-8244-2a2d796f55f6', // nniffx
  '5a3af22c-1648-460a-a993-c9a8c9c1fc52', // Areaskala
  '66fa37fd-9f3f-4358-9bd3-9872c3f4830c', // xidor_AGGE
  '02ff780f-8abf-4142-b81b-c16ef64fdc07', // Warrior_Cat
  'db0ab135-509a-4934-b7e0-ceec8d4d6681', // arzi04
  '5dc2402f-ab23-47db-aeff-6aadc04eaf5d', // Jakeybobble
  'e6c186f1-6e94-4fe4-9290-96555bfa3184', // GhostlySurvivor
  '99899779-dcb6-4710-b7d8-c82eba3fab02', // DietwolfPreuss
  'ee3c2d83-4af6-4c1d-add5-2df516cdbf35', // Kapakka
  '528765eb-ced6-41ff-9629-e95a13cca07c', // Mirrizz
  '5ddc97ff-d36a-4267-9581-ff70da50d876', // MigningSM
  'e1107273-826b-4f78-badd-3d817eea4545', // fleppesh
  'e147e8a3-0e87-4288-96fb-e17cd57dc4b2', // Gixk
  'c358151d-ef68-4fcc-8ebd-6f2d435813ed', // CraftyEthan
  '627111f0-e57f-4582-aad0-a36300fdfdf7', // Lykke1308
  '222ed90e-6a68-4198-bae9-1c73ee325853', // Andreas20110809
  '4e45e8e1-7a54-4a86-8f49-31cb797ed03d', // Lauraisamazing22
  '368c837b-f69c-4cef-8576-c2f0321cef9d', // Mathias_ash
  '18e63085-1196-4be7-b91f-3984dc6bad81'  // xNikoPy
];

// Badge priority mapping for sorting
const BADGE_PRIORITY = {
  'Admin': 100,
  'Moderator': 90,
  'Helper': 80,
  'Golden Kala': 70,
  'Fancy Kala': 60,
  'Kala': 50,
  'VIP': 40,
  'Former Supporter': 30,
  'Member': 20,
  'Player': 10,
};

// Server role priority mapping for sorting
const SERVER_ROLE_PRIORITY = {
  'admin': 100,
  'moderator': 90,
  'helper': 80,
  'vip': 40,
  'kala': 50,
  'fancy kala': 60,
  'golden kala': 70,
  'former supporter': 30,
  'member': 20,
  'player': 10,
};

// Batch fetch comprehensive stats for multiple players at once
const getDetailedPlayerStatsBatch = async (uuids: string[]): Promise<Map<string, any>> => {
  const results = new Map<string, any>();
  const uncachedUuids: string[] = [];

  // Check cache first
  uuids.forEach(uuid => {
    if (detailedStatsCache.has(uuid)) {
      results.set(uuid, detailedStatsCache.get(uuid));
    } else {
      uncachedUuids.push(uuid);
    }
  });

  if (uncachedUuids.length === 0) {
    return results;
  }

  // Fetch uncached stats using the cached comprehensive stats service
  try {
    const batchStats = await getComprehensivePlayerStatsBatch(uncachedUuids);
    
    // Update both the results and the local cache
    batchStats.forEach((stats, uuid) => {
      detailedStatsCache.set(uuid, stats);
      results.set(uuid, stats);
    });
  } catch (error) {
    console.warn('Failed to fetch cached comprehensive stats batch:', error);
    
    // Fallback to individual fetches
    const batchPromises = uncachedUuids.map(async (uuid) => {
      try {
        const stats = await getComprehensivePlayerStats(uuid);
        return { uuid, stats };
      } catch (error) {
        console.warn(`Failed to fetch comprehensive stats for ${uuid}:`, error);
        return { uuid, stats: {} };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ uuid, stats }) => {
      detailedStatsCache.set(uuid, stats);
      results.set(uuid, stats);
    });
  }

  return results;
};

// Fetch badges for multiple players at once
const getPlayerBadgesBatch = async (uuids: string[]): Promise<Map<string, PlayerBadge[]>> => {
  const results = new Map<string, PlayerBadge[]>();
  const uncachedUuids: string[] = [];

  // Check cache first
  uuids.forEach(uuid => {
    if (badgesCache.has(uuid)) {
      results.set(uuid, badgesCache.get(uuid)!);
    } else {
      uncachedUuids.push(uuid);
    }
  });

  if (uncachedUuids.length === 0) {
    return results;
  }

  // Fetch badges for uncached players
  try {
    const { data: badgesData, error } = await supabase
      .from('player_badges')
      .select('*')
      .in('player_uuid', uncachedUuids)
      .order('is_verified', { ascending: false })
      .order('assigned_at', { ascending: false });

    if (error) {
      console.warn('Error fetching badges:', error);
      return results;
    }

    // Group badges by player UUID
    const badgesByPlayer = new Map<string, PlayerBadge[]>();
    badgesData?.forEach(badge => {
      const playerBadges = badgesByPlayer.get(badge.player_uuid) || [];
      playerBadges.push(badge);
      badgesByPlayer.set(badge.player_uuid, playerBadges);
    });

    // Cache and return results
    badgesByPlayer.forEach((badges, uuid) => {
      badgesCache.set(uuid, badges);
      results.set(uuid, badges);
    });

    // Cache empty arrays for players without badges
    uncachedUuids.forEach(uuid => {
      if (!results.has(uuid)) {
        badgesCache.set(uuid, []);
        results.set(uuid, []);
      }
    });

  } catch (error) {
    console.warn('Error fetching badges batch:', error);
  }

  return results;
};

// Fetch all residents data for influence scores
const getAllResidentsData = async (): Promise<Map<string, any>> => {
  try {
    const { data: residentsData, error } = await supabase
      .from('residents')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Error fetching residents:', error);
      return new Map();
    }

    const residentsMap = new Map<string, any>();
    residentsData?.forEach(resident => {
      residentsMap.set(resident.name, resident);
    });

    return residentsMap;
  } catch (error) {
    console.warn('Error fetching residents data:', error);
    return new Map();
  }
};

// Calculate player priority score based on influence, badges, and server roles
const calculatePlayerPriority = (influenceScore: number, badges: PlayerBadge[], serverRole?: string, playerUuid?: string): number => {
  let priority = 0;

  // SwineFeather always first
  if (playerUuid === '9af29b79-1017-455c-9e9b-073be806070f') {
    return 2000000;
  }

  // Give highest priority to top players by playtime
  if (playerUuid && TOP_PLAYERS_BY_PLAYTIME.includes(playerUuid)) {
    const playtimeRank = TOP_PLAYERS_BY_PLAYTIME.indexOf(playerUuid);
    priority = 1000000 - playtimeRank; // Higher rank = higher priority
    return priority;
  }

  // Only give priority to players with significant influence (>= 200)
  if (influenceScore >= 200) {
    priority = influenceScore;
  }

  // Add badge priority
  if (badges && badges.length > 0) {
    const highestBadge = badges.reduce((highest, badge) => {
      const badgePriority = BADGE_PRIORITY[badge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
      const highestPriority = BADGE_PRIORITY[highest.badge_type as keyof typeof BADGE_PRIORITY] || 0;
      return badgePriority > highestPriority ? badge : highest;
    });

    const badgePriority = BADGE_PRIORITY[highestBadge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
    priority += badgePriority * 1000; // Multiply by 1000 to ensure badges take precedence over influence score
  }

  // Add server role priority
  if (serverRole) {
    const rolePriority = SERVER_ROLE_PRIORITY[serverRole.toLowerCase() as keyof typeof SERVER_ROLE_PRIORITY] || 0;
    priority += rolePriority * 500; // Multiply by 500 to ensure roles are important but not as much as badges
  }

  return priority;
};

const processPlayerProfileFromDb = (player: PlayerProfileFromDb, detailedStats: any, badges: PlayerBadge[]): PlayerProfile => {
  // Process stats with validation
  const processedStats = {
    blocksPlaced: Math.max(0, (detailedStats.use_dirt || 0) || 0),
    blocksBroken: Math.max(0, (detailedStats.mine_ground || 0) || 0),
    mobKills: Math.max(0, (detailedStats.kill_any || 0) || 0),
    balance: 0,
    medalPoints: 0,
    goldMedals: 0,
    silverMedals: 0,
    bronzeMedals: 0,
    ranks: {},
    survivalStreak: Math.max(0, Math.floor(((detailedStats.time_since_death || 0)) / 24000)),
    itemsCrafted: 0,
    itemsDropped: 0,
    itemsPickedUp: 0,
    timesKilledBy: 0,
    deaths: Math.max(0, (detailedStats.death || 0)),
    // Include all detailed stats for comprehensive display
    ...detailedStats
  };

  // Validate the stats
  const validatedStats = validateStats(processedStats);

  // Calculate level info - use 0 XP since we don't have XP data
  const levelInfo = calculateLevelInfoSync(0);

  // Get primary badge
  const primaryBadge = badges?.find(b => b.is_verified) || badges?.[0];
  
  return {
    id: player.uuid,
    username: player.name,
    displayName: player.name,
    avatar: `https://mc-heads.net/avatar/${player.uuid}/100`,
    joinDate: player.created_at,
    lastSeen: new Date(player.last_seen * 1000).toISOString(),
    isOnline: false,
    isWebsiteUser: false,
    stats: validatedStats,
    achievements: [], // Will be loaded separately when needed
    levelInfo: levelInfo,
    nation: '',
    town: '',
    serverRole: primaryBadge?.badge_type || 'Member',
    badges: badges || [], // Add badges to the profile
  };
};

// Optimized approach: Fetch players in batches and sort them efficiently
const fetchPlayersWithPriorityOptimized = async ({ 
  limit, 
  offset,
  skipDetailedStats = false 
}: { 
  limit: number; 
  offset: number;
  skipDetailedStats?: boolean;
}): Promise<{ profile: PlayerProfile; priority: number }[]> => {
  try {
    console.log(`Fetching ${limit} players from offset ${offset} with optimized approach...`);
    
    // Fetch players from database with pagination
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('last_seen', { ascending: false, nullsFirst: false })
      .range(offset, offset + Math.max(1, limit) - 1);

    if (playersError) {
      console.error('Error fetching players:', playersError);
      throw playersError;
    }

    if (!playersData || playersData.length === 0) {
      console.log('No players found in database');
      return [];
    }

    console.log(`Processing ${playersData.length} players for priority calculation`);

    // Cast the data to match our interface
    const playerProfiles: PlayerProfileFromDb[] = playersData.map((player: any) => ({
      uuid: player.uuid,
      name: player.name,
      created_at: player.created_at,
      last_seen: player.last_seen,
      updated_at: player.updated_at
    }));

    // Fetch all required data in parallel
    const uuids = playerProfiles.map(p => p.uuid);
    const [detailedStatsMap, badgesMap, residentsMap] = await Promise.all([
      skipDetailedStats ? Promise.resolve(new Map()) : getDetailedPlayerStatsBatch(uuids),
      getPlayerBadgesBatch(uuids), // Always fetch badges for priority calculation
      getAllResidentsData()
    ]);

    // Process players with their data
    const playersWithPriority = playerProfiles.map((player) => {
      const detailedStats = detailedStatsMap.get(player.uuid) || {};
      const badges = badgesMap.get(player.uuid) || [];
      const residentData = residentsMap.get(player.name);
      
      const profile = processPlayerProfileFromDb(player, detailedStats, badges);
      const influenceScore = residentData?.activity_score || 0;
      const serverRole = profile.serverRole;
      const priority = calculatePlayerPriority(influenceScore, badges, serverRole, player.uuid);
      
      return { profile, priority };
    });

    // Sort by priority
    playersWithPriority.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Then by name for players with same priority
      return (a.profile.username || a.profile.displayName || '').localeCompare(b.profile.username || b.profile.displayName || '');
    });

    console.log(`Successfully processed and sorted ${playersWithPriority.length} players`);

    return playersWithPriority;
  } catch (error) {
    console.error('Error in fetchPlayersWithPriorityOptimized:', error);
    return [];
  }
};

export const fetchPlayerProfilesOptimized = async ({ 
  limit, 
  offset,
  skipDetailedStats = false 
}: { 
  limit: number; 
  offset: number;
  skipDetailedStats?: boolean;
}): Promise<PlayerStatsResponse> => {
  try {
    console.log('Fetching optimized player profiles with efficient priority sorting...');
    
    // If first page, fetch only the top 50 players by UUID, in the provided order
    if (offset === 0) {
      // Fetch all top players by UUID
      const { data: topPlayersData, error: topPlayersError } = await supabase
        .from('players')
        .select('*')
        .in('uuid', TOP_PLAYERS_BY_PLAYTIME)
        .limit(TOP_PLAYERS_BY_PLAYTIME.length);

      if (topPlayersError) {
        console.error('Error fetching top players:', topPlayersError);
        throw topPlayersError;
      }

      // Map to PlayerProfileFromDb
      const playerProfiles: PlayerProfileFromDb[] = TOP_PLAYERS_BY_PLAYTIME
        .map(uuid => topPlayersData?.find((p: any) => p.uuid === uuid))
        .filter(Boolean)
        .map((player: any) => ({
          uuid: player.uuid,
          name: player.name,
          created_at: player.created_at,
          last_seen: player.last_seen,
          updated_at: player.updated_at
        }));

      // Fetch all required data in parallel
      const uuids = playerProfiles.map(p => p.uuid);
      const [detailedStatsMap, badgesMap, residentsMap] = await Promise.all([
        skipDetailedStats ? Promise.resolve(new Map()) : getDetailedPlayerStatsBatch(uuids),
        getPlayerBadgesBatch(uuids),
        getAllResidentsData()
      ]);

      // Process players with their data
      const playersWithPriority = playerProfiles.map((player) => {
        const detailedStats = detailedStatsMap.get(player.uuid) || {};
        const badges = badgesMap.get(player.uuid) || [];
        const residentData = residentsMap.get(player.name);
        
        const profile = processPlayerProfileFromDb(player, detailedStats, badges);
        const influenceScore = residentData?.activity_score || 0;
        const serverRole = profile.serverRole;
        const priority = calculatePlayerPriority(influenceScore, badges, serverRole, player.uuid);
        
        return { profile, priority };
      });

      // No need to sort, already in the provided order
      const profiles = playersWithPriority.map(({ profile }) => profile);

      return {
        players: profiles,
        count: profiles.length
      };
    }

    // For subsequent pages, fetch only non-top players
    const { count: totalCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    const { data: restPlayersData, error: restPlayersError } = await supabase
      .from('players')
      .select('*')
      .not('uuid', 'in', `(${TOP_PLAYERS_BY_PLAYTIME.join(',')})`)
      .order('last_seen', { ascending: false, nullsFirst: false })
      .range(offset - TOP_PLAYERS_BY_PLAYTIME.length, offset - TOP_PLAYERS_BY_PLAYTIME.length + limit - 1);

    if (restPlayersError) {
      console.error('Error fetching rest players:', restPlayersError);
      throw restPlayersError;
    }

    if (!restPlayersData || restPlayersData.length === 0) {
      return { players: [], count: totalCount || 0 };
    }

    const playerProfiles: PlayerProfileFromDb[] = restPlayersData.map((player: any) => ({
      uuid: player.uuid,
      name: player.name,
      created_at: player.created_at,
      last_seen: player.last_seen,
      updated_at: player.updated_at
    }));

    // Fetch all required data in parallel
    const uuids = playerProfiles.map(p => p.uuid);
    const [detailedStatsMap, badgesMap, residentsMap] = await Promise.all([
      skipDetailedStats ? Promise.resolve(new Map()) : getDetailedPlayerStatsBatch(uuids),
      getPlayerBadgesBatch(uuids),
      getAllResidentsData()
    ]);

    // Process players with their data
    const playersWithPriority = playerProfiles.map((player) => {
      const detailedStats = detailedStatsMap.get(player.uuid) || {};
      const badges = badgesMap.get(player.uuid) || [];
      const residentData = residentsMap.get(player.name);
      
      const profile = processPlayerProfileFromDb(player, detailedStats, badges);
      const influenceScore = residentData?.activity_score || 0;
      const serverRole = profile.serverRole;
      const priority = calculatePlayerPriority(influenceScore, badges, serverRole, player.uuid);
      
      return { profile, priority };
    });

    // Sort by priority
    playersWithPriority.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Then by name for players with same priority
      return (a.profile.username || a.profile.displayName || '').localeCompare(b.profile.username || b.profile.displayName || '');
    });

    const profiles = playersWithPriority.map(({ profile }) => profile);

    return {
      players: profiles,
      count: totalCount || 0
    };
  } catch (error) {
    console.error('Error in fetchPlayerProfilesOptimized:', error);
    return { players: [], count: 0 };
  }
};

export const usePlayerStatsOptimized = ({ 
  limit,
  offset = 0,
  skipDetailedStats = false 
}: { 
  limit: number;
  offset?: number;
  skipDetailedStats?: boolean;
}) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['playerProfilesOptimized', limit, offset, skipDetailedStats],
    queryFn: () => fetchPlayerProfilesOptimized({ limit, offset, skipDetailedStats }),
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 60 * 1000, // 1 hour - longer since data is more stable
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
  });

  const profiles = data?.players ?? [];
  const total = data?.count ?? 0;
  const hasMore = total > 0 && (offset + profiles.length) < total;

  return {
    profiles,
    loading: isLoading,
    total,
    hasMore,
    loadingMore: isFetching && !isLoading,
    error,
  };
};
