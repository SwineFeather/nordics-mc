import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PlayerStatsSyncService } from '@/services/playerStatsSyncService';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SyncResult {
  success: number;
  failed: number;
  total: number;
  errors: string[];
}

const ComprehensiveStatsSync: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleSyncAllStats = async () => {
    setIsSyncing(true);
    setProgress(0);
    setResult(null);
    setCurrentStep('Starting comprehensive stats sync...');

    try {
      // Step 1: Initialize stats table
      setCurrentStep('Initializing player stats table...');
      setProgress(10);
      
      const initResult = await PlayerStatsSyncService.initializePlayerStatsTable();
      if (!initResult) {
        throw new Error('Failed to initialize player stats table');
      }

      // Step 2: Sync all player stats
      setCurrentStep('Syncing comprehensive stats for all players...');
      setProgress(30);

      const syncResult = await PlayerStatsSyncService.syncAllPlayerStats();
      
      setProgress(100);
      setCurrentStep('Sync completed!');
      setResult(syncResult);

      console.log('Comprehensive stats sync completed:', syncResult);
    } catch (error) {
      console.error('Error during comprehensive stats sync:', error);
      setCurrentStep('Sync failed!');
      setResult({
        success: 0,
        failed: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSinglePlayer = async (uuid: string) => {
    setIsSyncing(true);
    setProgress(0);
    setResult(null);
    setCurrentStep(`Syncing stats for player ${uuid}...`);

    try {
      const success = await PlayerStatsSyncService.syncPlayerStats(uuid);
      
      setProgress(100);
      setCurrentStep('Sync completed!');
      setResult({
        success: success ? 1 : 0,
        failed: success ? 0 : 1,
        total: 1,
        errors: success ? [] : ['Failed to sync player stats']
      });
    } catch (error) {
      console.error('Error syncing single player:', error);
      setCurrentStep('Sync failed!');
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (isSyncing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (result) {
      if (result.failed === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (result.success > 0) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (result) {
      if (result.failed === 0) return 'Completed successfully';
      if (result.success > 0) return 'Completed with errors';
      return 'Failed';
    }
    return 'Ready to sync';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Comprehensive Stats Sync
        </CardTitle>
        <CardDescription>
          Sync all player stats with comprehensive data from possible_stats.json and individual player files.
          This ensures all players have all possible stats initialized and up-to-date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status: {getStatusText()}</span>
          {result && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                {result.success} Success
              </Badge>
              <Badge variant="outline" className="text-red-600">
                {result.failed} Failed
              </Badge>
              <Badge variant="outline">
                {result.total} Total
              </Badge>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSyncAllStats}
            disabled={isSyncing}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing All Players...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync All Player Stats
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Players:</span>
                    <span className="font-medium">{result.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successfully Synced:</span>
                    <span className="font-medium text-green-600">{result.success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{result.failed}</span>
                  </div>
                  {result.success > 0 && (
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">
                        {Math.round((result.success / result.total) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Error Details */}
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Errors ({result.errors.length}):</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">
                          {error}
                        </div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ... and {result.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Information */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>This process will:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Initialize all possible stats from possible_stats.json for every player</li>
            <li>Fetch individual player stats from JSON files</li>
            <li>Merge with existing database stats</li>
            <li>Update the player_stats table with comprehensive data</li>
          </ul>
          <p className="mt-2">
            <strong>Note:</strong> This may take several minutes depending on the number of players.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveStatsSync; 