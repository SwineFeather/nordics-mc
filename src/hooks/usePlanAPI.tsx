
import { useState, useEffect } from 'react';

interface PlayerData {
  players_online?: number;
}

interface ServerStats {
  players_online?: number;
}

export const usePlanAPI = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - this can be replaced with actual API calls later
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setPlayerData({ players_online: 0 });
        setServerStats({ players_online: 0 });
      } catch (error) {
        console.error('Error fetching plan API data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    playerData,
    serverStats,
    loading
  };
};
