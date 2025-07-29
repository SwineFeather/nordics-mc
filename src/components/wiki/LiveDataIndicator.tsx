import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw } from 'lucide-react';

interface LiveDataIndicatorProps {
  lastUpdated: string;
  isLiveData: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({ lastUpdated, isLiveData, onRefresh, isRefreshing }) => {
  if (!isLiveData) {
    return null;
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <RefreshCw className={`h-4 w-4 text-green-600 ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`} />
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          Live Data
        </Badge>
        <div className="flex items-center gap-1 text-sm text-green-700">
          <Clock className="h-3 w-3" />
          <span>Updated {formatTimeAgo(lastUpdated)}</span>
        </div>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      )}
    </div>
  );
};

export default LiveDataIndicator; 