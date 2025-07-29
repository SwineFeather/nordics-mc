import React from 'react';
import { usePostTypes } from '../../hooks/usePostTypes';

interface PostTypeBadgeProps {
  postType: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PostTypeBadge: React.FC<PostTypeBadgeProps> = ({ 
  postType, 
  size = 'sm', 
  showLabel = true 
}) => {
  const { getPostType } = usePostTypes();
  const typeInfo = getPostType(postType);

  if (!typeInfo) {
    return null;
  }

  const Icon = typeInfo.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${typeInfo.color}15`,
        color: typeInfo.color,
        border: `1px solid ${typeInfo.color}30`
      }}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{typeInfo.label}</span>}
    </div>
  );
}; 