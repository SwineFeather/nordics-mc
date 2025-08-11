import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Loader2
} from 'lucide-react';
import { useAllResidents } from '@/hooks/usePlayerResidentData';
import SharedPlayerCard from './SharedPlayerCard';
import type { PlayerProfile } from '@/types/player';



interface PlayerSearchResultsProps {
  players: PlayerProfile[];
  loading: boolean;
  searchTerm: string;
  onPlayerClick: (player: PlayerProfile) => void;
}

const PlayerSearchResults = ({ 
  players, 
  loading, 
  searchTerm, 
  onPlayerClick 
}: PlayerSearchResultsProps) => {
  const { data: allResidents } = useAllResidents();



  if (loading) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching for players...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0 && searchTerm.trim().length >= 2) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-6 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            No players found matching "{searchTerm}"
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term or check the spelling
          </p>
        </CardContent>
      </Card>
    );
  }

  if (searchTerm.trim().length < 2) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          Found {players.length} player{players.length !== 1 ? 's' : ''} for "{searchTerm}"
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <SharedPlayerCard
            key={player.id}
            profile={player}
            onClick={() => onPlayerClick(player)}
            allResidents={allResidents || []}
            showDetailedStats={true}
            isSearchResult={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerSearchResults; 