
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WikiSearchBarProps {
  onSearchChange: (term: string) => void;
}

const WikiSearchBar = ({ onSearchChange }: WikiSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search wiki..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10 rounded-xl bg-background/50 border-border/50"
      />
    </div>
  );
};

export default WikiSearchBar;
