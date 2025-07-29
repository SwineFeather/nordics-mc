
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Pin, 
  Flag, 
  MapPin, 
  Star, 
  AlertTriangle, 
  Info, 
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import PinCategorySelect from './PinCategorySelect';
import TownSelect from './TownSelect';

interface PinModalProps {
  mapDate: string;
  x: number;
  y: number;
  onClose: () => void;
}

const iconOptions = [
  { value: 'pin', label: 'Pin', icon: Pin },
  { value: 'flag', label: 'Flag', icon: Flag },
  { value: 'map', label: 'Map Pin', icon: MapPin },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'alert', label: 'Alert', icon: AlertTriangle },
  { value: 'info', label: 'Info', icon: Info },
  { value: 'building', label: 'Building', icon: Building },
  { value: 'eye', label: 'Eye', icon: Eye },
  { value: 'sword', label: 'Sword', icon: Sword },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'coins', label: 'Coins', icon: Coins },
  { value: 'anchor', label: 'Anchor', icon: Anchor },
  { value: 'mountain', label: 'Mountain', icon: Mountain },
  { value: 'trees', label: 'Trees', icon: Trees },
  { value: 'flame', label: 'Flame', icon: Flame },
  { value: 'zap', label: 'Lightning', icon: Zap },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'compass', label: 'Compass', icon: Compass },
  { value: 'home', label: 'Home', icon: Home },
  { value: 'circle', label: 'Circle (Pulsing)', icon: Circle },
];

const colorOptions = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
];

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'big', label: 'Big' },
];

const PinModal = ({ mapDate, x, y, onClose }: PinModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('pin');
  const [color, setColor] = useState('#ef4444');
  const [size, setSize] = useState('big');
  const [category, setCategory] = useState('regular');
  const [townId, setTownId] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add pins');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const pinData: any = {
        map_date: mapDate,
        x_position: x,
        y_position: y,
        icon,
        color,
        size,
        title: title.trim() || null,
        description: description.trim() || null,
        author_id: user.id,
        category,
        is_hidden: isHidden
      };

      if (category === 'town' && townId) {
        pinData.town_id = townId;
      }

      const { error } = await supabase
        .from('map_pins')
        .insert(pinData);

      if (error) throw error;

      toast.success('Pin added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding pin:', error);
      toast.error('Failed to add pin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = iconOptions.find(opt => opt.value === icon)?.icon || Pin;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pin</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title (optional)</label>
            <Input
              placeholder="Pin title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Textarea
              placeholder="Pin description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <PinCategorySelect 
            value={category} 
            onValueChange={setCategory}
          />

          {category === 'town' && (
            <TownSelect 
              value={townId} 
              onValueChange={setTownId}
            />
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Icon</label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: option.value }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hidden" 
              checked={isHidden}
              onCheckedChange={(checked) => setIsHidden(checked === true)}
            />
            <label htmlFor="hidden" className="text-sm font-medium">
              Hidden Pin (subtle appearance)
            </label>
          </div>

          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <div className="relative">
                <SelectedIcon 
                  className={`${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'} ${icon === 'circle' ? 'animate-pulse' : ''}`} 
                  style={{ color }} 
                />
                {icon === 'circle' && (
                  <div 
                    className={`absolute inset-0 ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'} rounded-full animate-ping opacity-30`}
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Position: {x.toFixed(1)}%, {y.toFixed(1)}%
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Pin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinModal;
