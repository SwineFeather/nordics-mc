import { supabase } from '@/integrations/supabase/client';

export interface PlayerTownData {
  townName: string;
  nationName: string | null;
  isMayor: boolean;
  isKing: boolean;
  isResident: boolean;
}

export interface UserNationForums {
  nationName: string;
  towns: {
    name: string;
    isUserMayor: boolean;
  }[];
}

export class PlayerTownService {
  /**
   * Get the town and nation information for a player
   */
  static async getPlayerTownData(username: string): Promise<PlayerTownData | null> {
    try {
      // First, check if the player exists in the residents table
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('*')
        .eq('name', username)
        .single();

      if (residentError && residentError.code !== 'PGRST116') {
        throw residentError;
      }

      if (residentData) {
        // Player is a resident of a town
        return {
          townName: residentData.town_name || '',
          nationName: residentData.nation_name || null,
          isMayor: residentData.is_mayor || false,
          isKing: residentData.is_king || false,
          isResident: true
        };
      }

      // If not found in residents table, check if they are a mayor of any town (fallback)
      const { data: mayorTown, error: mayorError } = await supabase
        .from('towns')
        .select(`
          name,
          nations(name, leader_name)
        `)
        .eq('mayor_name', username)
        .single();

      if (mayorError && mayorError.code !== 'PGRST116') {
        throw mayorError;
      }

      if (mayorTown) {
        const isKing = mayorTown.nations?.leader_name === username;
        return {
          townName: mayorTown.name,
          nationName: mayorTown.nations?.name || null,
          isMayor: true,
          isKing,
          isResident: true
        };
      }

      // If not a mayor, check if they are a king (nation leader)
      const { data: kingNation, error: kingError } = await supabase
        .from('nations')
        .select('name, leader_name')
        .eq('leader_name', username)
        .single();

      if (kingError && kingError.code !== 'PGRST116') {
        throw kingError;
      }

      if (kingNation) {
        return {
          townName: '', // Kings might not have a specific town
          nationName: kingNation.name,
          isMayor: false,
          isKing: true,
          isResident: true
        };
      }

      // Player is not a resident of any town
      return null;

    } catch (error) {
      console.error('Error getting player town data:', error);
      return null;
    }
  }

  /**
   * Get the nation name for a player
   */
  static async getPlayerNation(username: string): Promise<string | null> {
    const playerData = await this.getPlayerTownData(username);
    return playerData?.nationName || null;
  }

  /**
   * Get all towns and forums for a user's nation
   */
  static async getUserNationForums(username: string): Promise<UserNationForums | null> {
    try {
      const playerData = await this.getPlayerTownData(username);
      if (!playerData?.nationName) {
        return null;
      }

      // Get all towns in the user's nation
      const { data: towns, error } = await supabase
        .from('towns')
        .select('name, mayor_name')
        .eq('nation_name', playerData.nationName);

      if (error) throw error;

      return {
        nationName: playerData.nationName,
        towns: towns?.map(town => ({
          name: town.name,
          isUserMayor: town.mayor_name === username
        })) || []
      };
    } catch (error) {
      console.error('Error getting user nation forums:', error);
      return null;
    }
  }

  /**
   * Check if a player can access a specific nation forum
   */
  static async canAccessNationForum(username: string, nationName: string): Promise<boolean> {
    const playerData = await this.getPlayerTownData(username);
    return playerData?.nationName === nationName;
  }

  /**
   * Check if a player can access a specific town forum
   */
  static async canAccessTownForum(username: string, nationName: string, townName: string): Promise<boolean> {
    try {
      // First check if the player is a resident of the specific town
      const { data: resident, error: residentError } = await supabase
        .from('residents')
        .select('nation_name')
        .eq('name', username)
        .eq('town_name', townName)
        .single();

      if (residentError && residentError.code !== 'PGRST116') {
        throw residentError;
      }

      if (resident) {
        return resident.nation_name === nationName;
      }

      // Fallback: check if the player is mayor of the specific town in the specific nation
      const { data: town, error } = await supabase
        .from('towns')
        .select('id')
        .eq('mayor_name', username)
        .eq('name', townName)
        .eq('nation_name', nationName)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!town;
    } catch (error) {
      console.error('Error checking town forum access:', error);
      return false;
    }
  }

  /**
   * Get all players who are mayors of towns in a specific nation
   */
  static async getNationMayors(nationName: string): Promise<string[]> {
    try {
      const { data: towns, error } = await supabase
        .from('towns')
        .select('mayor_name')
        .eq('nation_name', nationName);
      
      if (error) throw error;
      return towns?.map(town => town.mayor_name).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting nation mayors:', error);
      return [];
    }
  }

  /**
   * Get all nation kings
   */
  static async getNationKings(): Promise<{ nationName: string; leader: string }[]> {
    try {
      const { data: nations, error } = await supabase
        .from('nations')
        .select('name, leader_name')
        .not('leader_name', 'is', null);
      
      if (error) throw error;
      return nations?.map(nation => ({
        nationName: nation.name,
        leader: nation.leader_name
      })) || [];
    } catch (error) {
      console.error('Error getting nation kings:', error);
      return [];
    }
  }

  /**
   * Format nation name for display
   */
  static formatNationName(nationName: string): string {
    return nationName.replace(/_/g, ' ');
  }
} 