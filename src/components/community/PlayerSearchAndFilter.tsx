
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PlayerSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterOnline: boolean;
  onFilterOnlineChange: (online: boolean) => void;
  totalResults: number;
}

const PlayerSearchAndFilter = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterOnline,
  onFilterOnlineChange,
  totalResults
}: PlayerSearchAndFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search players by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority (Influence + Badges)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="playtime">Playtime</SelectItem>
                    <SelectItem value="medals">Medal Points</SelectItem>
                    <SelectItem value="activity">Influence Score</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant={filterOnline ? "default" : "outline"}
                  onClick={() => onFilterOnlineChange(!filterOnline)}
                  className="w-full"
                >
                  {filterOnline ? "Showing Online Only" : "Show Online Only"}
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onSearchChange('');
                    onSortChange('level');
                    onFilterOnlineChange(false);
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalResults} player{totalResults !== 1 ? 's' : ''} found
              {searchTerm && searchTerm.trim().length >= 2 && (
                <span className="ml-2 text-xs">
                  (Searching all players, not just top 48)
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {filterOnline && (
                <Badge variant="secondary">
                  Online Only
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSearchAndFilter;
