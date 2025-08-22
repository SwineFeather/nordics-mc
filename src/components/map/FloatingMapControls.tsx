
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
  ChevronUp,
  MapPin
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
  showPins: boolean;
  onTogglePins: () => void;
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
  showPins,
  onTogglePins
}: FloatingMapControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop Controls */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 space-y-2 hidden sm:block">
        {/* Zoom Controls - Always visible, icon-only on mobile */}
        <Card className="shadow-lg">
          <CardContent className="p-1 sm:p-2">
            <div className="flex flex-col gap-1">
              <Button variant="outline" size="sm" onClick={onZoomIn} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onZoomOut} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onReset} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expandable Controls */}
        <Card className="shadow-lg">
          <CardContent className="p-1 sm:p-2">
            <div className="flex flex-col gap-1">
              {/* Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {/* Expanded Controls */}
              {isExpanded && (
                <div className="space-y-1 mt-1">
                  {/* Search Input - Hidden on mobile to save space */}
                  <div className="hidden sm:block">
                    <Input
                      placeholder="Search pins..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-32 h-8 text-xs"
                    />
                  </div>

                  {/* Category Filter - Hidden on mobile to save space */}
                  <div className="hidden sm:block">
                    <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        <SelectItem value="town">Towns</SelectItem>
                        <SelectItem value="nation">Nations</SelectItem>
                        <SelectItem value="landmark">Landmarks</SelectItem>
                        <SelectItem value="event">Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle Buttons - Icon only on mobile */}
                  <div className="flex gap-1">
                    <Button
                      variant={showGrid ? "default" : "outline"}
                      size="sm"
                      onClick={onToggleGrid}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      title="Toggle Grid"
                    >
                      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  
                  {/* Show/Hide Pins Toggle - Icon only on mobile */}
                  <Button
                    variant={showPins ? "default" : "outline"}
                    size="sm"
                    onClick={onTogglePins}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    title={showPins ? 'Hide Pins' : 'Show Pins'}
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  {/* Export - Icon only on mobile */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onExport} 
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    title="Export Map"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  {/* Zoom Info - Hidden on mobile to save space */}
                  <div className="hidden sm:block text-xs text-center text-muted-foreground">
                    Zoom: {Math.round(zoom * 100)}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Controls - Floating Action Button */}
      <div className="absolute bottom-4 right-4 z-20 sm:hidden">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={onZoomIn} className="h-10 w-10 p-0">
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={onZoomOut} className="h-10 w-10 p-0">
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={onReset} className="h-10 w-10 p-0">
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={onToggleGrid}
                className="h-10 w-10 p-0"
                title="Toggle Grid"
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button
                variant={showPins ? "default" : "outline"}
                size="sm"
                onClick={onTogglePins}
                className="h-10 w-10 p-0"
                title={showPins ? 'Hide Pins' : 'Show Pins'}
              >
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FloatingMapControls;

