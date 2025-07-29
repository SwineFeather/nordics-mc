import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { getComprehensivePlayerStats } from '@/services/comprehensiveStatsService';

interface AchievementCalculation {
  achievement_id: string;
  achievement_name: string;
  tier_name: string;
  stat_name: string;
  current_value: number;
  threshold: number;
  qualifies: boolean;
  points: number;
}

interface PlayerInfo {
  player_uuid: string;
  player_name: string;
  level: number | null;
  total_xp: number | null;
  last_seen: number;
}

const AchievementDebugPanel: React.FC = () => {
  const [playerUuid, setPlayerUuid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [achievementCalculations, setAchievementCalculations] = useState<AchievementCalculation[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerInfo[]>([]);
  const [achievementsCreated, setAchievementsCreated] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [playerStatsData, setPlayerStatsData] = useState<Record<string, number>>({});

  // Helper function to calculate achievement values
  const calculateAchievementValue = (statName: string, stats: Record<string, number>): number => {
    console.log(`Calculating value for stat: ${statName}`, stats);
    
    // Apply special calculations based on stat type
    if (statName === 'play' || statName === 'play_one_minute') {
      // Playtime: convert ticks to hours (20 ticks per second, 3600 seconds per hour)
      return Math.floor((stats[statName] || 0) / 72000);
    } else if (statName === 'walk' || statName === 'walk_one_cm' || statName === 'sprint') {
      // Convert centimeters to blocks (100 cm = 1 block)
      return Math.floor((stats[statName] || 0) / 100);
    } else {
      // Standard stat lookup - direct match
      const value = stats[statName] || 0;
      console.log(`Direct stat lookup for ${statName}:`, value);
      return value;
    }
  };

  const handleTestAchievements = async () => {
    if (!playerUuid.trim()) {
      alert('Please enter a player UUID');
      return;
    }

    setIsLoading(true);
    setAchievementCalculations([]);
    setPlayerStats([]);
    setAchievementsCreated(0);
    setMessage('');

    try {
      // Get player info
      const { data: playerInfoData, error: playerInfoError } = await supabase.rpc(
        'debug_get_player_info',
        { p_player_uuid: playerUuid }
      );

      if (playerInfoError) {
        console.error('Error getting player info:', playerInfoError);
      } else {
        setPlayerStats(playerInfoData as PlayerInfo[] || []);
      }

      // Get comprehensive player stats from JSON files
      try {
        const comprehensiveStats = await getComprehensivePlayerStats(playerUuid);
        setPlayerStatsData(comprehensiveStats);
        console.log('Comprehensive stats for player:', comprehensiveStats);
      } catch (error) {
        console.error('Error getting comprehensive stats:', error);
        setPlayerStatsData({});
      }

      // Calculate achievements using the new function
      const { data: calcResult, error: calcError } = await supabase.rpc(
        'calculate_player_achievements',
        { 
          p_player_uuid: playerUuid,
          p_player_stats: playerStatsData
        }
      );

      if (calcError) {
        console.error('Error calculating achievements:', calcError);
        setMessage('Error calculating achievements: ' + calcError.message);
      } else {
        console.log('Achievement calculation result:', calcResult);
        if (calcResult && typeof calcResult === 'object') {
          const result = calcResult as any;
          setAchievementsCreated(result.achievements_created || 0);
          setMessage(result.message || 'Achievements calculated');
        }
      }

      // Get achievement definitions and calculate values locally
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievement_definitions')
        .select(`
          id,
          name,
          stat,
          achievement_tiers (
            id,
            name,
            threshold,
            points,
            tier
          )
        `)
        .order('id');

      if (achievementError) {
        console.error('Error getting achievement definitions:', achievementError);
      } else {
        const calculations: AchievementCalculation[] = [];
        
        achievementData?.forEach((achievement: any) => {
          achievement.achievement_tiers?.forEach((tier: any) => {
            const currentValue = calculateAchievementValue(achievement.stat, playerStatsData);
            const qualifies = currentValue >= tier.threshold;
            
            calculations.push({
              achievement_id: achievement.id,
              achievement_name: achievement.name,
              tier_name: tier.name,
              stat_name: achievement.stat,
              current_value: currentValue,
              threshold: tier.threshold,
              qualifies,
              points: tier.points
            });
          });
        });
        
        setAchievementCalculations(calculations);
      }

    } catch (error) {
      console.error('Error in achievement test:', error);
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAchievements = async () => {
    if (!playerUuid.trim()) {
      alert('Please enter a player UUID');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Get comprehensive player stats
      const comprehensiveStats = await getComprehensivePlayerStats(playerUuid);
      
      // Calculate and create achievements
      const { data: result, error } = await supabase.rpc(
        'calculate_player_achievements',
        { 
          p_player_uuid: playerUuid,
          p_player_stats: comprehensiveStats
        }
      );

      if (error) {
        console.error('Error creating achievements:', error);
        setMessage('Error: ' + error.message);
      } else {
        console.log('Achievement creation result:', result);
        if (result && typeof result === 'object') {
          const resultObj = result as any;
          setAchievementsCreated(resultObj.achievements_created || 0);
          setMessage(resultObj.message || 'Achievements created');
        }
      }
    } catch (error) {
      console.error('Error creating achievements:', error);
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Debug Panel</CardTitle>
        <CardDescription>
          Test achievement calculations and manually create achievements for players
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player UUID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Player UUID</label>
          <div className="flex gap-2">
            <Input
              value={playerUuid}
              onChange={(e) => setPlayerUuid(e.target.value)}
              placeholder="Enter player UUID (e.g., 75c88432-a4ed-4f01-a660-b98783a0ed1b)"
            />
            <Button onClick={handleTestAchievements} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Achievements'}
            </Button>
            <Button onClick={handleCreateAchievements} disabled={isLoading} variant="outline">
              {isLoading ? 'Creating...' : 'Create Achievements'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {message && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Results:</h3>
            <p className="text-sm">{message}</p>
            {achievementsCreated > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Achievements Created: {achievementsCreated}
              </p>
            )}
          </div>
        )}

        {/* Player Info */}
        {playerStats.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Player Info</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {playerStats.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{player.player_name}</div>
                    <div className="text-sm text-muted-foreground">UUID: {player.player_uuid}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level: {player.level || 1}</Badge>
                    <Badge variant="secondary">XP: {player.total_xp?.toLocaleString() || 0}</Badge>
                    <Badge variant="outline">Last Seen: {new Date(player.last_seen * 1000).toLocaleDateString()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Stats Summary */}
        {Object.keys(playerStatsData).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Player Stats Summary</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Playtime (hours):</strong> {Math.floor((playerStatsData.play_one_minute || 0) / 72000)}
                </div>
                <div>
                  <strong>Blocks Placed:</strong> {playerStatsData.use_dirt || 0}
                </div>
                <div>
                  <strong>Blocks Broken:</strong> {playerStatsData.mine_ground || 0}
                </div>
                <div>
                  <strong>Mob Kills:</strong> {playerStatsData.kill_any || 0}
                </div>
                <div>
                  <strong>Walk Distance (blocks):</strong> {Math.floor((playerStatsData.walk_one_cm || 0) / 100)}
                </div>
                <div>
                  <strong>Diamond Ore Mined:</strong> {playerStatsData.mine_diamond_ore || 0}
                </div>
              </div>
              
              {/* Debug: Show all available stats */}
              <div className="mt-4">
                <h4 className="font-medium text-sm">Available Stats (first 20):</h4>
                <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                  {Object.entries(playerStatsData)
                    .filter(([, value]) => value > 0)
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{value.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Calculations */}
        {achievementCalculations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Achievement Calculations</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {achievementCalculations.map((calc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex-1">
                    <div className="font-medium">{calc.achievement_name} - {calc.tier_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Stat: {calc.stat_name} | Value: {calc.current_value} / {calc.threshold}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={calc.qualifies ? "default" : "secondary"}>
                      {calc.qualifies ? "Qualifies" : "Doesn't Qualify"}
                    </Badge>
                    <Badge variant="outline">{calc.points} XP</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementDebugPanel; 