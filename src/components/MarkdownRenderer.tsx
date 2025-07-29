
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Enhanced markdown rendering with better formatting
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';
    return markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6 gradient-text">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-semibold mb-5 text-primary">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-medium mb-4 text-secondary">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-medium mb-3 text-foreground">$1</h4>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-accent">$1</em>')
      
      // Code blocks and inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/50 p-4 rounded-xl border border-border/50 overflow-x-auto my-4"><code class="text-sm">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted/50 px-2 py-1 rounded text-sm font-mono border border-border/30">$1</code>')
      
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground list-decimal">$1</li>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-border/50 my-8" />')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary/50 pl-4 py-2 bg-muted/30 rounded-r-lg my-4 italic text-muted-foreground">$1</blockquote>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4">${renderMarkdown(content ?? '')}</p>` 
      }}
    />
  );
};

export default MarkdownRenderer;
