import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  MapPin, 
  Building, 
  BarChart3, 
  Crown,
  User,
  Star,
  Award,
  Sparkles,
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
  Wand2,
  Clock
} from 'lucide-react';
import { usePlayerStatsConditional } from '@/hooks/usePlayerStatsConditional';
import { usePlayerSearch } from '@/hooks/usePlayerSearch';
import { useAllResidents } from '@/hooks/usePlayerResidentData';
import PlayerSearchAndFilter from './PlayerSearchAndFilter';
import PlayerSearchResults from './PlayerSearchResults';
import PlayerProfile from '@/components/PlayerProfile';
import PlayerStatsDetail from './PlayerStatsDetail';
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
  'vip': 40,
  'kala': 50,
  'fancy kala': 60,
  'golden kala': 70,
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

// Virtual scrolling component for better performance
const VirtualizedPlayerGrid = ({ 
  profiles, 
  onPlayerClick, 
  allResidents,
  searchTerm,
  statusFilter,
  showDetailedStats
}: { 
  profiles: any[];
  onPlayerClick: (profile: any) => void;
  allResidents: any[];
  searchTerm: string;
  statusFilter: string;
  showDetailedStats: boolean;
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemsPerPage = 50;

  // Calculate player priority score based on influence, badges, and server roles
  const calculatePlayerPriority = (profile: any, residentData: any): number => {
    const influenceScore = residentData?.activity_score || 0;
    let priority = 0;

    // SwineFeather always first
    if (profile.id === '9af29b79-1017-455c-9e9b-073be806070f') {
      return 2000000;
    }

    // Give highest priority to top players by playtime
    if (profile.id && TOP_PLAYERS_BY_PLAYTIME.includes(profile.id)) {
      const playtimeRank = TOP_PLAYERS_BY_PLAYTIME.indexOf(profile.id);
      priority = 1000000 - playtimeRank; // Higher rank = higher priority
      return priority;
    }

    // Only give priority to players with significant influence (>= 200)
    if (influenceScore >= 200) {
      priority = influenceScore;
    }

    // Add badge priority
    if (profile.badges && profile.badges.length > 0) {
      const highestBadge = profile.badges.reduce((highest: PlayerBadge, badge: PlayerBadge) => {
        const badgePriority = BADGE_PRIORITY[badge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
        const highestPriority = BADGE_PRIORITY[highest.badge_type as keyof typeof BADGE_PRIORITY] || 0;
        return badgePriority > highestPriority ? badge : highest;
      });

      const badgePriority = BADGE_PRIORITY[highestBadge.badge_type as keyof typeof BADGE_PRIORITY] || 0;
      priority += badgePriority * 1000; // Multiply by 1000 to ensure badges take precedence over influence score
    }

    // Add server role priority
    if (profile.serverRole) {
      const rolePriority = SERVER_ROLE_PRIORITY[profile.serverRole.toLowerCase() as keyof typeof SERVER_ROLE_PRIORITY] || 0;
      priority += rolePriority * 500; // Multiply by 500 to ensure roles are important but not as much as badges
    }

    return priority;
  };

  // Filter and sort profiles
  const filteredAndSortedProfiles = useMemo(() => {
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

        // Status filter (online/offline)
        if (statusFilter !== 'all') {
          if (statusFilter === 'online' && !profile.isOnline) return false;
          if (statusFilter === 'offline' && profile.isOnline) return false;
        }

        return true;
      })
      .map(profile => {
        const residentData = allResidents?.find(r => r.name === profile.username);
        const priority = calculatePlayerPriority(profile, residentData);
        
        return { ...profile, priority, residentData };
      })
      .sort((a, b) => {
        // Sort by priority (influence score + badges) first
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Then by name for players with same priority
        return (a.username || a.displayName || '').localeCompare(b.username || b.displayName || '');
      });
  }, [profiles, searchTerm, statusFilter, allResidents]);

  // Get visible profiles
  const visibleProfiles = filteredAndSortedProfiles.slice(visibleRange.start, visibleRange.end);

  // Load more profiles when scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    if (scrollPercentage > 0.8 && visibleRange.end < filteredAndSortedProfiles.length) {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + itemsPerPage, filteredAndSortedProfiles.length)
      }));
    }
  }, [visibleRange.end, filteredAndSortedProfiles.length]);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto"
      onScroll={handleScroll}
    >
      {visibleProfiles.map((profile) => (
        <PlayerCard
          key={profile.id}
          profile={profile}
          onClick={() => onPlayerClick(profile)}
          allResidents={allResidents}
          showDetailedStats={showDetailedStats}
        />
      ))}
      
      {visibleRange.end < filteredAndSortedProfiles.length && (
        <div className="col-span-full flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
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
  // Helper function to safely get numeric values
  const getNumericStat = (value: number | { [key: string]: number } | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null) {
      const firstValue = Object.values(value)[0];
      if (typeof firstValue === 'number') return firstValue;
    }
    return 0;
  };

  const formatTotalXp = (totalXp: number) => {
    if (totalXp >= 1000000) return `${(totalXp / 1000000).toFixed(1)}M`;
    if (totalXp >= 1000) return `${(totalXp / 1000).toFixed(1)}K`;
    return totalXp.toString();
  };

  // Helper function to get influence status based on influence score
  const getInfluenceStatus = (score: number) => {
    if (score >= 400) return { label: 'Established', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 200) return { label: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return null; // Don't show status for lower tiers
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'vip': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getServerRoleColor = (serverRole: string) => {
    switch (serverRole.toLowerCase()) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-orange-500';
      case 'vip': return 'bg-purple-500';
      case 'kala': return 'bg-green-500';
      case 'fancy kala': return 'bg-blue-500';
      case 'golden kala': return 'bg-yellow-500';
      case 'former supporter': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get resident data for this player
  const residentData = allResidents?.find(r => r.name === profile.username);
  const influenceStatus = residentData ? getInfluenceStatus(residentData.activity_score) : null;

  // Get primary badge
  const primaryBadge = profile.badges?.find((b: PlayerBadge) => b.is_verified) || profile.badges?.[0];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-card dark:border-border" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://mc-heads.net/avatar/${profile.username}/64`} />
              <AvatarFallback className="text-sm">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate dark:text-white">
                {profile.displayName || profile.username}
              </h3>
              {/* Display primary badge */}
              {primaryBadge && (
                <Badge 
                  style={{ backgroundColor: primaryBadge.badge_color, color: 'white' }}
                  className="text-xs flex items-center gap-1"
                >
                  {BADGE_ICONS[primaryBadge.icon as keyof typeof BADGE_ICONS] || BADGE_ICONS.User}
                  {!primaryBadge.icon_only && <span>{primaryBadge.badge_type}</span>}
                </Badge>
              )}
              {/* Display server role if different from badge */}
              {profile.serverRole && (!primaryBadge || primaryBadge.badge_type.toLowerCase() !== profile.serverRole.toLowerCase()) && (
                <Badge 
                  variant="outline"
                  className={`text-xs ${getServerRoleColor(profile.serverRole)} text-white`}
                >
                  {profile.serverRole}
                </Badge>
              )}
              {/* Show loading indicator for badges if no badges but detailed stats are enabled */}
              {showDetailedStats && !primaryBadge && profile.badges === undefined && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
              )}
            </div>

            {/* Influence status - more subtle */}
            {influenceStatus && (
              <div className="text-xs text-muted-foreground mb-2">
                {influenceStatus.label} member
              </div>
            )}
            


            {/* Nation and Town info */}
            {(residentData?.nation_name || residentData?.town_name) && (
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                {residentData.nation_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{residentData.nation_name}</span>
                  </div>
                )}
                {residentData.town_name && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{residentData.town_name}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              {/* Removed detailed stats to make cards more compact */}
            </div>

            <div className="flex items-center justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 dark:border-muted-foreground dark:text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PlayerDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('priority'); // Changed default to priority
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [showDetailedStats, setShowDetailedStats] = useState(true); // Keep detailed stats on by default to show badges

  const pageSize = 50; // Reduced page size for better performance

  // Use the conditional hook that only refetches when page is visible
  const { profiles, loading, error, hasMore, loadingMore } = usePlayerStatsConditional({ 
    limit: pageSize, 
    offset: page * pageSize,
    skipDetailedStats: !showDetailedStats 
  });
  
  // Use the search hook for finding players not in the default list
  const { players: searchResults, loading: searchLoading, count: searchCount } = usePlayerSearch(searchTerm);
  
  const { data: allResidents, loading: residentsLoading } = useAllResidents();

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

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleToggleDetailedStats = () => {
    setShowDetailedStats(prev => !prev);
    setPage(0); // Reset to first page
  };

  if (loading || residentsLoading) {
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

      {/* Performance toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2 dark:border-muted-foreground">
            {searchTerm.trim().length >= 2 
              ? `Found ${searchCount} players for "${searchTerm}"` 
              : `Showing ${profiles.length} top players`
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
              Page {page + 1} • {profiles.length} per page
            </Badge>
          )}
        </div>
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
        <VirtualizedPlayerGrid
          profiles={profiles}
          onPlayerClick={handlePlayerClick}
          allResidents={allResidents || []}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          showDetailedStats={showDetailedStats}
        />
      )}

      {/* Load more button - only show when not searching */}
      {hasMore && searchTerm.trim().length < 2 && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? 'Loading...' : 'Load More Players'}
          </Button>
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
