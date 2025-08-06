import React from 'react';
import { cn } from '@/lib/utils';
import { sanitizeMarkdown } from '@/utils/htmlSanitizer';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // Sanitize markdown content to prevent XSS attacks
  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <div 
      className={cn("prose prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4 leading-relaxed text-foreground">${sanitizedContent}</p>` 
      }}
      style={{
        '--tw-prose-body': 'hsl(var(--foreground))',
        '--tw-prose-headings': 'hsl(var(--foreground))',
        '--tw-prose-links': 'hsl(var(--primary))',
        '--tw-prose-bold': 'hsl(var(--foreground))',
        '--tw-prose-counters': 'hsl(var(--muted-foreground))',
        '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
        '--tw-prose-hr': 'hsl(var(--border))',
        '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
        '--tw-prose-quote-borders': 'hsl(var(--border))',
        '--tw-prose-captions': 'hsl(var(--muted-foreground))',
        '--tw-prose-code': 'hsl(var(--foreground))',
        '--tw-prose-pre-code': 'hsl(var(--foreground))',
        '--tw-prose-pre-bg': 'hsl(var(--muted))',
        '--tw-prose-th-borders': 'hsl(var(--border))',
        '--tw-prose-td-borders': 'hsl(var(--border))',
      } as React.CSSProperties}
    />
  );
};

export default SimpleMarkdownRenderer; 