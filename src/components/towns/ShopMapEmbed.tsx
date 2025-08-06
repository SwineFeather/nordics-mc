import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  Loader2,
  Globe
} from 'lucide-react';

interface ShopMapEmbedProps {
  shopName: string;
  coordinates: { x: number; y: number; z: number };
  world: string;
  className?: string;
}

const ShopMapEmbed: React.FC<ShopMapEmbedProps> = ({ 
  shopName, 
  coordinates,
  world,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Construct the Bluemap URL with shop coordinates
  // Format: https://map.nordics.world/#world:1607:95:8092:182:0:0:0:1:flat
  // Where: world:x:y:z:zoom:rotation:pitch:yaw:perspective:projection
  const bluemapUrl = `https://map.nordics.world/#${world}:${coordinates.x}:${coordinates.y}:${coordinates.z}:1000:0:0:0:1:flat`;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOpenInNewTab = () => {
    window.open(bluemapUrl, '_blank');
  };

  const copyCoordinates = () => {
    const coordText = `${coordinates.x}, ${coordinates.y}, ${coordinates.z}`;
    navigator.clipboard.writeText(coordText);
    // You could add a toast notification here
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Live Map View</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCoordinates}
              className="text-xs"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Copy Coords
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open Full Map
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="text-center p-4">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Unable to load map view
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          {/* Map iframe */}
          <div 
            className={`relative bg-muted/20 transition-all duration-300 ${
              isExpanded ? 'h-[600px]' : 'h-64'
            }`}
          >
            <iframe
              src={bluemapUrl}
              title={`${shopName} on Nordics World Map`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms"
              loading="lazy"
            />
          </div>

          {/* Map Info Overlay */}
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="font-medium">{shopName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopMapEmbed; 