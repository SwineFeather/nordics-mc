
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
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4">${sanitizedContent}</p>` 
      }}
    />
  );
};

export default MarkdownRenderer;
