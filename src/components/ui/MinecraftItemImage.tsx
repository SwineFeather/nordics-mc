import React, { useState } from 'react';
import { getItemImageUrl, getItemIcon } from '@/utils/marketplaceUtils';

interface MinecraftItemImageProps {
  itemType: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  showFallback?: boolean;
}

const MinecraftItemImage: React.FC<MinecraftItemImageProps> = ({ 
  itemType, 
  size = 'lg', 
  className = '',
  showFallback = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
    '3xl': 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
    '3xl': 'text-6xl'
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // If image failed to load or we're showing fallback, use emoji
  if (imageError || !showFallback) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <span className={textSizes[size]}>{getItemIcon(itemType)}</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded w-full h-full"></div>
        </div>
      )}
      <img
        src={getItemImageUrl(itemType)}
        alt={itemType}
        className={`w-full h-full object-scale-down ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        style={{ 
          imageRendering: 'pixelated',
          transform: 'scale(2.5)',
          transformOrigin: 'center'
        }}
      />
    </div>
  );
};

export default MinecraftItemImage; 