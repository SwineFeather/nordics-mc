
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Search, 
  Filter,
  Grid,
  Eye,
  EyeOff
} from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showHiddenPins: boolean;
  onToggleHiddenPins: () => void;
}

const MapControls = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onExport,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  showGrid,
  onToggleGrid,
  showHiddenPins,
  onToggleHiddenPins
}: MapControlsProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      {/* Zoom Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={onZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pins..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-2">
                <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="regular">Regular Pins</SelectItem>
                    <SelectItem value="town">Town Pins</SelectItem>
                    <SelectItem value="lore">Lore Pins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={onToggleGrid}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={showHiddenPins ? "default" : "outline"}
              size="sm"
              onClick={onToggleHiddenPins}
            >
              {showHiddenPins ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapControls;
