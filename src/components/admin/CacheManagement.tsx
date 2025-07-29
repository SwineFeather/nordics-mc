import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  cachedComprehensiveStats, 
  preloadCacheForPlayers 
} from '@/services/cachedComprehensiveStatsService';
import { getAllPlayerUUIDs } from '@/services/comprehensiveStatsService';
import { 
  Loader2, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';

const CacheManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    memoryUsage: number;
    cacheSize: number;
    hitRate: number;
  } | null>(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadResult, setPreloadResult] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cache stats on component mount
  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await cachedComprehensiveStats.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await cachedComprehensiveStats.clearAllCaches();
      await loadCacheStats();
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreloadCache = async () => {
    setIsLoading(true);
    setError(null);
    setPreloadProgress(0);
    setPreloadResult(null);

    try {
      // Get all player UUIDs
      const uuids = await getAllPlayerUUIDs();
      console.log(`Found ${uuids.length} players to preload`);

      // Preload cache with progress tracking
      const totalPlayers = uuids.length;
      let processed = 0;

      const updateProgress = () => {
        processed += 20; // Process in batches of 20
        const progress = Math.min((processed / totalPlayers) * 100, 90);
        setPreloadProgress(progress);
      };

      // Start preloading
      await preloadCacheForPlayers(uuids);
      
      setPreloadProgress(100);
      setPreloadResult({
        total: totalPlayers,
        success: totalPlayers,
        failed: 0
      });

      // Reload cache stats
      await loadCacheStats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    await loadCacheStats();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Management
        </CardTitle>
        <CardDescription>
          Manage player stats caching to optimize database egress and improve performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cache Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Memory Usage</span>
            </div>
            <div className="text-2xl font-bold">
              {cacheStats ? `${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">Cache Size</span>
            </div>
            <div className="text-2xl font-bold">
              {cacheStats ? cacheStats.cacheSize.toLocaleString() : 'N/A'}
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Hit Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {cacheStats ? `${(cacheStats.hitRate * 100).toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        <Separator />

        {/* Cache Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cache Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleRefreshStats}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </Button>
            
            <Button 
              onClick={handleClearCache}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Caches
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Cache Preloading */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cache Preloading</h3>
            <Badge variant="secondary">
              Preload frequently accessed player stats
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Preload the cache with all player stats to improve initial page load performance.
            This will fetch and cache stats for all players in the database.
          </p>

          {preloadProgress > 0 && preloadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Preloading cache...</span>
                <span>{Math.round(preloadProgress)}%</span>
              </div>
              <Progress value={preloadProgress} className="w-full" />
            </div>
          )}

          {preloadResult && (
            <Alert variant={preloadResult.failed === 0 ? "default" : "destructive"}>
              {preloadResult.failed === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                Preloading completed: {preloadResult.success} successful, {preloadResult.failed} failed out of {preloadResult.total} total players.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handlePreloadCache}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preloading Cache...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Preload All Player Stats
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Cache Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Cache Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Cache Strategy</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Player stats: 5 minutes TTL</li>
                <li>• Player profiles: 10 minutes TTL</li>
                <li>• Leaderboards: 15 minutes TTL</li>
                <li>• Achievements: 30 minutes TTL</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Redis with memory fallback</li>
                <li>• Real-time cache invalidation</li>
                <li>• Batch operations</li>
                <li>• Automatic cleanup</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheManagement; 