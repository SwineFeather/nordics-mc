import React from 'react';
import SimpleMarkdownRenderer from '../SimpleMarkdownRenderer';
import CompactStatsCards from './CompactStatsCards';
import LiveDataIndicator from './LiveDataIndicator';

interface LiveDataContentProps {
  content: string;
  isLiveData: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  entityType?: 'town' | 'nation';
  entityData?: any;
}

const LiveDataContent: React.FC<LiveDataContentProps> = ({
  content,
  isLiveData,
  lastUpdated,
  onRefresh,
  isRefreshing,
  entityType,
  entityData
}) => {
  // If it's live data and we have entity data, show compact cards
  if (isLiveData && entityType && entityData) {
    return (
      <div className="max-w-6xl mx-auto">
        <LiveDataIndicator 
          isLiveData={isLiveData} 
          lastUpdated={lastUpdated || ''} 
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        
        {/* Extract title from content */}
        {(() => {
          const titleMatch = content.match(/^# (.+)$/m);
          const title = titleMatch ? titleMatch[1] : 'Unknown';
          return <h1 className="text-3xl font-bold mb-6">{title}</h1>;
        })()}
        
        {/* Show compact stats cards */}
        <CompactStatsCards type={entityType} data={entityData} />
        
                  {/* Show the rest of the content (description, history, etc.) */}
          <div className="prose prose-sm max-w-none" style={{
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
          } as React.CSSProperties}>
            {/* Show content sections, excluding the stats sections */}
            {(() => {
              const lines = content.split('\n');
              let inStatsSection = false;
              const contentLines: string[] = [];
              
              for (const line of lines) {
                // Skip stats sections
                if (line.includes('## 📊 Quick Stats') || 
                    line.includes('## 📍 Location') || 
                    line.includes('## 🏛️ Town Information') ||
                    line.includes('## 🏛️ Nation Information')) {
                  inStatsSection = true;
                  continue;
                }
                
                // Stop skipping when we hit the next section
                if (inStatsSection && line.startsWith('## ') && !line.includes('📊') && !line.includes('📍') && !line.includes('🏛️')) {
                  inStatsSection = false;
                }
                
                // Add content lines (including the content sections header and everything after)
                if (!inStatsSection) {
                  contentLines.push(line);
                }
              }
              
              return <SimpleMarkdownRenderer content={contentLines.join('\n')} />;
            })()}
          </div>
      </div>
    );
  }

  // Fallback to regular markdown rendering
  return (
    <div className="max-w-4xl mx-auto">
      <LiveDataIndicator 
        isLiveData={isLiveData} 
        lastUpdated={lastUpdated || ''} 
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      <div className="prose prose-sm max-w-none" style={{
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
      } as React.CSSProperties}>
        <SimpleMarkdownRenderer content={content} />
      </div>
    </div>
  );
};

export default LiveDataContent; 