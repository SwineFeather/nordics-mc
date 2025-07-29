import React from 'react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className = ''
}) => {
  // Simple HTML sanitization - in production, use a proper sanitizer like DOMPurify
  const sanitizeHtml = (html: string): string => {
    // Remove script tags and other potentially dangerous elements
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const renderContent = () => {
    if (!content) return null;

    const sanitizedContent = sanitizeHtml(content);
    
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  return (
    <div className="rich-content">
      {renderContent()}
    </div>
  );
}; 