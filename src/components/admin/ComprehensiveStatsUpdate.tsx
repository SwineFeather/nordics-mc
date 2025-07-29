import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateAllPlayerStatsComprehensive } from '@/services/comprehensiveStatsService';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';

const ComprehensiveStatsUpdate: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const updateResult = await updateAllPlayerStatsComprehensive();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(updateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during the update');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Comprehensive Stats Update
        </CardTitle>
        <CardDescription>
          Update all player stats in the database to include all possible stats from possible_stats.json.
          This ensures that all players have complete stat data even if they don't have individual JSON files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert variant={result.failed === 0 ? "default" : "destructive"}>
            {result.failed === 0 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              Update completed: {result.success} successful, {result.failed} failed out of {result.total} total players.
            </AlertDescription>
          </Alert>
        )}

        {isUpdating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Updating player stats...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Stats...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Update All Player Stats
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fetches all possible stats from possible_stats.json</li>
            <li>Initializes all stats to 0 for every player</li>
            <li>Merges existing database stats and JSON file stats</li>
            <li>Updates the player_stats table with comprehensive data</li>
            <li>Ensures all players have complete stat information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveStatsUpdate; 