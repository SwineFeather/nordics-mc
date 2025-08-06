
import React from 'react';

interface TownsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const TownsHeader: React.FC<TownsHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="text-center mb-12">
      {/* Header removed */}
    </div>
  );
};

export default TownsHeader;
