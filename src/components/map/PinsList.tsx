import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pin, 
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
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

interface PinsListProps {
  mapDate: string;
  onPinUpdate: () => void;
}

const PinsList = ({ mapDate, onPinUpdate }: PinsListProps) => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useAuth();

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
        .order('created_at', { ascending: false });

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
  }, [mapDate]);

  const handleDeletePin = async (pinId: string) => {
    try {
      const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('id', pinId);

      if (error) throw error;
      
      toast.success('Pin deleted');
      fetchPins();
      onPinUpdate();
    } catch (error) {
      console.error('Error deleting pin:', error);
      toast.error('Failed to delete pin');
    }
  };

  const filteredPins = pins.filter(pin => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = pin.title?.toLowerCase().includes(searchLower);
    const descriptionMatch = pin.description?.toLowerCase().includes(searchLower);
    const authorMatch = pin.author?.full_name.toLowerCase().includes(searchLower);
    
    return titleMatch || descriptionMatch || authorMatch;
  });

  const getSizeDisplay = (size: string) => {
    switch (size) {
      case 'small': return 'S';
      case 'medium': return 'M';
      case 'big': return 'L';
      default: return 'L';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
          >
            <span className="text-sm sm:text-base">Map Pins ({filteredPins.length})</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardTitle>
        {isExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredPins.length === 0 ? (
              <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                {searchTerm ? 'No pins match your search' : 'No pins on this map'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPins.map((pin) => {
                  return (
                    <div
                      key={pin.id}
                      className="flex items-center justify-between p-2 sm:p-3 hover:bg-muted/50 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <Pin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: pin.color }} />
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 text-xs h-4 w-4 p-0 flex items-center justify-center"
                          >
                            {getSizeDisplay(pin.size)}
                          </Badge>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-medium text-xs sm:text-sm truncate">
                              {pin.title || 'Untitled Pin'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {pin.category}
                            </Badge>
                            {pin.is_hidden && (
                              <Badge variant="secondary" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {pin.description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {pin.author?.full_name} • {new Date(pin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isStaff && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
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
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Pin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      )}

      {editingPin && (
        <EditPinModal
          pin={editingPin}
          onClose={() => setEditingPin(null)}
          onUpdate={() => {
            fetchPins();
            onPinUpdate();
          }}
        />
      )}
    </Card>
  );
};

export default PinsList;
