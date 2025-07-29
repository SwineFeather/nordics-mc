import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, BookOpen, CheckCircle, AlertCircle, RefreshCw, Play, Settings } from 'lucide-react';
import { AutoWikiSyncService, WikiSyncStatus } from '@/services/autoWikiSyncService';

export default function AutoWikiManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<WikiSyncStatus[]>([]);
  const [summary, setSummary] = useState({
    totalTowns: 0,
    totalNations: 0,
    townsWithPages: 0,
    nationsWithPages: 0,
    missingTownPages: 0,
    missingNationPages: 0
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [recentActivity, setRecentActivity] = useState({
    recentTowns: [],
    recentNations: []
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const [statusData, summaryData, enabledStatus, activityData] = await Promise.all([
        AutoWikiSyncService.checkWikiPagesStatus(),
        AutoWikiSyncService.getWikiPagesSummary(),
        AutoWikiSyncService.isAutoWikiEnabled(),
        AutoWikiSyncService.getRecentWikiActivity()
      ]);

      setStatus(statusData);
      setSummary(summaryData);
      setIsEnabled(enabledStatus);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await AutoWikiSyncService.syncAllWikiPages();
      await loadStatus(); // Reload status after sync
    } catch (error) {
      console.error('Failed to sync wiki pages:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getTownsProgress = () => {
    if (summary.totalTowns === 0) return 0;
    return (summary.townsWithPages / summary.totalTowns) * 100;
  };

  const getNationsProgress = () => {
    if (summary.totalNations === 0) return 0;
    return (summary.nationsWithPages / summary.totalNations) * 100;
  };

  const getOverallProgress = () => {
    const total = summary.totalTowns + summary.totalNations;
    if (total === 0) return 0;
    return ((summary.townsWithPages + summary.nationsWithPages) / total) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Automatic Wiki Page Manager
          </CardTitle>
          <CardDescription>
            Automatically create wiki pages for all towns and nations in the Nordics folder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Overall Progress</p>
                    <p className="text-2xl font-bold">{Math.round(getOverallProgress())}%</p>
                  </div>
                  <Progress value={getOverallProgress()} className="w-16" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Towns</p>
                    <p className="text-2xl font-bold">{summary.townsWithPages}/{summary.totalTowns}</p>
                  </div>
                  <Progress value={getTownsProgress()} className="w-16" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Nations</p>
                    <p className="text-2xl font-bold">{summary.nationsWithPages}/{summary.totalNations}</p>
                  </div>
                  <Progress value={getNationsProgress()} className="w-16" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isEnabled ? "default" : "destructive"}>
              {isEnabled ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto Wiki Enabled
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Auto Wiki Disabled
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isEnabled 
                ? "New towns and nations will automatically get wiki pages created"
                : "Automatic wiki page creation is not set up"
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncAll} 
              disabled={isSyncing || isLoading}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync All Wiki Pages'}
            </Button>

            <Button 
              onClick={loadStatus} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {/* Missing Pages Alert */}
          {(summary.missingTownPages > 0 || summary.missingNationPages > 0) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing wiki pages: {summary.missingTownPages} towns and {summary.missingNationPages} nations. 
                Click "Sync All Wiki Pages" to create them.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Detailed Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading status...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {status.map((item) => (
                <div key={item.entity_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">
                      {item.entity_type.replace('_', ' ')}
                    </h4>
                    <Badge variant={item.missing_pages === 0 ? "default" : "secondary"}>
                      {item.pages_exist}/{item.total_count} pages
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.missing_pages > 0 
                      ? `${item.missing_pages} pages missing`
                      : 'All pages created'
                    }
                  </div>
                  <Progress value={(item.pages_exist / item.total_count) * 100} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Recently created towns and nations (last 7 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Recent Towns</h4>
              {recentActivity.recentTowns.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.recentTowns.map((town: any) => (
                    <div key={town.name} className="text-sm">
                      <span className="font-medium">{town.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(town.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent towns</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent Nations</h4>
              {recentActivity.recentNations.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.recentNations.map((nation: any) => (
                    <div key={nation.name} className="text-sm">
                      <span className="font-medium">{nation.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(nation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent nations</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 