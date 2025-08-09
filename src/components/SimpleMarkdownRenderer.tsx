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
      className={cn(
        // Base typography
        "prose prose-invert max-w-none",
        // Make headings stand out
        "prose-headings:font-semibold",
        "prose-h1:text-primary prose-h1:leading-tight prose-h1:mt-4 prose-h1:mb-3",
        "prose-h2:text-primary prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:border-border",
        "prose-h3:text-foreground prose-h3:mt-4 prose-h3:mb-2",
        className
      )}
      dangerouslySetInnerHTML={{ 
        // Insert sanitized HTML directly (no extra <p> wrapper) so headings render properly
        __html: sanitizedContent 
      }}
      style={{
        '--tw-prose-body': 'hsl(var(--foreground))',
        '--tw-prose-headings': 'hsl(var(--primary))',
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