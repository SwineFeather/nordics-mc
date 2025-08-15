
import React, { useState, useEffect } from 'react';
import { SupabaseTownService, SupabaseNationData, SupabaseTownData } from '@/services/supabaseTownService';
import NationCard from './NationCard';
import TownProfileModal from './TownProfileModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NationsTab: React.FC = () => {
  const [nations, setNations] = useState<(SupabaseNationData & { towns: SupabaseTownData[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedNations, setExpandedNations] = useState<Set<string>>(new Set());
  const [selectedTown, setSelectedTown] = useState<SupabaseTownData & { nation: string; nationColor: string } | null>(null);
  const [showTownModal, setShowTownModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const nationsData = await SupabaseTownService.getNationsWithTowns();
        setNations(nationsData);
      } catch (err) {
        console.error('Error fetching nations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch nations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleNationExpansion = (nationId: string) => {
    setExpandedNations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nationId)) {
        newSet.delete(nationId);
      } else {
        newSet.add(nationId);
      }
      return newSet;
    });
  };

  const handleViewTown = (town: SupabaseTownData & { nation: string; nationColor: string }) => {
    setSelectedTown(town);
    setShowTownModal(true);
  };

  const filteredNations = nations.filter(nation => {
    const matchesSearch = nation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nation.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nation.capital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || nation.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const nationTypes = Array.from(new Set(nations.map(nation => nation.type)));

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              // Test database connection first
              await SupabaseTownService.testDatabaseConnection();
              
              const nationsData = await SupabaseTownService.getNationsWithTowns();
              setNations(nationsData);
            } catch (err) {
              console.error('Error fetching nations:', err);
              setError(err instanceof Error ? err.message : 'Failed to fetch nations');
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
          <h2 className="text-2xl font-bold text-foreground">Nations & Alliances</h2>
          <p className="text-muted-foreground">
            {filteredNations.length} of {nations.length} nations
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
            placeholder="Search nations, leaders, or capitals..."
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
            <SelectItem value="all">All Types</SelectItem>
            {nationTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nations Grid */}
      {filteredNations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No nations found matching your criteria.</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
          : "space-y-4"
        }>
          {filteredNations.map((nation) => (
            <NationCard
              key={nation.id}
              nation={nation}
              isExpanded={expandedNations.has(nation.id)}
              onToggleExpand={() => toggleNationExpansion(nation.id)}
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
            population: selectedTown.population,
            type: selectedTown.type,
            status: selectedTown.status,
            founded: selectedTown.founded,
            nation: {
              name: selectedTown.nation,
              type: 'Nation',
              color: selectedTown.nationColor,
            },
            total_xp: selectedTown.total_xp || 0,
            level: selectedTown.level || 1,
            balance: selectedTown.balance || 0,
            location_x: selectedTown.location_x,
            location_z: selectedTown.location_z,
            is_independent: selectedTown.is_independent,
            created_at: selectedTown.created_at || new Date().toISOString(),
            updated_at: selectedTown.updated_at || new Date().toISOString()
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

export default NationsTab;
