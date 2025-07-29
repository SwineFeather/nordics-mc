
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, RefreshCw, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  initializeAchievementSystem, 
  syncAllPlayerAchievements,
  getAchievementDefinitions,
  getAchievementTiers,
  getLevelDefinitions
} from '@/services/achievementSyncService';

interface AchievementSyncButtonProps {
  className?: string;
}

const AchievementSyncButton: React.FC<AchievementSyncButtonProps> = ({ className = "" }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    definitions: 0,
    tiers: 0,
    levels: 0
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeAchievementSystem();
      
      // Fetch stats after initialization
      const [definitions, tiers, levels] = await Promise.all([
        getAchievementDefinitions(),
        getAchievementTiers(),
        getLevelDefinitions()
      ]);

      setStats({
        definitions: definitions.length,
        tiers: tiers.length,
        levels: levels.length
      });

      toast({
        title: "Achievement System Initialized",
        description: "All achievement definitions, tiers, and levels have been set up successfully.",
      });
    } catch (error) {
      console.error('Error initializing achievement system:', error);
      toast({
        title: "Initialization Failed",
        description: "There was an error initializing the achievement system.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAllPlayerAchievements();
      
      if (result.success) {
        setLastSync(new Date());
        toast({
          title: "Achievement Sync Complete",
          description: "All player achievements have been synchronized successfully.",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "There was an error syncing achievements.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing achievements:', error);
      toast({
        title: "Sync Failed",
        description: "There was an error syncing achievements.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const loadStats = async () => {
    try {
      const [definitions, tiers, levels] = await Promise.all([
        getAchievementDefinitions(),
        getAchievementTiers(),
        getLevelDefinitions()
      ]);

      setStats({
        definitions: definitions.length,
        tiers: tiers.length,
        levels: levels.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Achievement System Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.definitions}
            </div>
            <div className="text-sm text-muted-foreground">Achievement Types</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.tiers}
            </div>
            <div className="text-sm text-muted-foreground">Achievement Tiers</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.levels}
            </div>
            <div className="text-sm text-muted-foreground">Level Definitions</div>
          </div>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Last synced: {lastSync.toLocaleString()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="flex-1"
              variant="outline"
            >
              {isInitializing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Initialize System
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing || stats.definitions === 0}
              className="flex-1"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Players
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadStats}
              variant="ghost"
              className="flex-1"
            >
              Refresh Stats
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Status</span>
            <Badge variant={stats.definitions > 0 ? "default" : "destructive"}>
              {stats.definitions > 0 ? "Ready" : "Not Initialized"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Achievement Coverage</span>
            <Badge variant={stats.tiers >= 50 ? "default" : "secondary"}>
              {stats.tiers} tiers
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level System</span>
            <Badge variant={stats.levels >= 10 ? "default" : "secondary"}>
              {stats.levels} levels
            </Badge>
          </div>
        </div>

        {/* Warning for uninitialized system */}
        {stats.definitions === 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Achievement system needs to be initialized before syncing players.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementSyncButton;
