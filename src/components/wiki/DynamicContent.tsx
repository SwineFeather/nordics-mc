import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  MapPin, 
  Crown, 
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Town {
  id: string;
  name: string;
  mayor: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
}

interface Nation {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  capital: string;
  leader: string;
  population: number;
  bank: string;
  daily_upkeep: string;
  founded: string;
  lore: string;
  government: string;
  motto: string;
  specialties: string[];
  history?: string;
}

interface DynamicContentProps {
  type: 'nation-towns' | 'town-residents' | 'nation-info';
  nationId?: string;
  townId?: string;
  title?: string;
  className?: string;
}

const DynamicContent = ({ 
  type, 
  nationId, 
  townId, 
  title,
  className = "" 
}: DynamicContentProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (type) {
        case 'nation-towns':
          if (!nationId) throw new Error('Nation ID is required');
          const { data: towns, error: townsError } = await supabase
            .from('towns')
            .select('*')
            .eq('nation_id', nationId)
            .order('population', { ascending: false });
          
          if (townsError) throw townsError;
          setData(towns || []);
          break;

        case 'town-residents':
          if (!townId) throw new Error('Town ID is required');
          // This would need to be implemented based on your residents table structure
          // For now, we'll show a placeholder
          setData([]);
          break;

        case 'nation-info':
          if (!nationId) throw new Error('Nation ID is required');
          const { data: nation, error: nationError } = await supabase
            .from('nations')
            .select('*')
            .eq('id', nationId)
            .single();
          
          if (nationError) throw nationError;
          setData([nation]);
          break;

        default:
          throw new Error(`Unknown content type: ${type}`);
      }
    } catch (err) {
      console.error(`Error loading ${type} data:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type, nationId, townId]);

  const renderNationTowns = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Error loading towns: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No towns found in this nation</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((town: Town) => (
          <Card key={town.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{town.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {town.type}
                    </Badge>
                    {town.is_independent && (
                      <Badge variant="secondary" className="text-xs">
                        Independent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Crown className="w-3 h-3" />
                      <span>{town.mayor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{town.population} residents</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{town.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTownResidents = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Error loading residents: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    // Placeholder for residents - this would need to be implemented based on your data structure
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Resident data not yet implemented</p>
        <p className="text-xs">This will show current residents when the data structure is available</p>
      </div>
    );
  };

  const renderNationInfo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }

    if (error || data.length === 0) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Error loading nation info: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    const nation: Nation = data[0];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Leader</span>
            </div>
            <p className="text-sm">{nation.leader}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Capital</span>
            </div>
            <p className="text-sm">{nation.capital}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Population</span>
            </div>
            <p className="text-sm">{nation.population.toLocaleString()}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Type</span>
            </div>
            <p className="text-sm">{nation.type}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Specialties</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {nation.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Motto</span>
          </div>
          <p className="text-sm italic">"{nation.motto}"</p>
        </div>
      </div>
    );
  };

  const getContent = () => {
    switch (type) {
      case 'nation-towns':
        return renderNationTowns();
      case 'town-residents':
        return renderTownResidents();
      case 'nation-info':
        return renderNationInfo();
      default:
        return <div>Unknown content type</div>;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'nation-towns':
        return 'Nation Towns';
      case 'town-residents':
        return 'Town Residents';
      case 'nation-info':
        return 'Nation Information';
      default:
        return 'Dynamic Content';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {type === 'nation-towns' && <Building className="w-5 h-5" />}
          {type === 'town-residents' && <Users className="w-5 h-5" />}
          {type === 'nation-info' && <Crown className="w-5 h-5" />}
          <span>{getTitle()}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getContent()}
      </CardContent>
    </Card>
  );
};

export default DynamicContent; 