import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { useForumTags } from '@/hooks/useForumTags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

const TagSelector = ({ selectedTags, onTagsChange, className = '' }: TagSelectorProps) => {
  const { tags, loading } = useForumTags();
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newTags);
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tagName) => {
            const tag = tags.find(t => t.name === tagName);
            if (!tag) return null;

            return (
              <Badge
                key={tagName}
                className="text-xs px-2 py-1 flex items-center gap-1"
                style={{
                  backgroundColor: tag.color,
                  color: 'white',
                  border: 'none'
                }}
              >
                {tagName}
                <button
                  onClick={() => removeTag(tagName)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Tag Selection */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          Select Tags
          <span className="text-xs text-muted-foreground">
            {selectedTags.length} selected
          </span>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            <div className="p-2 space-y-1">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.name)}
                    onCheckedChange={() => handleTagToggle(tag.name)}
                  />
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: tag.color,
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    {tag.name}
                  </Badge>
                  {tag.description && (
                    <span className="text-xs text-muted-foreground">
                      {tag.description}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector; 