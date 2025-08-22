
import { sanitizeMarkdown } from '@/utils/htmlSanitizer';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer = ({ content, className }: RichContentRendererProps) => {
  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
