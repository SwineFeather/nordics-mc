
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, MapPin } from 'lucide-react';
import { SupabaseTownData } from '@/services/supabaseTownService';
import { TownProfilePicture } from './TownProfilePicture';

interface TownWithNationInfo extends Omit<SupabaseTownData, 'nation'> {
  nation: string;
  nationColor: string;
}

interface TownRowProps {
  town: SupabaseTownData;
  nationName: string;
  nationColor: string;
  onViewTown: (town: TownWithNationInfo) => void;
}

const TownRow: React.FC<TownRowProps> = ({ town, nationName, nationColor, onViewTown }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-6 h-6 flex-shrink-0">
          <TownProfilePicture 
            townName={town.name}
            imageUrl={(town as any).image_url}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{town.name}</h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Mayor: {town.mayor}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{town.population}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {town.type}
          </Badge>
          <Badge variant="outline" className={`text-xs ${nationColor} border-current`}>
            {town.status}
          </Badge>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onViewTown({ ...town, nation: nationName, nationColor } as TownWithNationInfo)}
        className="ml-2"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TownRow;
