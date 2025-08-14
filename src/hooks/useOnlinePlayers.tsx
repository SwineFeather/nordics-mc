import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface OnlinePlayer {
  name: string;
  uuid?: string;
  isWebsiteUser?: boolean;
}

export const useOnlinePlayers = () => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchOnlinePlayers = async () => {
      try {
        setLoading(true);
        
        // Fetch Minecraft server online players
        const serverResponse = await fetch('https://api.mcsrvstat.us/3/nordics.world');
        const serverData = await serverResponse.json();
        
        console.log('Server data:', serverData); // Debug log
        
        // Handle different possible API response structures
        let playerList: string[] = [];
        if (serverData.players?.list && Array.isArray(serverData.players.list)) {
          playerList = serverData.players.list;
        } else if (serverData.players && Array.isArray(serverData.players)) {
          playerList = serverData.players;
        } else if (serverData.online && Array.isArray(serverData.online)) {
          playerList = serverData.online;
        }
        
        console.log('Player list:', playerList); // Debug log
        
        const minecraftPlayers: OnlinePlayer[] = playerList.map((player: string) => ({
          name: player,
          isWebsiteUser: false
        }));

        // Add current website user if they're logged in
        const websitePlayers: OnlinePlayer[] = [];
        if (profile?.minecraft_username) {
          websitePlayers.push({
            name: profile.minecraft_username,
            uuid: profile.id,
            isWebsiteUser: true
          });
        }

        // Combine both lists, removing duplicates
        const allPlayers = [...websitePlayers];
        minecraftPlayers.forEach(mcPlayer => {
          if (!allPlayers.find(p => p.name.toLowerCase() === mcPlayer.name.toLowerCase())) {
            allPlayers.push(mcPlayer);
          }
        });

        setOnlinePlayers(allPlayers);
      } catch (error) {
        console.error('Failed to fetch online players:', error);
        // Fallback: just show website user if available
        if (profile?.minecraft_username) {
          setOnlinePlayers([{
            name: profile.minecraft_username,
            uuid: profile.id,
            isWebsiteUser: true
          }]);
        } else {
          setOnlinePlayers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOnlinePlayers();
    
    // Update every 30 seconds
    const interval = setInterval(fetchOnlinePlayers, 30000);
    
    return () => clearInterval(interval);
  }, [profile]);

  return { onlinePlayers: onlinePlayers || [], loading };
};
