import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Cloud, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Globe,
  HardDrive
} from 'lucide-react';
import { useHybridWikiData } from '@/hooks/useHybridWikiData';
import { autoWikiService } from '@/services/autoWikiService';
import { githubWikiService } from '@/services/githubWikiService';
import { GitHubTokenTest } from './GitHubTokenTest';
import { CacheManagement } from './CacheManagement';
import { toast } from 'sonner';

export const HybridWikiTest = () => {
  const { 
    categories, 
    loading, 
    error, 
    lastUpdated, 
    cacheStatus, 
    refreshData, 
    syncWithGitHub, 
    clearCache
  } = useHybridWikiData();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncingNations, setIsSyncingNations] = useState(false);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await autoWikiService.testDatabaseConnection();
      setConnectionTest(result);
      
      if (result.error) {
        toast.error(`Database test failed: ${result.error}`);
      } else {
        toast.success(`Database test successful: ${result.nations} nations, ${result.towns} towns`);
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      toast.error('Test connection failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSyncNationsAndTowns = async () => {
    setIsSyncingNations(true);
    try {
      await autoWikiService.syncNationsAndTowns();
      await refreshData(); // Refresh the data after sync
    } catch (error) {
      console.error('Sync nations and towns failed:', error);
      toast.error('Failed to sync nations and towns');
    } finally {
      setIsSyncingNations(false);
    }
  };

  const handleCheckGitHubAccess = async () => {
    try {
      const hasAccess = await githubWikiService.checkRepoAccess();
      if (hasAccess) {
        toast.success('GitHub repository access confirmed');
      } else {
        toast.error('GitHub repository access failed');
      }
    } catch (error) {
      console.error('GitHub access check failed:', error);
      toast.error('GitHub access check failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Hybrid Wiki System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub Token Test */}
          <GitHubTokenTest />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    size="sm"
                    className="w-full"
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Test Database Connection
                      </>
                    )}
                  </Button>
                  
                  {connectionTest && (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Nations:</span>
                        <Badge variant={connectionTest.error ? "destructive" : "default"}>
                          {connectionTest.nations}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Towns:</span>
                        <Badge variant={connectionTest.error ? "destructive" : "default"}>
                          {connectionTest.towns}
                        </Badge>
                      </div>
                      {connectionTest.error && (
                        <div className="text-red-500 text-xs">
                          Error: {connectionTest.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  GitHub Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    onClick={handleCheckGitHubAccess}
                    size="sm"
                    className="w-full"
                  >
                    <Cloud className="w-4 h-4 mr-2" />
                    Check GitHub Access
                  </Button>
                  
                  <Button 
                    onClick={syncWithGitHub}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync with GitHub
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Nations & Towns Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSyncNationsAndTowns}
                disabled={isSyncingNations}
                className="w-full"
              >
                {isSyncingNations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing Nations & Towns...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Sync Nations & Towns
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Cache Management Component */}
          <CacheManagement
            cacheStatus={cacheStatus}
            loading={loading}
            onRefresh={refreshData}
            onClearCache={clearCache}
            onSyncWithGitHub={syncWithGitHub}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Categories:</span>
                  <Badge variant="outline">
                    {categories.length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Pages:</span>
                  <Badge variant="outline">
                    {categories.reduce((acc, cat) => acc + cat.pages.length, 0)}
                  </Badge>
                </div>
                
                {lastUpdated && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated:</span>
                    <span className="text-xs text-muted-foreground">
                      {lastUpdated.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}; 