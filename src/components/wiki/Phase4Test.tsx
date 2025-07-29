import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Search,
  MessageSquare
} from 'lucide-react';
import { backgroundSyncService, SyncStatus, SyncEvent } from '@/services/backgroundSyncService';
import { userPermissionsService, WikiUser, PermissionCheck } from '@/services/userPermissionsService';
import { analyticsService } from '@/services/analyticsService';
import { toast } from 'sonner';

export default function Phase4Test() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<WikiUser | null>(null);
  const [permissionChecks, setPermissionChecks] = useState<PermissionCheck[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load sync status
      const status = backgroundSyncService.getStatus();
      setSyncStatus(status);

      // Load current user
      const user = await userPermissionsService.getCurrentUser();
      setCurrentUser(user);

      // Load analytics summary
      const summary = analyticsService.getAnalyticsSummary();
      setAnalyticsSummary(summary);

      // Track page view
      await analyticsService.trackPageView('phase4-test', 'Phase 4 Test Page');

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSyncStatus = () => {
    const status = backgroundSyncService.getStatus();
    setSyncStatus(status);
  };

  const handleStartBackgroundSync = async () => {
    try {
      await backgroundSyncService.startBackgroundSync(1); // 1 minute interval for testing
      toast.success('Background sync started');
      updateSyncStatus();
    } catch (error) {
      console.error('Error starting background sync:', error);
      toast.error('Failed to start background sync');
    }
  };

  const handleStopBackgroundSync = () => {
    backgroundSyncService.stopBackgroundSync();
    toast.success('Background sync stopped');
    updateSyncStatus();
  };

  const handleForceSync = async () => {
    try {
      await backgroundSyncService.forceSync();
      toast.success('Force sync completed');
      updateSyncStatus();
    } catch (error) {
      console.error('Error during force sync:', error);
      toast.error('Force sync failed');
    }
  };

  const handleUpdateSyncInterval = (minutes: number) => {
    backgroundSyncService.updateSyncInterval(minutes);
    toast.success(`Sync interval updated to ${minutes} minutes`);
    updateSyncStatus();
  };

  const testPermission = async (action: string) => {
    try {
      let check: PermissionCheck;
      
      switch (action) {
        case 'read':
          check = await userPermissionsService.canReadPage('test-page');
          break;
        case 'edit':
          check = await userPermissionsService.canEditPage('test-page');
          break;
        case 'create':
          check = await userPermissionsService.canCreatePage();
          break;
        case 'delete':
          check = await userPermissionsService.canDeletePage('test-page');
          break;
        case 'manage':
          check = await userPermissionsService.canManageStructure();
          break;
        case 'users':
          check = await userPermissionsService.canManageUsers();
          break;
        default:
          return;
      }

      setPermissionChecks(prev => [check, ...prev.slice(0, 9)]); // Keep last 10
      
      // Track the permission check
      await analyticsService.trackUserAction('page_view', 'page', 'test-page', 'Permission Test', {
        action,
        allowed: check.allowed,
        userRole: check.userRole,
        requiredRole: check.requiredRole
      });

      toast.success(`Permission check: ${action} - ${check.allowed ? 'ALLOWED' : 'DENIED'}`);

    } catch (error) {
      console.error('Error testing permission:', error);
      toast.error('Permission test failed');
    }
  };

  const testAnalytics = async () => {
    try {
      // Track various user actions
      await analyticsService.trackUserAction('search', 'search', undefined, 'Test Search', {
        searchTerm: 'test',
        resultsCount: 5,
        searchTime: 150
      });

      await analyticsService.trackUserAction('page_edit', 'page', 'test-page', 'Test Page', {
        editType: 'content',
        changesCount: 3
      });

      await analyticsService.trackUserAction('comment', 'comment', 'test-comment', 'Test Comment', {
        commentLength: 50
      });

      // Track performance metrics
      analyticsService.trackPerformanceMetric('page_load_time', 250, 'ms', { page: 'test-page' });
      analyticsService.trackPerformanceMetric('api_response_time', 120, 'ms', { endpoint: '/api/wiki' });
      analyticsService.trackPerformanceMetric('cache_hit_rate', 85, 'percentage', { cache: 'local' });

      // Update analytics summary
      const summary = analyticsService.getAnalyticsSummary();
      setAnalyticsSummary(summary);

      toast.success('Analytics test completed');

    } catch (error) {
      console.error('Error testing analytics:', error);
      toast.error('Analytics test failed');
    }
  };

  const getEventIcon = (event: SyncEvent) => {
    switch (event.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPermissionIcon = (allowed: boolean) => {
    return allowed ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Phase 4 features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Phase 4: Advanced Features</h1>
        <p className="text-muted-foreground">
          Background Sync, Conflict Resolution, User Permissions & Analytics
        </p>
      </div>

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Background Sync
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Background Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Background Sync Status
              </CardTitle>
              <CardDescription>
                Monitor and control automatic synchronization between GitHub and local cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {syncStatus && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {syncStatus.isRunning ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                          Inactive
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {syncStatus.lastSync ? 
                        new Date(syncStatus.lastSync).toLocaleTimeString() : 
                        'Never'
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">Last Sync</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {syncStatus.nextSync ? 
                        new Date(syncStatus.nextSync).toLocaleTimeString() : 
                        'N/A'
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">Next Sync</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {syncStatus.errorCount}
                    </div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleStartBackgroundSync}
                  disabled={syncStatus?.isRunning}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Sync
                </Button>
                <Button 
                  onClick={handleStopBackgroundSync}
                  disabled={!syncStatus?.isRunning}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Stop Sync
                </Button>
                <Button 
                  onClick={handleForceSync}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Force Sync
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleUpdateSyncInterval(1)}
                  variant="outline"
                  size="sm"
                >
                  1 min
                </Button>
                <Button 
                  onClick={() => handleUpdateSyncInterval(5)}
                  variant="outline"
                  size="sm"
                >
                  5 min
                </Button>
                <Button 
                  onClick={() => handleUpdateSyncInterval(30)}
                  variant="outline"
                  size="sm"
                >
                  30 min
                </Button>
                <Button 
                  onClick={() => handleUpdateSyncInterval(60)}
                  variant="outline"
                  size="sm"
                >
                  1 hour
                </Button>
              </div>

              {syncStatus?.lastError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Last Error: {syncStatus.lastError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Sync History</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {syncStatus?.syncHistory.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                      {getEventIcon(event)}
                      <span className="flex-1">{event.message}</span>
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Permissions
              </CardTitle>
              <CardDescription>
                Test and monitor user access control and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Current User</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Username:</strong> {currentUser.username}</div>
                      <div><strong>Role:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {currentUser.role}
                        </Badge>
                      </div>
                      <div><strong>Email:</strong> {currentUser.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Permissions</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(currentUser.permissions).map(([permission, allowed]) => (
                        <div key={permission} className="flex items-center gap-2">
                          {getPermissionIcon(allowed)}
                          <span className="capitalize">{permission.replace('can', '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Test Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => testPermission('read')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Read Page
                  </Button>
                  <Button 
                    onClick={() => testPermission('edit')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Page
                  </Button>
                  <Button 
                    onClick={() => testPermission('create')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Create Page
                  </Button>
                  <Button 
                    onClick={() => testPermission('delete')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Page
                  </Button>
                  <Button 
                    onClick={() => testPermission('manage')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Structure
                  </Button>
                  <Button 
                    onClick={() => testPermission('users')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Manage Users
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Permission Check History</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {permissionChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                      {getPermissionIcon(check.allowed)}
                      <span className="flex-1">
                        {check.allowed ? 'ALLOWED' : 'DENIED'} - {check.reason || 'No reason provided'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {check.userRole || 'Unknown'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Monitor wiki usage, performance, and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsSummary.totalPageViews}</div>
                    <p className="text-sm text-muted-foreground">Page Views</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsSummary.totalUserActions}</div>
                    <p className="text-sm text-muted-foreground">User Actions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsSummary.activeUsers}</div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(analyticsSummary.averageSessionDuration)}s
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={testAnalytics}
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Test Analytics
                </Button>
                <Button 
                  onClick={() => {
                    const data = analyticsService.exportAnalytics();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'wiki-analytics.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Export Data
                </Button>
                <Button 
                  onClick={() => {
                    analyticsService.clearAnalytics();
                    setAnalyticsSummary(analyticsService.getAnalyticsSummary());
                    toast.success('Analytics data cleared');
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Data
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    {(() => {
                      const perf = analyticsService.getPerformanceAnalytics();
                      return Object.entries(perf).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm font-mono">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                            {key.includes('Time') ? 'ms' : key.includes('Rate') ? '%' : ''}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Search Analytics</h4>
                  <div className="space-y-2">
                    {(() => {
                      const search = analyticsService.getSearchAnalytics();
                      return Object.entries(search).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm font-mono">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                            {key.includes('Time') ? 'ms' : key.includes('Rate') ? '%' : ''}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={async () => {
                    try {
                      const users = await userPermissionsService.getAllUsers();
                      toast.success(`Found ${users.length} users`);
                    } catch (error) {
                      toast.error('Failed to fetch users');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Load Users
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const stats = await userPermissionsService.getUserStats();
                      toast.success(`Stats loaded: ${stats.totalUsers} total users`);
                    } catch (error) {
                      toast.error('Failed to load user stats');
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Load Stats
                </Button>
              </div>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  User management features require admin permissions. 
                  Use the permissions tab to test your access level.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 