import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerLeaderboardData {
  player_name: string;
  total_points: number;
  bronze_count: number;
  silver_count: number;
  gold_count: number;
  last_seen_formatted: string;
}

export const usePlayerLeaderboard = (playerUuid: string) => {
  const [data, setData] = useState<PlayerLeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerUuid) {
      setLoading(false);
      return;
    }

    const fetchPlayerLeaderboard = async () => {
      try {
        setLoading(true);
        
        // First, get the player's name from the players table
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('name, last_seen')
          .eq('uuid', playerUuid)
          .single();

        if (playerError) {
          throw playerError;
        }

        if (!playerData) {
          throw new Error('Player not found');
        }

        // Get the points leaderboard data for this specific player
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .rpc('get_points_leaderboard'); // Get all players to find this one

        if (leaderboardError) {
          throw leaderboardError;
        }

        // Find the specific player in the leaderboard data
        const playerLeaderboardData = leaderboardData?.find(
          (item: any) => item.player_name === playerData.name
        );

        if (playerLeaderboardData) {
          const leaderboardData: PlayerLeaderboardData = {
            player_name: playerLeaderboardData.player_name,
            total_points: parseFloat(playerLeaderboardData.total_points) || 0,
            bronze_count: playerLeaderboardData.bronze_count || 0,
            silver_count: playerLeaderboardData.silver_count || 0,
            gold_count: playerLeaderboardData.gold_count || 0,
            last_seen_formatted: playerData.last_seen 
              ? new Date(playerData.last_seen * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Unknown'
          };
          
          setData(leaderboardData);
        } else {
          // Player not found in leaderboard, create empty data
          setData({
            player_name: playerData.name,
            total_points: 0,
            bronze_count: 0,
            silver_count: 0,
            gold_count: 0,
            last_seen_formatted: playerData.last_seen 
              ? new Date(playerData.last_seen * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Unknown'
          });
        }
      } catch (err) {
        console.error('Error fetching player leaderboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerLeaderboard();
  }, [playerUuid]);

  return { data, loading, error };
}; 