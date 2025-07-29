import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const renderMarkdown = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6 mt-8 first:mt-0 text-foreground border-b-2 border-primary/30 pb-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-semibold mb-5 mt-8 first:mt-0 text-foreground border-b border-border/50 pb-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mb-4 mt-6 first:mt-0 text-foreground">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-medium mb-3 mt-5 first:mt-0 text-foreground">$1</h4>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-accent">$1</em>')
      
      // Code blocks and inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/50 rounded-lg border border-border/50 overflow-hidden my-4"><div class="flex items-center justify-between px-4 py-2 bg-muted/70 border-b border-border/30"><span class="text-xs font-mono text-muted-foreground">Code</span></div><code class="block p-4 text-sm font-mono overflow-x-auto text-foreground">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted/70 px-2 py-1 rounded text-sm font-mono border border-border/30 text-foreground">$1</code>')
      
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-foreground">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-2 text-foreground list-decimal">$1</li>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline transition-colors inline-flex items-center space-x-1" target="_blank" rel="noopener noreferrer"><span>$1</span><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-border/50 my-8" />')
      
      // Special blockquotes
      .replace(/^> ⚠️ (.*$)/gim, '<div class="my-4 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg"><div class="flex items-start space-x-2"><svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg><div class="text-yellow-700 dark:text-yellow-300">$1</div></div></div>')
      .replace(/^> ℹ️ (.*$)/gim, '<div class="my-4 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg"><div class="flex items-start space-x-2"><svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div class="text-blue-700 dark:text-blue-300">$1</div></div></div>')
      .replace(/^> 💡 (.*$)/gim, '<div class="my-4 p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg"><div class="flex items-start space-x-2"><svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg><div class="text-green-700 dark:text-green-300">$1</div></div></div>')
      .replace(/^> 🚨 (.*$)/gim, '<div class="my-4 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg"><div class="flex items-start space-x-2"><svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div class="text-red-700 dark:text-red-300">$1</div></div></div>')
      
      // Regular blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="my-4 border-l-4 border-primary/50 pl-4 py-2 bg-muted/30 rounded-r-lg italic text-foreground">$1</blockquote>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-foreground">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className={cn("prose prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4 leading-relaxed text-foreground">${renderMarkdown(content)}</p>` 
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