import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Building, 
  Users, 
  Shield, 
  Sword, 
  Coins, 
  Heart,
  Target,
  Eye,
  AlertTriangle,
  MapPin,
  Star,
  Flag
} from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  owner: string;
  type: 'town' | 'nation' | 'claim';
  color: string;
  coordinates: { x: number; z: number };
  size: number;
  level: number;
  population: number;
  resources: string[];
  claims: Territory[];
  defense: number;
  military: number;
  wealth: number;
  influence: number;
}

interface TerritoryPanelProps {
  territory: Territory | null;
  onClose: () => void;
  onClaim: () => void;
  onBuild: () => void;
  onDiplomacy: () => void;
  onMilitary: () => void;
}

const TerritoryPanel: React.FC<TerritoryPanelProps> = ({
  territory,
  onClose,
  onClaim,
  onBuild,
  onDiplomacy,
  onMilitary
}) => {
  if (!territory) return null;

  const getTerritoryIcon = () => {
    switch (territory.type) {
      case 'nation':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'town':
        return <Building className="w-6 h-6 text-blue-500" />;
      case 'claim':
        return <Flag className="w-6 h-6 text-orange-500" />;
      default:
        return <MapPin className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTerritoryColor = () => {
    switch (territory.type) {
      case 'nation':
        return 'border-yellow-200 bg-yellow-50';
      case 'town':
        return 'border-blue-200 bg-blue-50';
      case 'claim':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={`w-96 border-2 ${getTerritoryColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTerritoryIcon()}
            <CardTitle className="text-xl">{territory.name}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ×
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{territory.type}</Badge>
          <Badge variant="secondary">Level {territory.level}</Badge>
          <Badge variant="outline" className="text-xs">
            {territory.coordinates.x}, {territory.coordinates.z}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Owner Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Owner:</span>
          </div>
          <span className="text-sm font-semibold">{territory.owner}</span>
        </div>

        {/* Population */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Population</span>
          </div>
          <span className="text-lg font-bold">{territory.population.toLocaleString()}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Defense</span>
            </div>
            <Badge variant="outline" className="bg-blue-100">{territory.defense}</Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
            <div className="flex items-center gap-2">
              <Sword className="w-4 h-4 text-red-500" />
              <span className="text-sm">Military</span>
            </div>
            <Badge variant="outline" className="bg-red-100">{territory.military.toLocaleString()}</Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Wealth</span>
            </div>
            <Badge variant="outline" className="bg-yellow-100">{territory.wealth.toLocaleString()}</Badge>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-500" />
              <span className="text-sm">Influence</span>
            </div>
            <Badge variant="outline" className="bg-green-100">{territory.influence}</Badge>
          </div>
        </div>

        {/* Resources */}
        {territory.resources && territory.resources.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Resources
            </h4>
            <div className="flex flex-wrap gap-1">
              {territory.resources.map((resource: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {resource}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Claims */}
        {territory.claims && territory.claims.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Claims ({territory.claims.length})
            </h4>
            <div className="space-y-1">
              {territory.claims.slice(0, 3).map((claim, index) => (
                <div key={index} className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs">
                  <span>{claim.name}</span>
                  <Badge variant="outline" className="text-xs">Level {claim.level}</Badge>
                </div>
              ))}
              {territory.claims.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{territory.claims.length - 3} more claims
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onClaim}
            >
              <Target className="w-4 h-4 mr-2" />
              Claim
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onBuild}
            >
              <Building className="w-4 h-4 mr-2" />
              Build
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onDiplomacy}
            >
              <Eye className="w-4 h-4 mr-2" />
              Diplomacy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onMilitary}
            >
              <Sword className="w-4 h-4 mr-2" />
              Military
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerritoryPanel; 