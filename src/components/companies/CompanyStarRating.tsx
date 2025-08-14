import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompanyStarRatingProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const CompanyStarRating: React.FC<CompanyStarRatingProps> = ({ 
  rating, 
  reviewCount, 
  size = 'md',
  showCount = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (rating === 0 && reviewCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${sizeClasses[size]} text-gray-300`}
            />
          ))}
        </div>
        {showCount && (
          <span className={`${textSize[size]} text-muted-foreground`}>
            No ratings yet
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {renderStars()}
      {showCount && (
        <div className="flex items-center gap-1">
          <span className={`${textSize[size]} font-medium`}>
            {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
          </span>
          {rating > 0 && (
            <span className={`${textSize[size]} text-muted-foreground`}>
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyStarRating;
