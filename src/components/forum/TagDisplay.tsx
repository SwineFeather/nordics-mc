import { Badge } from '@/components/ui/badge';
import { useForumTags } from '@/hooks/useForumTags';

interface TagDisplayProps {
  tagNames: string[];
  className?: string;
}

const TagDisplay = ({ tagNames, className = '' }: TagDisplayProps) => {
  const { tags } = useForumTags();

  if (!tagNames || tagNames.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tagNames.map((tagName) => {
        const tag = tags.find(t => t.name === tagName);
        if (!tag) return null;

        return (
          <Badge
            key={tagName}
            className="text-xs px-2 py-1"
            style={{
              backgroundColor: tag.color,
              color: 'white',
              border: 'none'
            }}
          >
            {tagName}
          </Badge>
        );
      })}
    </div>
  );
};

export default TagDisplay; 