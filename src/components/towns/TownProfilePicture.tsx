import React, { useState } from 'react';
import { getTownProfilePicture, handleTownImageLoad } from '@/types/town';

interface TownProfilePictureProps {
  townName: string;
  className?: string;
  fallbackSrc?: string;
  style?: React.CSSProperties;
  imageUrl?: string | null;
}

export const TownProfilePicture: React.FC<TownProfilePictureProps> = ({
  townName,
  className = '',
  fallbackSrc = '/placeholder.svg',
  style = {},
  imageUrl,
}) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 300, height: 200 });
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const profilePicture = getTownProfilePicture(townName, imageUrl);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageLoaded(true);
    handleTownImageLoad(event, setImageDimensions);
  };

  const handleError = () => {
    setImageError(true);
  };

  // Let images display at their natural size with max constraints
  // Only apply default constraints if no specific dimensions are provided via className
  const hasCustomDimensions = className.includes('h-') || className.includes('w-') || 
                             (style.width && style.width !== 'auto') || 
                             (style.height && style.height !== 'auto');
  
  const defaultStyle = hasCustomDimensions ? {
    ...style,
    maxWidth: '80%',
    maxHeight: '80%',
    width: 'auto',
    height: 'auto'
  } : {
    ...style,
    maxWidth: '32px',
    maxHeight: '32px',
    width: 'auto',
    height: 'auto'
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        style={defaultStyle}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🏘️</div>
          <div className="text-xs text-gray-600 font-medium truncate">{townName}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={profilePicture.url}
        alt={`${townName} town profile`}
        className={`transition-opacity duration-300`}
        style={defaultStyle}
        onLoad={handleLoad}
        onError={handleError}
      />
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center animate-pulse"
          style={defaultStyle}
        >
          <div className="text-center">
            <div className="text-xl mb-1">⏳</div>
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add default export for compatibility
export default TownProfilePicture; 