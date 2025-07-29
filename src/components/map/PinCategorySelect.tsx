
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pin, MapPin, Eye, Building } from 'lucide-react';

interface PinCategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const categoryOptions = [
  { value: 'regular', label: 'Regular Pin', icon: Pin, description: 'Standard map marker' },
  { value: 'town', label: 'Town Pin', icon: Building, description: 'Links to town information' },
  { value: 'lore', label: 'Lore Pin', icon: Eye, description: 'Hidden lore and story content' },
];

const PinCategorySelect = ({ value, onValueChange }: PinCategorySelectProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Pin Category</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select pin category" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PinCategorySelect;
