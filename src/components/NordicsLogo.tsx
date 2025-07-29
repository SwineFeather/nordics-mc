
import React from 'react';

interface NordicsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const NordicsLogo: React.FC<NordicsLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/lovable-uploads/0d1f1e74-8b33-43ee-b7d9-6f13dda1788d.png" 
        alt="Nordics Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default NordicsLogo;
