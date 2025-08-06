
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Pin, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MapPins from './MapPins';
import PinModal from './PinModal';
import DiscussionSidebar from './DiscussionSidebar';
import MapTimeline from './MapTimeline';
import FloatingMapControls from './FloatingMapControls';
import PinsList from './PinsList';

const MapContainer = () => {
  // Available political map dates - updated with 4 new maps
  const availableDates = [
    { value: '2025-04-20', label: 'April 20, 2025', file: '2025-04-20.jpg' },
    { value: '2024-02-24', label: 'February 24, 2024', file: '2024-02-24.png' },
    { value: '2024-01-06', label: 'January 6, 2024', file: '2024-01-06.png' },
    { value: '2023-12-21', label: 'December 21, 2023', file: '2023-12-21.jpg' },
    { value: '2023-11-12', label: 'November 12, 2023', file: '2023-11-12.png' },
    { value: '2023-10-29', label: 'October 29, 2023', file: '2023-10-29.png' },
    { value: '2023-10-10', label: 'October 10, 2023', file: '2023-10-10.png' },
    { value: '2023-10-08', label: 'October 8, 2023', file: '2023-10-08.png' },
    { value: '2023-10-02', label: 'October 2, 2023', file: '2023-10-02.png' },
    { value: '2023-10-01', label: 'October 1, 2023', file: '2023-10-01.png' },
  ];

  const { mapDate } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedDate, setSelectedDate] = useState(mapDate || availableDates[0].value);
  const [zoom, setZoom] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pinModalData, setPinModalData] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showGrid, setShowGrid] = useState(false);
  const [showHiddenPins, setShowHiddenPins] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const currentMap = availableDates.find(date => date.value === selectedDate);
  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  // Update URL when date changes
  useEffect(() => {
    if (mapDate !== selectedDate) {
      navigate(`/map/${selectedDate}`, { replace: true });
    }
  }, [selectedDate, mapDate, navigate]);

  // Set selected date from URL
  useEffect(() => {
    if (mapDate && availableDates.find(d => d.value === mapDate)) {
      setSelectedDate(mapDate);
    }
  }, [mapDate]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setViewportPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isAddingPin) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewportPosition.x,
      y: e.clientY - viewportPosition.y
    });
  }, [viewportPosition, isAddingPin]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setViewportPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse-anchored zoom implementation
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 5);
    
    // Calculate the new viewport position to keep the mouse position fixed
    const zoomChange = newZoom / zoom;
    const newX = mouseX - (mouseX - viewportPosition.x) * zoomChange;
    const newY = mouseY - (mouseY - viewportPosition.y) * zoomChange;
    
    setZoom(newZoom);
    setViewportPosition({ x: newX, y: newY });
  }, [zoom, viewportPosition]);

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (!isAddingPin || !user || !isStaff) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left - viewportPosition.x) / zoom) / (rect.width) * 100;
    const y = ((e.clientY - rect.top - viewportPosition.y) / zoom) / (rect.height) * 100;

    setPinModalData({ x, y });
    setIsAddingPin(false);
  }, [isAddingPin, user, isStaff, viewportPosition, zoom]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setViewportPosition({ x: 0, y: 0 });
    setZoom(1);
    setImageLoaded(false);
  };

  const handleExport = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw the map image
    ctx.drawImage(imageRef.current, viewportPosition.x, viewportPosition.y, rect.width * zoom, rect.height * zoom);

    // Create download link
    const link = document.createElement('a');
    link.download = `political-map-${selectedDate}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [selectedDate, viewportPosition, zoom]);

  const handlePinUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-full flex">
      {/* Map Panel - Now full width */}
      <div className="flex-1 flex flex-col">
        {/* Simplified Header */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Political Map Timeline
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isStaff && (
                  <Button
                    variant={isAddingPin ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsAddingPin(!isAddingPin)}
                  >
                    <Pin className="w-4 h-4 mr-1" />
                    Add Pin
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Consolidated Timeline */}
        <MapTimeline 
          availableDates={availableDates}
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Map Display - Full width */}
        <div className="flex-1 m-4 mt-2 relative">
          {/* Map Container */}
          <div 
            ref={containerRef}
            className="w-full h-full relative bg-muted/20 rounded-lg overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleMapClick}
            style={{ cursor: isAddingPin ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}
          >
            {isAddingPin && (
              <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <div className="flex items-center gap-2 text-sm">
                  <Pin className="w-4 h-4" />
                  <span>Click on the map to add a pin</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAddingPin(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Viewport Container */}
            <div
              ref={viewportRef}
              className="absolute inset-0"
              style={{
                transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              {currentMap && (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  <img
                    ref={imageRef}
                    src={`/lovable-uploads/political-map/${currentMap.file}`}
                    alt={`Political map from ${currentMap.label}`}
                    className="w-full h-full object-contain"
                    onLoad={handleImageLoad}
                    draggable={false}
                  />

                  {/* Grid Overlay */}
                  {showGrid && imageLoaded && (
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full" style={{ opacity: 0.3 }}>
                        <defs>
                          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pins Layer */}
            {imageLoaded && showPins && (
              <MapPins 
                mapDate={selectedDate} 
                zoom={zoom}
                viewportPosition={viewportPosition}
                imageRef={imageRef}
                containerRef={containerRef}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                showHiddenPins={showHiddenPins}
              />
            )}

            {currentMap && (
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <p className="text-sm font-medium">{currentMap.label}</p>
              </div>
            )}
          </div>

          {/* Floating Controls */}
          <FloatingMapControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onExport={handleExport}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showPins={showPins}
            onTogglePins={() => setShowPins(!showPins)}
          />
        </div>
      </div>

      {/* Discussion Sidebar with Pins List */}
      <div className="w-80 border-l bg-background">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <DiscussionSidebar mapDate={selectedDate} />
          </div>
          <div className="border-t">
            <PinsList mapDate={selectedDate} onPinUpdate={handlePinUpdate} />
          </div>
        </div>
      </div>

      {/* Pin Modal */}
      {pinModalData && (
        <PinModal
          mapDate={selectedDate}
          x={pinModalData.x}
          y={pinModalData.y}
          onClose={() => setPinModalData(null)}
        />
      )}
    </div>
  );
};

export default MapContainer;
