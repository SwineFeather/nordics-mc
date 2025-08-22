import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MapTimelineProps {
  availableDates: Array<{ value: string; label: string; file: string }>;
  currentDate: string;
  onDateChange: (date: string) => void;
}

const MapTimeline = ({ availableDates, currentDate, onDateChange }: MapTimelineProps) => {
  const currentIndex = availableDates.findIndex(date => date.value === currentDate);
  
  const handlePrevious = () => {
    if (currentIndex < availableDates.length - 1) {
      onDateChange(availableDates[currentIndex + 1].value);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      onDateChange(availableDates[currentIndex - 1].value);
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 sm:p-3 mx-2 sm:mx-4 mb-2">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex >= availableDates.length - 1}
          className="text-xs sm:text-sm"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Earlier</span>
          <span className="sm:hidden">←</span>
        </Button>
        
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium">
            {availableDates[currentIndex]?.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentIndex + 1} of {availableDates.length}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex <= 0}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Later</span>
          <span className="sm:hidden">→</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 sm:mt-3 w-full bg-muted rounded-full h-1.5 sm:h-2">
        <div 
          className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${((availableDates.length - currentIndex - 1) / (availableDates.length - 1)) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default MapTimeline;
