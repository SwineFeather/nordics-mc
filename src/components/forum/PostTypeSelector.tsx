import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePostTypes } from '../../hooks/usePostTypes';

interface PostTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const { getAllPostTypes, getPostType } = usePostTypes();
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedType = getPostType(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (typeValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(typeValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-900 hover:bg-gray-50 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}
        `}
      >
        <div className="flex items-center gap-2">
          {selectedType && (
            <>
              <selectedType.icon className="w-4 h-4" style={{ color: selectedType.color }} />
              <span>{selectedType.label}</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {getAllPostTypes().map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={(e) => handleSelect(type.value, e)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50"
              >
                <type.icon className="w-4 h-4" style={{ color: type.color }} />
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 