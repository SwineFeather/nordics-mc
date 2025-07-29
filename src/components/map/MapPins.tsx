
import { useState, useEffect } from 'react';
import { 
  Pin, 
  Flag, 
  MapPin, 
  Star, 
  AlertTriangle, 
  Info, 
  MoreVertical, 
  Edit, 
  Building, 
  Eye, 
  Sword, 
  Shield, 
  Crown, 
  Coins, 
  Anchor, 
  Mountain, 
  Trees, 
  Flame, 
  Zap, 
  Heart, 
  Target, 
  Compass, 
  Home,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import EditPinModal from './EditPinModal';
import { useSupabaseNations } from '@/hooks/useSupabaseNations';
import TownDetails from '@/components/TownDetails';

interface MapPin {
  id: string;
  map_date: string;
  x_position: number;
  y_position: number;
  icon: string;
  color: string;
  title?: string;
  description?: string;
  author_id: string;
  created_at: string;
  category: string;
  town_id?: string;
  is_hidden: boolean;
  size: string;
  author: {
    full_name: string;
    role: string;
  };
}

interface MapPinsProps {
  mapDate: string;
  zoom: number;
  viewportPosition: { x: number; y: number };
  imageRef: React.RefObject<HTMLImageElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  searchTerm: string;
  categoryFilter: string;
  showHiddenPins: boolean;
}

const iconMap = {
  pin: Pin,
  flag: Flag,
  map: MapPin,
  star: Star,
  alert: AlertTriangle,
  info: Info,
  building: Building,
  eye: Eye,
  sword: Sword,
  shield: Shield,
  crown: Crown,
  coins: Coins,
  anchor: Anchor,
  mountain: Mountain,
  trees: Trees,
  flame: Flame,
  zap: Zap,
  heart: Heart,
  target: Target,
  compass: Compass,
  home: Home,
  circle: Circle,
};

const MapPins = ({ 
  mapDate, 
  zoom, 
  viewportPosition, 
  imageRef, 
  containerRef,
  searchTerm,
  categoryFilter,
  showHiddenPins
}: MapPinsProps) => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [selectedTown, setSelectedTown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { towns } = useSupabaseNations();

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const fetchPins = async () => {
    try {
      const { data, error } = await supabase
        .from('map_pins')
        .select(`
          *,
          author:profiles(full_name, role)
        `)
        .eq('map_date', mapDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPins(data || []);
    } catch (error) {
      console.error('Error fetching pins:', error);
      toast.error('Failed to load pins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel('map-pins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'map_pins',
          filter: `map_date=eq.${mapDate}`
        },
        () => {
          fetchPins();
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to pin updates:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapDate]);

  const getPinPosition = (pin: MapPin) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: 0, y: 0 };

    const x = (pin.x_position / 100) * containerRect.width * zoom + viewportPosition.x;
    const y = (pin.y_position / 100) * containerRect.height * zoom + viewportPosition.y;

    return { x, y };
  };

  const handleDeletePin = async (pinId: string) => {
    try {
      const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('id', pinId);

      if (error) throw error;
      
      toast.success('Pin deleted');
      setSelectedPin(null);
    } catch (error) {
      console.error('Error deleting pin:', error);
      toast.error('Failed to delete pin');
    }
  };

  const handlePinClick = (pin: MapPin) => {
    if (pin.category === 'town' && pin.town_id) {
      // Find the town by name from our Supabase data
      const town = towns.find(t => t.name === pin.town_id);
      if (town) {
        // Convert to the format expected by TownDetails
        const townDetail = {
          ...town,
          nation: town.is_independent ? 'Independent' : (town.nation?.name || 'Unknown'),
          nationColor: town.is_independent ? 'text-gray-500' : (town.nation?.color || 'text-gray-500')
        };
        setSelectedTown(townDetail);
      } else {
        toast.error('Town details not found');
      }
    } else {
      setSelectedPin(selectedPin === pin.id ? null : pin.id);
    }
  };

  const filteredPins = pins.filter(pin => {
    // Category filter
    if (categoryFilter !== 'all' && pin.category !== categoryFilter) {
      return false;
    }

    // Hidden pins filter
    if (pin.is_hidden && !showHiddenPins) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = pin.title?.toLowerCase().includes(searchLower);
      const descriptionMatch = pin.description?.toLowerCase().includes(searchLower);
      const authorMatch = pin.author?.full_name.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !descriptionMatch && !authorMatch) {
        return false;
      }
    }

    return true;
  });

  const getPinSize = (size: string) => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-5 h-5';
      case 'big': return 'w-6 h-6';
      default: return 'w-6 h-6';
    }
  };

  if (loading) return null;

  return (
    <>
      {filteredPins.map((pin) => {
        const pos = getPinPosition(pin);
        const isSelected = selectedPin === pin.id;
        const IconComponent = iconMap[pin.icon as keyof typeof iconMap] || Pin;

        // Adjust styling for hidden pins
        const pinOpacity = pin.is_hidden ? 0.6 : 1;
        const pinSize = getPinSize(pin.size);

        return (
          <div key={pin.id}>
            {/* Pin Icon */}
            <div
              className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: pos.x, 
                top: pos.y,
                opacity: pinOpacity
              }}
              onClick={() => handlePinClick(pin)}
            >
              <div className={`relative ${isSelected ? 'z-20' : 'z-10'}`}>
                <div className="relative">
                  <IconComponent 
                    className={`${pinSize} drop-shadow-lg ${pin.icon === 'circle' ? 'animate-pulse' : ''}`}
                    style={{ color: pin.color }}
                  />
                  {pin.icon === 'circle' && (
                    <div 
                      className={`absolute inset-0 ${pinSize} rounded-full animate-ping opacity-30`}
                      style={{ backgroundColor: pin.color }}
                    />
                  )}
                </div>
                {pin.category === 'town' && (
                  <Building className="w-2 h-2 absolute -top-1 -right-1 text-blue-500" />
                )}
                {pin.category === 'lore' && (
                  <Eye className="w-2 h-2 absolute -top-1 -right-1 text-purple-500" />
                )}
              </div>
            </div>

            {/* Pin Popup - Only show for non-town pins or when not opening town details */}
            {isSelected && pin.category !== 'town' && (
              <div
                className="absolute z-30 w-80 max-w-sm"
                style={{
                  left: Math.min(pos.x + 20, window.innerWidth - 350),
                  top: Math.max(pos.y - 100, 20)
                }}
              >
                <Card className="shadow-lg border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {pin.author?.full_name || 'Staff'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {pin.author?.role}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            pin.category === 'town' ? 'border-blue-500 text-blue-600' :
                            pin.category === 'lore' ? 'border-purple-500 text-purple-600' :
                            'border-gray-500 text-gray-600'
                          }`}
                        >
                          {pin.category}
                        </Badge>
                      </div>
                      
                      {isStaff && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingPin(pin)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Pin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePin(pin.id)}
                              className="text-red-600"
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              Delete Pin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {pin.title && (
                      <h4 className="font-medium text-sm mb-1">{pin.title}</h4>
                    )}
                    
                    {pin.description && (
                      <p className="text-sm mb-2">{pin.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(pin.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <IconComponent className="w-3 h-3" style={{ color: pin.color }} />
                        <span className="capitalize">{pin.icon}</span>
                        {pin.is_hidden && (
                          <Badge variant="secondary" className="text-xs ml-1">Hidden</Badge>
                        )}
                        <Badge variant="outline" className="text-xs ml-1">
                          {pin.size === 'big' ? 'Large' : pin.size === 'medium' ? 'Medium' : 'Small'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      })}

      {/* Edit Pin Modal */}
      {editingPin && (
        <EditPinModal
          pin={editingPin}
          onClose={() => setEditingPin(null)}
          onUpdate={fetchPins}
        />
      )}

      {/* Town Details Modal */}
      {selectedTown && (
        <TownDetails 
          town={selectedTown} 
          onClose={() => setSelectedTown(null)} 
        />
      )}
    </>
  );
};

export default MapPins;
