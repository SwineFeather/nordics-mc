
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';
import { useSupabaseNations } from '@/hooks/useSupabaseNations';

interface TownSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const TownSelect = ({ value, onValueChange, disabled = false }: TownSelectProps) => {
  const { towns, loading } = useSupabaseNations();

  if (loading) {
    return (
      <div>
        <label className="text-sm font-medium mb-2 block">Select Town</label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Select Town</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a town..." />
        </SelectTrigger>
        <SelectContent>
          {towns.map((town) => (
            <SelectItem key={town.id} value={town.name}>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <div>
                  <div className="font-medium">{town.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {town.is_independent ? 'Independent' : town.nation?.name}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TownSelect;
