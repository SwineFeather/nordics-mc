
import React from 'react';
import { sanitizeMarkdown } from '@/utils/htmlSanitizer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Sanitize markdown content to prevent XSS attacks
  const sanitizedContent = sanitizeMarkdown(content ?? '');

  return (
    <div 
      className={`
        prose max-w-none dark:prose-invert
        prose-headings:font-semibold prose-headings:text-foreground
        prose-h1:leading-tight prose-h1:mt-4 prose-h1:mb-3 prose-h1:border-b prose-h1:border-border/50 prose-h1:pb-1
        prose-h2:mt-6 prose-h2:mb-2 prose-h2:text-foreground prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-1
        prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-foreground
        ${className}
      `}
      dangerouslySetInnerHTML={{ 
        __html: sanitizedContent 
      }}
    />
  );
};

export default MarkdownRenderer;
