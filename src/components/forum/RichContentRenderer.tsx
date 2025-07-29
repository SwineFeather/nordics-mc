
import { sanitizeHtml } from '@/utils/sanitizer';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer = ({ content, className }: RichContentRendererProps) => {
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
