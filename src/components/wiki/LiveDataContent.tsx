import React from 'react';
import SimpleMarkdownRenderer from '../SimpleMarkdownRenderer';
import CompactStatsCards from './CompactStatsCards';

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
  // If it's live data and we have entity data, show compact cards (without the live indicator text)
  // Live data cards removed by request. Always render plain markdown below.

  // Fallback to regular markdown rendering
  return (
    <div className="max-w-4xl mx-auto">
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