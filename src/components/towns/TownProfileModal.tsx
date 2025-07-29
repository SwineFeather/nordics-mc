import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Users, 
  MapPin, 
  Calendar, 
  Building2, 
  MessageCircle, 
  Heart,
  ExternalLink,
  UserPlus,
  Shield,
  Star,
  TrendingUp,
  Globe,
  Eye,
  EyeOff,
  Trophy,
  Camera,
  ChevronDown,
  ChevronUp,
  Coins
} from 'lucide-react';
import { Town } from '@/types/town';
import DynmapEmbed from './DynmapEmbed';
import TownAchievements from './TownAchievements';
import TownPhotoGallery from './TownPhotoGallery';
import TownLevelDisplay from './TownLevelDisplay';
import { TownProfilePicture } from './TownProfilePicture';

interface TownProfileModalProps {
  town: Town;
  isOpen: boolean;
  onClose: () => void;
}

const TownProfileModal = ({ town, isOpen, onClose }: TownProfileModalProps) => {
  const [showMap, setShowMap] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [showGallery, setShowGallery] = useState(true);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown';
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span>{town.name}</span>
            </div>
            <Badge className={getTownTypeColor(town.type)}>
              {town.type}
            </Badge>
            <Badge className={getStatusColor(town.status)}>
              {town.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            A detailed view of {town.name} and its community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Town Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <TownProfilePicture 
                townName={town.name}
                className="h-20 w-20 rounded-full object-cover"
                imageUrl={(town as any).image_url}
              />
              
              <div>
                <h2 className="text-2xl font-bold">{town.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Mayor: {town.mayor}
                  </Badge>
                  {town.nation && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {town.nation.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Town Level Display */}
            <div className="flex-1 min-w-0">
              <TownLevelDisplay 
                totalXp={town.total_xp || 0} 
                currentLevel={town.level || 1}
              />
            </div>
          </div>

          {/* Town Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Population:</span>
              <span className="font-medium">{town.population}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Founded:</span>
              <span className="font-medium">{formatDate(town.founded)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total XP:</span>
              <span className="font-medium">{(town.total_xp || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">€{(town.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Request to Join
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Message Mayor
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Favorite
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Copy Link
            </Button>
          </div>

          {/* Live Map View */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              onClick={() => setShowMap(!showMap)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Live Map View</h3>
              </div>
              {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
            {showMap && (
              <DynmapEmbed 
                townName={town.name}
                coordinates={{ 
                  x: (town as any).location_x ?? 1708, 
                  z: (town as any).location_z ?? 7549 
                }}
                className="w-full"
              />
            )}
          </div>

          {/* Town Achievements */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              onClick={() => setShowAchievements(!showAchievements)}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Town Achievements</h3>
              </div>
              {showAchievements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
            {showAchievements && (
              <TownAchievements 
                townId={town.id}
                townName={town.name}
                townData={town}
              />
            )}
          </div>

          {/* Town Photo Gallery */}
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              onClick={() => setShowGallery(!showGallery)}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Photo Gallery</h3>
              </div>
              {showGallery ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
                         {showGallery && (
               <TownPhotoGallery townName={town.name} />
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TownProfileModal; 