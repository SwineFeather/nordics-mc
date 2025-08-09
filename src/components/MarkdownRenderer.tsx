
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
        prose prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-primary prose-h1:leading-tight prose-h1:mt-4 prose-h1:mb-3
        prose-h2:text-primary prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:border-border
        prose-h3:text-foreground prose-h3:mt-4 prose-h3:mb-2
        ${className}
      `}
      dangerouslySetInnerHTML={{ 
        __html: sanitizedContent 
      }}
    />
  );
};

export default MarkdownRenderer;
