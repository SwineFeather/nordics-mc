import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Star,
  Award,
  Sparkles,
  Crown,
  Heart,
  Globe,
  Book,
  Wrench,
  Flame,
  Sun,
  Moon,
  Zap,
  Key,
  Lock,
  Smile,
  Ghost,
  Skull,
  Leaf,
  Rocket,
  Sword,
  Wand2
} from 'lucide-react';
import { usePlayerStatsConditional } from '@/hooks/usePlayerStatsConditional';
import { usePlayerSearch } from '@/hooks/usePlayerSearch';
import { useAllResidents } from '@/hooks/usePlayerResidentData';
import { useOnlinePlayers } from '@/hooks/useOnlinePlayers';
import PlayerSearchAndFilter from './PlayerSearchAndFilter';
import PlayerSearchResults from './PlayerSearchResults';
import PlayerProfile from '@/components/PlayerProfile';
import PlayerStatsDetail from './PlayerStatsDetail';
import SharedPlayerCard from './SharedPlayerCard';
import type { PlayerBadge } from '@/types/player';

// Badge icons mapping
const BADGE_ICONS = {
  User: <User className="w-3 h-3" />,
  Star: <Star className="w-3 h-3" />,
  Award: <Award className="w-3 h-3" />,
  Sparkles: <Sparkles className="w-3 h-3" />,
  Crown: <Crown className="w-3 h-3" />,
  Heart: <Heart className="w-3 h-3" />,
  Globe: <Globe className="w-3 h-3" />,
  Book: <Book className="w-3 h-3" />,
  Wrench: <Wrench className="w-3 h-3" />,
  Flame: <Flame className="w-3 h-3" />,
  Sun: <Sun className="w-3 h-3" />,
  Moon: <Moon className="w-3 h-3" />,
  Zap: <Zap className="w-3 h-3" />,
  Key: <Key className="w-3 h-3" />,
  Lock: <Lock className="w-3 h-3" />,
  Smile: <Smile className="w-3 h-3" />,
  Ghost: <Ghost className="w-3 h-3" />,
  Skull: <Skull className="w-3 h-3" />,
  Leaf: <Leaf className="w-3 h-3" />,
  Rocket: <Rocket className="w-3 h-3" />,
  Sword: <Sword className="w-3 h-3" />,
  Wand2: <Wand2 className="w-3 h-3" />,
};

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
  'golden kala': 70,
  'fancy kala': 60,
  'kala': 50,
  'vip': 40,
  'former supporter': 30,
  'member': 20,
  'player': 10,
};

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

// Player grid component for displaying players
const PlayerGrid = ({ 
  profiles, 
  onPlayerClick, 
  allResidents,
  searchTerm,
  statusFilter,
  showDetailedStats,
  onlinePlayers,
  sortBy
}: { 
  profiles: any[];
  onPlayerClick: (profile: any) => void;
  allResidents: any[];
  searchTerm: string;
  statusFilter: string;
  showDetailedStats: boolean;
  onlinePlayers: any[];
  sortBy: string;
}) => {

  // Calculate player priority score based on influence, badges, and server roles
  const calculatePlayerPriority = (profile: any, residentData: any): number => {
    let priority = 0;

    // SwineFeather always first
    if (profile.id === '9af29b79-1017-455c-9e9b-073be806070f') {
      return 2000000;
    }

    // Staff roles get highest priority (Admin, Moderator, Helper)
    if (profile.badges && profile.badges.length > 0) {
      const staffBadge = profile.badges.find((badge: PlayerBadge) => 
        ['Admin', 'Moderator', 'Helper'].includes(badge.badge_type)
      );
      if (staffBadge) {
        const badgePriority = BADGE_PRIORITY[staffBadge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
        priority += badgePriority * 100000; // Very high priority for staff
        console.log(`Staff member ${profile.username} (${staffBadge.badge_type}): calculated priority = ${priority}`);
        return priority;
      }
    }

    // Add badge priority for non-staff badges
    if (profile.badges && profile.badges.length > 0) {
      const highestBadge = profile.badges.reduce((highest: PlayerBadge, badge: PlayerBadge) => {
        const badgePriority = BADGE_PRIORITY[badge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
        const highestPriority = BADGE_PRIORITY[highest.badge_type as keyof typeof BADGE_PRIORITY] || 0;
        return badgePriority > highestPriority ? badge : highest;
      });

      const badgePriority = BADGE_PRIORITY[highestBadge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
      priority += badgePriority * 10000; // High priority for badges
    }

    // Add server role priority
    if (profile.serverRole) {
      const rolePriority = SERVER_ROLE_PRIORITY[profile.serverRole.toLowerCase() as keyof typeof SERVER_ROLE_PRIORITY] || 0;
      priority += rolePriority * 1000; // Medium priority for server roles
    }

    // Give priority to top players by playtime (but lower than staff/badges)
    if (profile.id && TOP_PLAYERS_BY_PLAYTIME.includes(profile.id)) {
      const playtimeRank = TOP_PLAYERS_BY_PLAYTIME.indexOf(profile.id);
      priority += (100 - playtimeRank) * 100; // Lower priority than staff/badges
    }

    // Add influence score (lowest priority)
    const influenceScore = residentData?.activity_score || 0;
    if (influenceScore >= 200) {
      priority += influenceScore;
    }

    return priority;
  };

  // Filter and sort profiles
  const filteredAndSortedProfiles = useMemo(() => {
    if (!profiles || !Array.isArray(profiles)) {
      console.warn('PlayerGrid: Profiles is not an array:', profiles);
      return [];
    }
    
    if (!onlinePlayers || !Array.isArray(onlinePlayers)) {
      console.warn('PlayerGrid: onlinePlayers is not an array:', onlinePlayers);
      return profiles; // Return unfiltered profiles if onlinePlayers is not available
    }
    
    console.log('PlayerGrid: Sorting by:', sortBy, 'with', profiles.length, 'profiles');
    
    return profiles
      .filter(profile => {
        if (!profile) return false;
        
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const usernameMatch = profile.username?.toLowerCase().includes(searchLower);
          const nameMatch = profile.displayName?.toLowerCase().includes(searchLower);
          if (!usernameMatch && !nameMatch) return false;
        }

        // Status filter (online/offline) - use real-time data
        if (statusFilter !== 'all') {
          const isPlayerOnline = onlinePlayers.some(player => 
            player.name && typeof player.name === 'string' && 
            player.name.toLowerCase() === profile.username?.toLowerCase()
          );
          if (statusFilter === 'online' && !isPlayerOnline) return false;
          if (statusFilter === 'offline' && isPlayerOnline) return false;
        }

        return true;
      })
      .map(profile => {
        const residentData = allResidents?.find(r => r.name === profile.username);
        const priority = calculatePlayerPriority(profile, residentData);
        
        // Debug logging for staff members
        if (profile.badges && profile.badges.some((b: PlayerBadge) => ['Admin', 'Moderator', 'Helper'].includes(b.badge_type))) {
          console.log(`Staff member ${profile.username}: priority=${priority}, badges=`, profile.badges.map((b: PlayerBadge) => b.badge_type));
        }
        
        return { ...profile, priority, residentData };
      })
      .sort((a, b) => {
        // Apply the selected sort criteria
        switch (sortBy) {
          case 'name':
            return (a.username || a.displayName || '').localeCompare(b.username || b.displayName || '');
          case 'level':
            const levelA = a.level || 0;
            const levelB = b.level || 0;
            if (levelB !== levelA) return levelB - levelA;
            break;
          case 'playtime':
            const playtimeA = a.playtime || 0;
            const playtimeB = b.playtime || 0;
            if (playtimeB !== playtimeA) return playtimeB - playtimeA;
            break;
          case 'medals':
            const medalsA = a.medals || 0;
            const medalsB = b.medals || 0;
            if (medalsB !== medalsA) return medalsB - medalsA;
            break;
          case 'activity':
            const activityA = a.residentData?.activity_score || 0;
            const activityB = b.residentData?.activity_score || 0;
            if (activityB !== activityA) return activityB - activityA;
            break;
          case 'balance':
            const balanceA = a.balance || 0;
            const balanceB = b.balance || 0;
            if (balanceB !== balanceA) return balanceB - balanceA;
            break;
          case 'priority':
          default:
            // Sort by priority (influence score + badges) first
            if (b.priority !== a.priority) {
              return b.priority - a.priority;
            }
            break;
        }
        // Then by name for players with same priority/sort value
        return (a.username || a.displayName || '').localeCompare(b.username || b.displayName || '');
      });
      
      // Debug: Show top 5 priorities
      if (sortBy === 'priority' && filteredAndSortedProfiles.length > 0) {
        console.log('Top 5 players by priority:');
        filteredAndSortedProfiles.slice(0, 5).forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.username}: priority=${profile.priority}, badges=`, 
            profile.badges?.map((b: PlayerBadge) => b.badge_type) || []);
        });
      }
      
      return filteredAndSortedProfiles;
  }, [profiles, searchTerm, statusFilter, allResidents, onlinePlayers, sortBy]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedProfiles.map((profile) => (
        <PlayerCard
          key={profile.id}
          profile={profile}
          onClick={() => onPlayerClick(profile)}
          allResidents={allResidents}
          showDetailedStats={showDetailedStats}
        />
      ))}
    </div>
  );
};

const PlayerCard = ({ 
  profile, 
  onClick, 
  allResidents,
  showDetailedStats
}: { 
  profile: any; 
  onClick: () => void;
  allResidents: any[];
  showDetailedStats: boolean;
}) => {
  return (
    <SharedPlayerCard
      profile={profile}
      onClick={onClick}
      allResidents={allResidents}
      showDetailedStats={showDetailedStats}
      isSearchResult={false}
    />
  );
};

const PlayerDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'priority'); // Check URL for sort param
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [showDetailedStats, setShowDetailedStats] = useState(true); // Keep detailed stats on by default to show badges
  const [pageSize, setPageSize] = useState(50); // Page size selector

  // Debug: Log initial sortBy value
  useEffect(() => {
    console.log('PlayerDirectory: Initial sortBy set to:', sortBy);
  }, [sortBy]);

  // Update URL when sort changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (sortBy === 'priority') {
      newSearchParams.delete('sort'); // Remove sort param if it's the default
    } else {
      newSearchParams.set('sort', sortBy);
    }
    setSearchParams(newSearchParams);
  }, [sortBy, searchParams, setSearchParams]);

  // Reset to first page when page size changes
  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  // Use the conditional hook that only refetches when page is visible
  const { profiles, loading, error, hasMore, loadingMore, total } = usePlayerStatsConditional({ 
    limit: pageSize, 
    offset: page * pageSize,
    skipDetailedStats: !showDetailedStats 
  });
  
  // Use the search hook for finding players not in the default list
  const { players: searchResults, loading: searchLoading, count: searchCount } = usePlayerSearch(searchTerm);
  
  const { data: allResidents, loading: residentsLoading } = useAllResidents();
  const { onlinePlayers = [], loading: onlinePlayersLoading } = useOnlinePlayers();

  // Ensure onlinePlayers is always an array
  const safeOnlinePlayers = Array.isArray(onlinePlayers) ? onlinePlayers : [];

  // Calculate pagination info
  const totalPages = Math.ceil((total || 0) / pageSize);
  const currentPage = page + 1; // Convert to 1-based for display

  // Update search term when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams, searchTerm]);

  // Check if a specific player is requested in URL and open their profile
  useEffect(() => {
    const playerParam = searchParams.get('player');
    if (playerParam && profiles.length > 0 && !selectedPlayer) {
      const player = profiles.find(p => 
        p.username?.toLowerCase() === playerParam.toLowerCase() ||
        p.displayName?.toLowerCase() === playerParam.toLowerCase()
      );
      if (player) {
        setSelectedPlayer(player);
      }
    }
  }, [searchParams, profiles, selectedPlayer]);

  const handlePlayerClick = (profile: any) => {
    const playerName = profile.username || profile.displayName;
    if (playerName) {
      // Update URL to include the player parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('player', playerName);
      setSearchParams(newSearchParams);
      
      // Set selected player to open the profile modal
      setSelectedPlayer(profile);
    }
  };

  const handleCloseProfile = () => {
    setSelectedPlayer(null);
    // Remove player parameter from URL when closing profile
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('player');
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFirstPage = () => handlePageChange(0);
  const handleLastPage = () => handlePageChange(totalPages - 1);
  const handlePreviousPage = () => handlePageChange(page - 1);
  const handleNextPage = () => handlePageChange(page + 1);

  const handleToggleDetailedStats = () => {
    setShowDetailedStats(prev => !prev);
    setPage(0); // Reset to first page
  };

  if (loading || residentsLoading || onlinePlayersLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Error loading players: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterOnline={statusFilter === 'online'}
        onFilterOnlineChange={(online) => setStatusFilter(online ? 'online' : 'all')}
        totalResults={searchTerm.trim().length >= 2 ? searchCount : profiles.length}
      />

      {/* Performance toggle and page size selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2 dark:border-muted-foreground">
            {searchTerm.trim().length >= 2 
              ? `Found ${searchCount} players for "${searchTerm}"` 
              : `Showing ${profiles.length} players (Page ${currentPage} of ${totalPages})`
            }
          </Badge>
          {(loading || searchLoading) && (
            <Badge variant="secondary" className="text-xs">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
              Loading...
            </Badge>
          )}
          {!loading && !searchLoading && profiles.length > 0 && searchTerm.trim().length < 2 && (
            <Badge variant="secondary" className="text-xs">
              {profiles.length} per page • {total} total players
            </Badge>
          )}
        </div>
        
        {/* Page size selector - only show when not searching */}
        {searchTerm.trim().length < 2 && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-muted-foreground">
              Players per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded-md bg-background dark:bg-background dark:border-border"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchTerm.trim().length >= 2 && (
        <div className="mb-6">
          <PlayerSearchResults
            players={searchResults}
            loading={searchLoading}
            searchTerm={searchTerm}
            onPlayerClick={handlePlayerClick}
          />
        </div>
      )}

      {/* Default Player Grid - only show when not searching */}
      {searchTerm.trim().length < 2 && (
        <PlayerGrid
          profiles={profiles}
          onPlayerClick={handlePlayerClick}
          allResidents={allResidents || []}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          showDetailedStats={showDetailedStats}
          onlinePlayers={safeOnlinePlayers}
          sortBy={sortBy}
        />
      )}

      {/* Pagination Controls - only show when not searching */}
      {searchTerm.trim().length < 2 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={page === 0 || loading}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 0 || loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-1"></div>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            )}
            {totalPages > 10 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Jump to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const newPage = parseInt(e.target.value) - 1;
                    if (newPage >= 0 && newPage < totalPages) {
                      handlePageChange(newPage);
                    }
                  }}
                  className="w-16 px-2 py-1 text-xs border rounded-md bg-background dark:bg-background dark:border-border"
                />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || loading || !hasMore}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-1"></div>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={page >= totalPages - 1 || loading}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Page info for single page */}
      {searchTerm.trim().length < 2 && totalPages <= 1 && total > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          Showing all {total} players
        </div>
      )}

      {profiles.length === 0 && !loading && searchTerm.trim().length < 2 && (
        <Card className="dark:bg-card dark:border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No players found.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedPlayer && (
        <PlayerStatsDetail 
          profile={selectedPlayer}
          onClose={handleCloseProfile} 
        />
      )}
    </div>
  );
};

export default PlayerDirectory;
