
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '@/hooks/useProfiles';
import { useWikiData } from '@/hooks/useWikiData';
import { useCompaniesData } from '@/hooks/useCompaniesData';
import { SupabaseTownService, SupabaseNationData, SupabaseTownData } from '@/services/supabaseTownService';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { User, Building2, MapPin, FileText, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  type: 'player' | 'town' | 'company' | 'wiki' | 'nation';
  description?: string;
  priority?: number;
  data?: any;
  onClick: () => void;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [nations, setNations] = useState<(SupabaseNationData & { towns: SupabaseTownData[] })[]>([]);
  const [towns, setTowns] = useState<SupabaseTownData[]>([]);
  const navigate = useNavigate();

  const { profiles } = useProfiles({ fetchAll: true });
  const { categories: wikiCategories } = useWikiData();
  const { companies } = useCompaniesData();

  useEffect(() => {
    if (!open) {
      setTimeout(() => setSearchTerm(''), 150);
    }
  }, [open]);

  // Fetch nations and towns data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nationsData, townsData] = await Promise.all([
          SupabaseTownService.getNationsWithTowns(),
          SupabaseTownService.getAllTowns()
        ]);
        setNations(nationsData);
        setTowns(townsData);
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };
    
    fetchData();
  }, []);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const allResults: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    const getMatchScore = (term: string, fields: string[]): number => {
      let score = 0;
      const lowerTerm = term.toLowerCase();
      fields.forEach(field => {
        const lowerField = (field || '').toLowerCase();
        if (lowerField === lowerTerm) score += 100;
        else if (lowerField.startsWith(lowerTerm)) score += 50;
        else if (lowerField.includes(lowerTerm)) score += 25;
      });
      return score;
    };

    profiles.forEach(profile => {
        const matchScore = getMatchScore(term, [profile.username, profile.displayName || '', profile.minecraft_username || '']);
        if (matchScore > 0) {
            allResults.push({
                id: profile.id,
                title: profile.displayName || profile.username,
                type: 'player',
                description: `${profile.role || 'Player'} • ${profile.town || 'No town'}`,
                priority: matchScore,
                data: profile,
                onClick: () => {
                  // Navigate to community page with player parameter
                  navigate(`/community?player=${encodeURIComponent(profile.username || profile.displayName)}`);
                }
            });
        }
    });

    nations.forEach(nation => {
      if (getMatchScore(term, [nation.name]) > 0) {
        allResults.push({ 
          id: nation.id, 
          title: nation.name, 
          type: 'nation', 
          description: `${nation.towns?.length || 0} towns`, 
          priority: getMatchScore(term, [nation.name]), 
          onClick: () => navigate('/towns') 
        });
      }
      nation.towns?.forEach(town => {
        if (getMatchScore(term, [town.name]) > 0) {
          allResults.push({ 
            id: `${nation.id}-${town.name}`, 
            title: town.name, 
            type: 'town', 
            description: `Town in ${nation.name}`, 
            priority: getMatchScore(term, [town.name]), 
            onClick: () => navigate('/towns') 
          });
        }
      });
    });

    // Also search through all towns for independent towns
    towns.forEach(town => {
      if (town.is_independent && getMatchScore(term, [town.name]) > 0) {
        allResults.push({ 
          id: `independent-${town.name}`, 
          title: town.name, 
          type: 'town', 
          description: 'Independent Town', 
          priority: getMatchScore(term, [town.name]), 
          onClick: () => navigate('/towns') 
        });
      }
    });

    companies.forEach(company => {
        if (getMatchScore(term, [company.name]) > 0) {
            allResults.push({ id: company.id, title: company.name, type: 'company', description: company.industry, priority: getMatchScore(term, [company.name]), onClick: () => navigate('/towns') });
        }
    });

    wikiCategories.forEach(category => {
        category.pages.forEach(page => {
            if (getMatchScore(term, [page.title, page.content]) > 0) {
                allResults.push({ id: page.id, title: page.title, type: 'wiki', description: `Wiki • ${category.title}`, priority: getMatchScore(term, [page.title, page.content]), onClick: () => navigate(`/wiki/${page.slug}`) });
            }
        });
    });

    return allResults.sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 10);
  }, [searchTerm, profiles, nations, towns, companies, wikiCategories, navigate]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'player': return <User className="w-4 h-4" />;
      case 'town': return <MapPin className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'wiki': return <FileText className="w-4 h-4" />;
      case 'nation': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search players, towns, wiki..." value={searchTerm} onValueChange={setSearchTerm} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Search Results">
            {results.map((result) => (
              <CommandItem key={result.id} value={result.title} onSelect={() => handleSelect(result.onClick)}>
                <div className="flex items-center space-x-3 w-full group">
                  <div className="p-2 rounded-lg bg-muted/50 transition-colors duration-200">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 capitalize">
                    {result.type}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
