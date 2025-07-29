import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Crown, 
  MapPin, 
  Star,
  Building2,
  Globe,
  RefreshCw,
  Bug
} from 'lucide-react';
import { TownProfilePicture } from './TownProfilePicture';
import { SupabaseTownService, SupabaseTownData } from '@/services/supabaseTownService';

interface TownListTabProps {
  searchTerm: string;
}

const TownListTab: React.FC<TownListTabProps> = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [towns, setTowns] = useState<SupabaseTownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        setLoading(true);
        const townsData = await SupabaseTownService.getAllTowns();
        setTowns(townsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching towns:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch towns');
      } finally {
        setLoading(false);
      }
    };

    fetchTowns();
  }, []);

  const filteredTowns = towns.filter(town =>
    town.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (town.nation?.name && town.nation.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    town.mayor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTownTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'Metropolis (Capital)': 'bg-purple-500',
      'Large Town (Capital)': 'bg-blue-500',
      'City (Capital)': 'bg-indigo-500',
      'Town (Capital)': 'bg-cyan-500',
      'Commune (Capital)': 'bg-green-500',
      'Metropolis': 'bg-purple-500',
      'Large Town': 'bg-blue-500',
      'City': 'bg-indigo-500',
      'Town': 'bg-cyan-500',
      'Settlement': 'bg-green-500',
      'Independent Town': 'bg-gray-500',
      'Independent Settlement': 'bg-gray-500',
    };
    return typeColors[type] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Royal City': 'bg-purple-500',
      'Open': 'bg-green-500',
      'Active': 'bg-blue-500',
      'Rebuilding': 'bg-yellow-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading towns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-2xl">
          <div className="text-4xl mb-4">🏘️</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Towns</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          
          {error.includes('empty') || error.includes('No towns found') ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Database Setup Required</h3>
              <p className="text-yellow-700 text-sm mb-3">
                The towns database appears to be empty. This usually means the database migration hasn't been run yet.
              </p>
              <div className="text-yellow-700 text-sm space-y-1">
                <p><strong>To fix this:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Run the migration: <code className="bg-yellow-100 px-1 rounded">20250616140125-1c14cbcf-9303-403c-aaf2-5abbdeacfdd0.sql</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Check the browser console for more detailed error information.
            </p>
          )}
          
          <div className="flex gap-2 justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  await SupabaseTownService.showExactDataSources();
                  alert('Check the browser console for detailed database information');
                } catch (err) {
                  console.error('Debug failed:', err);
                  alert('Debug failed. Check console for details.');
                }
              }}
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Debug Database
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">All Towns</h2>
        <p className="text-muted-foreground">
          Discover all {filteredTowns.length} towns on the server
        </p>
      </div>

      {/* Towns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTowns.map((town) => (
          <Card 
            key={town.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(`/town/${encodeURIComponent(town.name)}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center mr-2">
                  <TownProfilePicture 
                    townName={town.name}
                    imageUrl={(town as any).image_url}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate group-hover:text-primary transition-colors max-w-full">
                    {town.name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-1 mt-1 min-w-0 overflow-hidden">
                    <Badge className={`text-xs ${getTownTypeColor(town.type)}`}>{town.type}</Badge>
                    <Badge className={`text-xs ${getStatusColor(town.status)}`}>{town.status}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Mayor */}
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Mayor:</span>
                  <span className="font-medium truncate">{town.mayor || 'Unknown'}</span>
                </div>

                {/* Population */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Population:</span>
                  <span className="font-medium">{town.population || 0}</span>
                </div>

                {/* Nation */}
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nation:</span>
                  <span className="font-medium truncate">
                    {town.nation?.name || (town.is_independent ? 'Independent' : 'Unknown')}
                  </span>
                </div>

                {/* Level */}
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{town.level || 1}</span>
                </div>

                {/* Founded */}
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-medium truncate">{town.founded || 'Unknown'}</span>
                </div>
              </div>

              {/* View Button */}
              <Button 
                className="w-full mt-4 group-hover:bg-primary transition-colors"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/town/${encodeURIComponent(town.name)}`);
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View Town
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTowns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏘️</div>
          <h3 className="text-xl font-bold mb-2">No Towns Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `No towns match "${searchTerm}"` : 'No towns available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TownListTab; 