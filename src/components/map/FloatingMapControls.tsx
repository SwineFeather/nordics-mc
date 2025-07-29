
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Search, 
  Filter,
  Grid3X3,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FloatingMapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (filter: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showHiddenPins: boolean;
  onToggleHiddenPins: () => void;
}

const FloatingMapControls = ({
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
}: FloatingMapControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 space-y-2">
      {/* Zoom Controls - Always visible */}
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" onClick={onZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expandable Controls */}
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mb-2"
          >
            <Settings className="w-4 h-4 mr-2" />
            Controls
            {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>

          {isExpanded && (
            <div className="space-y-3 w-64">
              {/* Search */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Search Pins</label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-7 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="town">Towns</SelectItem>
                    <SelectItem value="lore">Lore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Buttons */}
              <div className="flex gap-1">
                <Button
                  variant={showGrid ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleGrid}
                  className="flex-1"
                >
                  <Grid3X3 className="w-3 h-3 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={showHiddenPins ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleHiddenPins}
                  className="flex-1"
                >
                  {showHiddenPins ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  Hidden
                </Button>
              </div>

              {/* Export */}
              <Button variant="outline" size="sm" onClick={onExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Map
              </Button>

              {/* Zoom Info */}
              <div className="text-xs text-center text-muted-foreground">
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingMapControls;
