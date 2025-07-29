
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ 
  value: externalValue, 
  onChange: externalOnChange, 
  onFocus, 
  onBlur, 
  placeholder = "Search players, towns, companies...",
  className = ""
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = useState('');
  
  const value = externalValue !== undefined ? externalValue : internalValue;
  const onChange = externalOnChange || setInternalValue;

  const handleClear = () => {
    onChange('');
  };

  const handleSearch = () => {
    if (value.trim()) {
      // Navigate to community page with search functionality
      window.location.href = `/community?search=${encodeURIComponent(value.trim())}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10 rounded-xl bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200 hover:bg-background/70"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
          onClick={handleClear}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
