
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClaimButtonProps {
  onClaim: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({
  onClaim,
  isLoading = false,
  disabled = false,
  className,
  children = "Hold to Claim"
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  const HOLD_DURATION = 2000; // 2 seconds
  const PROGRESS_INTERVAL = 50; // Update every 50ms

  const startHold = useCallback(() => {
    if (disabled || isLoading) return;
    
    setIsHolding(true);
    setProgress(0);
    
    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current!);
      }
    }, PROGRESS_INTERVAL);
    
    // Complete hold after duration
    holdTimeoutRef.current = setTimeout(async () => {
      setIsShaking(true);
      try {
        await onClaim();
      } finally {
        endHold();
        // Reset shake after animation
        setTimeout(() => setIsShaking(false), 500);
      }
    }, HOLD_DURATION);
  }, [onClaim, disabled, isLoading]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300 font-semibold",
          "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400",
          "text-white shadow-lg hover:shadow-xl",
          isHolding && "scale-95 ring-4 ring-yellow-300",
          isShaking && "animate-bounce",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        disabled={disabled || isLoading}
        size="sm"
      >
        {/* Progress background */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 transition-transform duration-75 ease-out origin-left"
          style={{ 
            transform: `scaleX(${progress / 100})`,
            opacity: isHolding ? 0.8 : 0
          }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-1.5">
          {isHolding ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Trophy className="w-4 h-4" />
          )}
          <span className="text-sm">
            {isLoading ? 'Claiming...' : children}
          </span>
        </div>
      </Button>
      
      {/* Pulsing border when claimable */}
      {!isHolding && !disabled && (
        <div className="absolute inset-0 rounded-md border-2 border-yellow-400 animate-pulse opacity-60 pointer-events-none" />
      )}
    </div>
  );
};
