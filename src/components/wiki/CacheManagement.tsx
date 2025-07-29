import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  Clock, 
  FileText, 
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStatus {
  hasData: boolean;
  lastSync: Date | null;
  totalPages: number;
  categories: number;
}

interface CacheManagementProps {
  cacheStatus: CacheStatus;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onClearCache: () => Promise<void>;
  onSyncWithGitHub: () => Promise<void>;
}

export const CacheManagement: React.FC<CacheManagementProps> = ({
  cacheStatus,
  loading,
  onRefresh,
  onClearCache,
  onSyncWithGitHub
}) => {
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await onRefresh();
      toast({
        title: "Cache Refreshed",
        description: "Data has been refreshed from GitHub",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await onClearCache();
      toast({
        title: "Cache Cleared",
        description: "Local cache has been cleared",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  const handleSyncWithGitHub = async () => {
    try {
      await onSyncWithGitHub();
      toast({
        title: "Sync Complete",
        description: "Successfully synced with GitHub",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync with GitHub",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (cacheStatus.hasData) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return "Loading...";
    if (cacheStatus.hasData) return "Available";
    return "No Data";
  };

  const getStatusColor = () => {
    if (loading) return "bg-yellow-100 text-yellow-800";
    if (cacheStatus.hasData) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Cache Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last Sync:</span>
            <span className="text-sm text-muted-foreground">
              {cacheStatus.lastSync 
                ? new Date(cacheStatus.lastSync).toLocaleString()
                : "Never"
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pages:</span>
            <span className="text-sm text-muted-foreground">
              {cacheStatus.totalPages}
            </span>
          </div>
        </div>

        {/* Cache Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Categories</div>
              <div className="text-sm text-muted-foreground">
                {cacheStatus.categories} categories
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Total Pages</div>
              <div className="text-sm text-muted-foreground">
                {cacheStatus.totalPages} pages
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          
          <Button
            onClick={handleSyncWithGitHub}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Sync with GitHub
          </Button>
          
          <Button
            onClick={handleClearCache}
            disabled={loading || !cacheStatus.hasData}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cache
          </Button>
        </div>

        {/* Info Message */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Hybrid System Active</div>
            <div>
              Data is loaded from local cache first for fast performance, then synced with GitHub for the latest content.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 