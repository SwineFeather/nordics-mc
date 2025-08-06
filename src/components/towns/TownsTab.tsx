import React, { useState, useEffect } from 'react';
import { SupabaseTownService, SupabaseTownData } from '@/services/supabaseTownService';
import TownRow from './TownRow';
import TownProfileModal from './TownProfileModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TownsTabProps {
  searchTerm?: string;
}

const TownsTab: React.FC<TownsTabProps> = ({ searchTerm: externalSearchTerm }) => {
  const [towns, setTowns] = useState<SupabaseTownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTown, setSelectedTown] = useState<SupabaseTownData | null>(null);
  const [showTownModal, setShowTownModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const townsData = await SupabaseTownService.getAllTowns();
        setTowns(townsData);
      } catch (err) {
        console.error('Error fetching towns:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch towns');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleViewTown = (town: any) => {
    setSelectedTown(town);
    setShowTownModal(true);
  };

  const filteredTowns = towns.filter(town => {
    const matchesSearch = town.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         town.mayor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (town.nation?.name && town.nation.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'capital' && town.capital) ||
                       (filterType === 'public' && town.public) ||
                       (filterType === 'open' && town.open);
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => {
          const fetchData = async () => {
            try {
              setLoading(true);
              setError(null);
              const townsData = await SupabaseTownService.getAllTowns();
              setTowns(townsData);
            } catch (err) {
              console.error('Error fetching towns:', err);
              setError(err instanceof Error ? err.message : 'Failed to fetch towns');
            } finally {
              setLoading(false);
            }
          };
          fetchData();
        }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Towns</h2>
          <p className="text-muted-foreground">
            {filteredTowns.length} of {towns.length} towns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search towns, mayors, or nations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Towns</SelectItem>
            <SelectItem value="capital">Capitals</SelectItem>
            <SelectItem value="public">Public Towns</SelectItem>
            <SelectItem value="open">Open Towns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Towns Grid/List */}
      {filteredTowns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No towns found matching your criteria.</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredTowns.map((town) => (
            <TownRow
              key={town.id}
              town={town}
              nationName={town.nation?.name || 'Independent'}
              nationColor={town.nation?.color || '#6B7280'}
              onViewTown={handleViewTown}
            />
          ))}
        </div>
      )}

      {/* Town Profile Modal */}
      {selectedTown && (
        <TownProfileModal
          town={{
            id: selectedTown.id,
            name: selectedTown.name,
            mayor: selectedTown.mayor,
            nation: selectedTown.nation ? {
              name: selectedTown.nation.name,
              color: selectedTown.nation.color,
              type: selectedTown.nation.type || 'Nation'
            } : undefined,
            population: selectedTown.population || 0,
            type: selectedTown.type || 'Town',
            status: selectedTown.status || 'Active',
            founded: selectedTown.founded || selectedTown.created_at,
            is_independent: selectedTown.is_independent || false,
            total_xp: selectedTown.total_xp || 0,
            level: selectedTown.level || 1,
            balance: selectedTown.balance || 0,
            location_x: selectedTown.location_x,
            location_z: selectedTown.location_z,
            created_at: selectedTown.created_at,
            updated_at: selectedTown.updated_at
          }}
          isOpen={showTownModal}
          onClose={() => {
            setShowTownModal(false);
            setSelectedTown(null);
          }}
        />
      )}
    </div>
  );
};

export default TownsTab; 