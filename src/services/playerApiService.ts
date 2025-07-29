export interface PlayerData {
  is_mayor: boolean;
  last_seen: number;
  town: string;
  is_king: boolean;
  nation: string;
  name: string;
  online: boolean;
  registered: number;
  uuid: string;
}

export class PlayerApiService {
  private baseUrl = 'https://townywebpanel.nordics.world/api';

  async getPlayerData(username: string): Promise<PlayerData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Player ${username} not found`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching player data for ${username}:`, error);
      return null;
    }
  }

  async getPlayerNation(username: string): Promise<string | null> {
    const playerData = await this.getPlayerData(username);
    return playerData?.nation || null;
  }

  formatNationName(nationName: string): string {
    return nationName.replace(/_/g, ' ');
  }
}

export const playerApiService = new PlayerApiService(); 