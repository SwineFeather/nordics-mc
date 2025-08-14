import { supabase } from '@/integrations/supabase/client';

// Database types matching the actual schema
interface DatabaseTown {
  id: number;
  name: string;
  mayor_uuid: string;
  mayor_name: string | null;
  balance: number | null;
  world_name: string | null;
  location_x: number | null;
  location_z: number | null;
  spawn_x: number | null;
  spawn_y: number | null;
  spawn_z: number | null;
  spawn_yaw: number | null;
  spawn_pitch: number | null;
  board: string | null;
  tag: string | null;
  is_public: boolean | null;
  is_open: boolean | null;
  max_residents: number | null;
  min_residents: number | null;
  max_plots: number | null;
  min_plots: number | null;
  taxes: number | null;
  plot_tax: number | null;
  shop_tax: number | null;
  embassy_tax: number | null;
  plot_price: number | null;
  nation_id: number | null;
  nation_name: string | null;
  nation_uuid: string | null;
  is_capital: boolean | null;
  residents_count: number | null;
  plots_count: number | null;
  home_block_count: number | null;
  shop_plot_count: number | null;
  embassy_plot_count: number | null;
  wild_plot_count: number | null;
  residents: any | null;
  last_activity: string | null;
  activity_score: number | null;
  growth_rate: number | null;
  market_value: number | null;
  level: number | null;
  total_xp: number | null;
  image_url: string | null;
  description: string | null;
  created_at: string | null;
  last_updated: string | null;
}

interface DatabaseNation {
  id: number;
  name: string;
  leader_uuid: string;
  king_uuid: string;
  king_name: string | null;
  leader_name: string | null;
  capital_town_id: number | null;
  capital_town_name: string | null;
  capital_name: string | null;
  capital_uuid: string | null;
  balance: number | null;
  board: string | null;
  tag: string | null;
  taxes: number | null;
  town_tax: number | null;
  max_towns: number | null;
  is_open: boolean | null;
  is_public: boolean | null;
  towns_count: number | null;
  residents_count: number | null;
  ally_count: number | null;
  enemy_count: number | null;
  last_activity: string | null;
  activity_score: number | null;
  growth_rate: number | null;
  created_at: string | null;
  last_updated: string | null;
}

export interface SupabaseTownData {
  id: string;
  name: string;
  mayor: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
  balance?: number;
  level?: number;
  total_xp?: number;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  description?: string | null;
  location_x?: number | null;
  location_z?: number | null;
  // Additional fields for compatibility
  capital?: boolean;
  public?: boolean;
  resident_count?: number;
  created?: number;
  plots?: any[];
  open?: boolean;
  spawn?: {
    world: string;
    x: number;
    y: number;
    z: number;
  };
  nation?: {
    id: string;
    name: string;
    type: string;
    color: string;
    description: string;
    capital: string;
    leader: string;
    bank: string;
    daily_upkeep: string;
    government: string;
    motto: string;
    specialties: string[];
    history?: string;
    balance?: number;
  };
  residents: TownResident[];
}

export interface TownResident {
  name: string;
  uuid: string;
  is_mayor: boolean;
  is_co_mayor?: boolean;
  is_king?: boolean;
  joined?: number;
  last_online?: number;
}

export interface SupabaseNationData {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  capital: string;
  leader: string;
  leader_name?: string; // Add this field for compatibility
  population: number;
  bank: string;
  daily_upkeep: string;
  founded: string;
  lore: string;
  government: string;
  motto: string;
  specialties: string[];
  history?: string;
  image_url?: string | null;
  created_at: string;
  ally_count?: number;
  towns_count?: number;
}

export class SupabaseTownService {
  static async getTown(name: string): Promise<SupabaseTownData | null> {
    try {
      console.log(`Fetching town data from Supabase for: ${name}`);
      
      // Fetch town data using the actual schema
      const { data: town, error: townError } = await supabase
        .from('towns')
        .select('*')
        .eq('name', name)
        .single();

      if (townError) {
        console.error('Error fetching town:', townError);
        return null;
      }

      if (!town) {
        console.log(`Town not found: ${name}`);
        return null;
      }

      // Cast to the correct database type
      const dbTown = town as unknown as DatabaseTown;

      // Use nation_name directly from the towns table
      let nationData = null;
      if (dbTown.nation_name) {
        // Create a simple nation object from the town's nation_name
        nationData = {
          id: dbTown.nation_id?.toString() || 'unknown',
          name: dbTown.nation_name,
          type: 'Nation',
          color: '#1e40af',
          description: '',
          capital: '',
          leader: 'Unknown',
          population: 0,
          bank: '0',
          daily_upkeep: '0',
          founded: 'Unknown',
          lore: '',
          government: 'Monarchy',
          motto: '',
          specialties: [],
          history: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Parse residents from JSONB field
      const residents = this.parseResidentsFromJsonb(dbTown.residents, dbTown.mayor_name, dbTown.mayor_uuid);
      
      // Map the actual database fields to the expected interface
      const townData: SupabaseTownData = {
        id: dbTown.id.toString(),
        name: dbTown.name,
        mayor: dbTown.mayor_name || 'Unknown',
        population: dbTown.residents_count || 0,
        type: 'Town', // Default type
        status: dbTown.is_open ? 'Open' : 'Closed',
        founded: dbTown.created_at ? new Date(dbTown.created_at).toISOString().split('T')[0] : 'Unknown',
        nation_id: dbTown.nation_id?.toString(),
        is_independent: !dbTown.nation_id,
        balance: Number(dbTown.balance) || 0,
        level: dbTown.level || 1,
        total_xp: Number(dbTown.total_xp) || 0,
        image_url: dbTown.image_url || null,
        description: dbTown.description || null,
        created_at: dbTown.created_at || new Date().toISOString(),
        updated_at: dbTown.last_updated || new Date().toISOString(),
        nation: nationData,
        capital: dbTown.is_capital || false,
        public: dbTown.is_public || false,
        resident_count: dbTown.residents_count || 0,
        created: dbTown.created_at ? new Date(dbTown.created_at).getTime() : Date.now(),
        plots: this.mapPlotsFromDatabase(dbTown),
        open: dbTown.is_open || false,
        spawn: {
          world: dbTown.world_name || "world",
          x: dbTown.spawn_x || 1000,
          y: dbTown.spawn_y || 64,
          z: dbTown.spawn_z || 1000
        },
        residents: residents
      };

      console.log(`Successfully fetched town data for ${name}:`, townData);
      return townData;
    } catch (error) {
      console.error('Error in getTown:', error);
      return null;
    }
  }

  static mapPlotsFromDatabase(dbTown: DatabaseTown): any[] {
    // Use plots_count from the database
    const totalPlots = dbTown.plots_count || 0;
    
    if (totalPlots > 0) {
      return [{
        type: 'total',
        count: totalPlots
      }];
    }
    
    return [];
  }

  static parseResidentsFromJsonb(residentsJsonb: any, mayorName: string | null, mayorUuid: string): TownResident[] {
    try {
      if (!residentsJsonb || typeof residentsJsonb !== 'object') {
        // Return just the mayor if no residents data
        return [{
          name: mayorName || 'Unknown',
          uuid: mayorUuid || 'unknown',
          is_mayor: true,
          is_co_mayor: false,
          is_king: false,
          joined: Date.now() - (365 * 24 * 60 * 60 * 1000),
          last_online: Date.now()
        }];
      }

      // Parse the JSONB residents data
      const residents: TownResident[] = [];
      
      // Add mayor first
      residents.push({
        name: mayorName || 'Unknown',
        uuid: mayorUuid || 'unknown',
        is_mayor: true,
        is_co_mayor: false,
        is_king: false,
        joined: Date.now() - (365 * 24 * 60 * 60 * 1000),
        last_online: Date.now()
      });

      // Add other residents from JSONB
      if (Array.isArray(residentsJsonb)) {
        residentsJsonb.forEach((resident: any) => {
          if (resident.name && resident.name !== mayorName) {
            residents.push({
              name: resident.name,
              uuid: resident.uuid || 'unknown',
              is_mayor: false,
              is_co_mayor: resident.is_co_mayor || false,
              is_king: false,
              joined: Date.now() - (365 * 24 * 60 * 60 * 1000),
              last_online: Date.now()
            });
          }
        });
      }

      return residents;
    } catch (error) {
      console.error('Error parsing residents from JSONB:', error);
      return [{
        name: mayorName || 'Unknown',
        uuid: mayorUuid || 'unknown',
        is_mayor: true,
        is_co_mayor: false,
        is_king: false,
        joined: Date.now() - (365 * 24 * 60 * 60 * 1000),
        last_online: Date.now()
      }];
    }
  }

  static mapNationData(nation: any): SupabaseNationData {
    return {
      id: nation.id.toString(),
      name: nation.name,
      type: nation.type || 'Nation', // Default type
      color: nation.color || '#1e40af', // Default color
      description: nation.description || nation.board || '',
      capital: nation.capital || nation.capital_town_name || nation.capital_name || '',
      leader: nation.leader || nation.leader_name || nation.king_name || 'Unknown',
      leader_name: nation.leader_name || nation.leader || nation.king_name || 'Unknown', // Add this for compatibility
      population: nation.population || nation.residents_count || 0,
      bank: nation.bank || nation.balance?.toString() || '0',
      daily_upkeep: nation.daily_upkeep || nation.taxes?.toString() || '0',
      founded: nation.founded || (nation.created_at ? new Date(nation.created_at).toISOString().split('T')[0] : 'Unknown'),
      lore: nation.lore || nation.board || '',
      government: nation.government || 'Monarchy', // Default government type
      motto: nation.motto || nation.tag || '',
      specialties: nation.specialties || [], // Default empty specialties
      history: nation.history || nation.board || '',
      image_url: nation.image_url || null, // Will be populated from the new nations table
      created_at: nation.created_at || new Date().toISOString(),
      ally_count: nation.ally_count || 0,
      towns_count: nation.towns_count || 0
    };
  }

  static async getTownResidents(name: string): Promise<TownResident[]> {
    try {
      console.log(`Fetching residents for town: ${name}`);
      
      // Get the town data to access the residents JSONB field
      const { data: town, error } = await supabase
        .from('towns')
        .select('residents, mayor_name, mayor_uuid')
        .eq('name', name)
        .single();

      if (error || !town) {
        console.error('Error fetching town for residents:', error);
        return [];
      }

      const dbTown = town as unknown as Pick<DatabaseTown, 'residents' | 'mayor_name' | 'mayor_uuid'>;
      return this.parseResidentsFromJsonb(dbTown.residents, dbTown.mayor_name, dbTown.mayor_uuid);
    } catch (error) {
      console.error('Error fetching residents:', error);
      return [];
    }
  }

  static async isUserCoMayor(townName: string, username: string): Promise<boolean> {
    try {
      const residents = await this.getTownResidents(townName);
      return residents.some(resident => 
        resident.name === username && resident.is_co_mayor === true
      );
    } catch (error) {
      console.error('Error checking co-mayor status:', error);
      return false;
    }
  }

  static async getAllTowns(): Promise<SupabaseTownData[]> {
    try {
      // Fetching all towns from Supabase
      
      // Fetch towns using the actual schema
      const { data: towns, error } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      // Raw towns response

      if (error) {
        console.error('❌ Error fetching towns:', error);
        throw new Error(`Failed to fetch towns: ${error.message}`);
      }

      if (!towns || towns.length === 0) {
        console.error('❌ No towns found in database! Database appears to be empty.');
        throw new Error('No towns found in database.');
      }

      // Found towns in database

      // Use nation_name directly from the towns table
      const townsWithNations = await Promise.all(
        (towns || []).map(async (town) => {
          const dbTown = town as unknown as DatabaseTown;
          let nationData = null;
          
          if (dbTown.nation_name) {
            // Create a simple nation object from the town's nation_name
            nationData = {
              id: dbTown.nation_id?.toString() || 'unknown',
              name: dbTown.nation_name,
              type: 'Nation',
              color: '#1e40af',
              description: '',
              capital: '',
              leader: 'Unknown',
              population: 0,
              bank: '0',
              daily_upkeep: '0',
              founded: 'Unknown',
              lore: '',
              government: 'Monarchy',
              motto: '',
              specialties: [],
              history: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            // Found nation for town
          } else {
            // Town is independent
          }

          // Parse residents from JSONB
          const residents = this.parseResidentsFromJsonb(dbTown.residents, dbTown.mayor_name, dbTown.mayor_uuid);
          
          // Map the actual database fields to the expected interface
          const townData: SupabaseTownData = {
            id: dbTown.id.toString(),
            name: dbTown.name,
            mayor: dbTown.mayor_name || 'Unknown',
            population: dbTown.residents_count || 0,
            type: 'Town', // Default type
            status: dbTown.is_open ? 'Open' : 'Closed',
            founded: dbTown.created_at ? new Date(dbTown.created_at).toISOString().split('T')[0] : 'Unknown',
            nation_id: dbTown.nation_id?.toString(),
            is_independent: !dbTown.nation_id,
            balance: Number(dbTown.balance) || 0,
            level: dbTown.level || 1,
            total_xp: Number(dbTown.total_xp) || 0,
            image_url: dbTown.image_url || null,
            description: dbTown.description || null,
            location_x: dbTown.location_x,
            location_z: dbTown.location_z,
            created_at: dbTown.created_at || new Date().toISOString(),
            updated_at: dbTown.last_updated || new Date().toISOString(),
            nation: nationData,
            capital: dbTown.is_capital || false,
            public: dbTown.is_public || false,
            resident_count: dbTown.residents_count || 0,
            created: dbTown.created_at ? new Date(dbTown.created_at).getTime() : Date.now(),
            plots: this.mapPlotsFromDatabase(dbTown),
            open: dbTown.is_open || false,
            spawn: {
              world: dbTown.world_name || "world",
              x: dbTown.spawn_x || 1000,
              y: dbTown.spawn_y || 64,
              z: dbTown.spawn_z || 1000
            },
            residents: residents
          };

          // Processed town ${dbTown.name}
          // Removed debug logging to reduce console noise

          return townData;
        })
      );

      // Successfully processed towns with nation data
      return townsWithNations;
    } catch (error) {
      console.error('💥 Error in getAllTowns:', error);
      throw error;
    }
  }

  static async getAllNations(): Promise<SupabaseNationData[]> {
    try {
      // Fetching all nations from Supabase
      
      const { data: nations, error } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      // Raw nations response

      if (error) {
        console.error('❌ Error fetching nations:', error);
        throw new Error(`Failed to fetch nations: ${error.message}`);
      }

      if (!nations || nations.length === 0) {
        console.error('❌ No nations found in database! Database appears to be empty.');
        throw new Error('No nations found in database.');
      }

      // Found nations in database

      // Map the actual database fields to the expected interface
      const mappedNations: SupabaseNationData[] = nations.map(nation => {
        const dbNation = nation as unknown as DatabaseNation;
        return {
          id: dbNation.id.toString(),
          name: dbNation.name,
          type: 'Nation', // Default type
          color: '#1e40af', // Default color
          description: dbNation.board || '',
          capital: dbNation.capital_town_name || dbNation.capital_name || '',
          leader: dbNation.leader_name || dbNation.king_name || 'Unknown',
          population: dbNation.residents_count || 0,
          bank: dbNation.balance?.toString() || '0',
          daily_upkeep: dbNation.taxes?.toString() || '0',
          founded: dbNation.created_at ? new Date(dbNation.created_at).toISOString().split('T')[0] : 'Unknown',
          lore: dbNation.board || '',
          government: 'Monarchy', // Default government type
          motto: dbNation.tag || '',
          specialties: [], // Default empty specialties
          history: dbNation.board || '',
          created_at: dbNation.created_at || new Date().toISOString(),
          updated_at: dbNation.last_updated || new Date().toISOString(),
          ally_count: dbNation.ally_count || 0,
          towns_count: dbNation.towns_count || 0
        };
      });

      return mappedNations;
    } catch (error) {
      console.error('💥 Error in getAllNations:', error);
      throw error;
    }
  }

  static async getNation(id: string): Promise<SupabaseNationData | null> {
    try {
      console.log(`Fetching nation data from Supabase for ID: ${id}`);
      
      const { data: nation, error } = await supabase
        .from('nations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching nation:', error);
        return null;
      }

      if (!nation) {
        console.log(`Nation not found: ${id}`);
        return null;
      }

      const dbNation = nation as unknown as DatabaseNation;

      // Map to expected interface
      const mappedNation: SupabaseNationData = {
        id: dbNation.id.toString(),
        name: dbNation.name,
        type: 'Nation',
        color: '#1e40af',
        description: dbNation.board || '',
        capital: dbNation.capital_town_name || dbNation.capital_name || '',
        leader: dbNation.leader_name || dbNation.king_name || 'Unknown',
        population: dbNation.residents_count || 0,
        bank: dbNation.balance?.toString() || '0',
        daily_upkeep: dbNation.taxes?.toString() || '0',
        founded: dbNation.created_at ? new Date(dbNation.created_at).toISOString().split('T')[0] : 'Unknown',
        lore: dbNation.board || '',
        government: 'Monarchy',
        motto: dbNation.tag || '',
        specialties: [],
        history: dbNation.board || '',
        created_at: dbNation.created_at || new Date().toISOString(),
        ally_count: dbNation.ally_count || 0,
        towns_count: dbNation.towns_count || 0
      };

      console.log(`Successfully fetched nation: ${mappedNation.name}`);
      return mappedNation;
    } catch (error) {
      console.error('Error in getNation:', error);
      return null;
    }
  }

  static async getNationsWithTowns(): Promise<(SupabaseNationData & { towns: SupabaseTownData[] })[]> {
    try {
      console.log('🔍 Fetching nations with their towns from Supabase...');
      
      // First, fetch all nations
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (nationsError) {
        console.error('❌ Error fetching nations:', nationsError);
        throw new Error(`Failed to fetch nations: ${nationsError.message}`);
      }

      if (!nations || nations.length === 0) {
        console.error('❌ No nations found in database! Database appears to be empty.');
        throw new Error('No nations found in database.');
      }

      // Found nations in database

      // Fetch all towns at once
      const { data: allTowns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (townsError) {
        console.error('❌ Error fetching towns:', townsError);
        throw new Error(`Failed to fetch towns: ${townsError.message}`);
      }

      // Found total towns in database

      // Group towns by nation_name
      const townsByNation = new Map<string, DatabaseTown[]>();
      (allTowns || []).forEach(town => {
        const dbTown = town as unknown as DatabaseTown;
        if (dbTown.nation_name) {
          if (!townsByNation.has(dbTown.nation_name)) {
            townsByNation.set(dbTown.nation_name, []);
          }
          townsByNation.get(dbTown.nation_name)!.push(dbTown);
        }
      });

      // Towns grouped by nation

      // Map nations with their towns
      const nationsWithTowns = await Promise.all((nations || []).map(async (nation) => {
        const dbNation = nation as unknown as DatabaseNation;
        const nationTowns = townsByNation.get(dbNation.name) || [];
        
        // Nation has towns

        // Map towns to expected interface
        const mappedTowns: SupabaseTownData[] = nationTowns.map(town => {
          const dbTown = town as unknown as DatabaseTown;
          return {
            id: dbTown.id.toString(),
            name: dbTown.name,
            mayor: dbTown.mayor_name || 'Unknown',
            population: dbTown.residents_count || 0,
            type: 'Town',
            status: dbTown.is_open ? 'Open' : 'Closed',
            founded: dbTown.created_at ? new Date(dbTown.created_at).toISOString().split('T')[0] : 'Unknown',
            nation_id: dbTown.nation_id?.toString(),
            is_independent: !dbTown.nation_name,
            balance: Number(dbTown.balance) || 0,
            level: 1,
            total_xp: 0,
            created_at: dbTown.created_at || new Date().toISOString(),
            updated_at: dbTown.last_updated || new Date().toISOString(),
            capital: dbTown.is_capital || false,
            public: dbTown.is_public || false,
            resident_count: dbTown.residents_count || 0,
            created: dbTown.created_at ? new Date(dbTown.created_at).getTime() : Date.now(),
            plots: [],
            open: dbTown.is_open || false,
            spawn: {
              world: dbTown.world_name || "world",
              x: dbTown.spawn_x || 1000,
              y: dbTown.spawn_y || 64,
              z: dbTown.spawn_z || 1000
            },
            residents: this.parseResidentsFromJsonb(dbTown.residents, dbTown.mayor_name, dbTown.mayor_uuid)
          };
        });

        // Get the nation data from the new nations table to include image_url
        const mappedNation = this.mapNationData(dbNation);
        
        // Try to get the image_url from the new nations table
        try {
          const { data: newNationData } = await supabase
            .from('nations')
            .select('image_url')
            .eq('name', dbNation.name)
            .single();
          
          if (newNationData?.image_url) {
            mappedNation.image_url = newNationData.image_url;
          }
        } catch (error) {
          console.log(`No image_url found for nation ${dbNation.name}`);
        }

        return {
          ...mappedNation,
          towns: mappedTowns
        };
      }));

      // Successfully fetched nations with their towns
      return nationsWithTowns;
    } catch (error) {
      console.error('💥 Error in getNationsWithTowns:', error);
      throw error;
    }
  }

  static async testDatabaseConnection(): Promise<void> {
    try {
      console.log('🧪 Testing Supabase database connection...');
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('nations')
        .select('count');
      
      console.log('🔗 Connection test result:', { data: testData, error: testError });
      
      // Test nations table
      const { data: nations, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .limit(1);
      
      console.log('🏛️ Nations table test:', { data: nations, error: nationsError });
      
      // Test towns table
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .limit(1);
      
      console.log('🏘️ Towns table test:', { data: towns, error: townsError });
      
    } catch (error) {
      console.error('💥 Database connection test failed:', error);
    }
  }

  static async checkDatabaseState(): Promise<void> {
    try {
      console.log('🔍 Checking database state...');
      
      // Check if tables exist and get counts
      const { count: nationsCount, error: nationsCountError } = await supabase
        .from('nations')
        .select('*', { count: 'exact', head: true });
      
      console.log('🏛️ Nations table check:', { count: nationsCount, error: nationsCountError });
      
      const { count: townsCount, error: townsCountError } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });
      
      console.log('🏘️ Towns table check:', { count: townsCount, error: townsCountError });
      
      // If tables exist but are empty, show migration status
      if (nationsCount === 0 && townsCount === 0) {
        console.error('❌ Database tables exist but are EMPTY!');
        console.error('❌ The migration file exists but has not been run on your Supabase instance.');
        console.error('❌ You need to run the migration: 20250616140125-1c14cbcf-9303-403c-aaf2-5abbdeacfdd0.sql');
        throw new Error('Database tables are empty. Migration has not been run.');
      }
      
      // Show sample data if it exists
      if (nationsCount && nationsCount > 0) {
        const { data: sampleNations } = await supabase
          .from('nations')
          .select('name, leader, population')
          .limit(3);
        console.log('📊 Sample nations data:', sampleNations);
      }
      
      if (townsCount && townsCount > 0) {
        const { data: sampleTowns } = await supabase
          .from('towns')
          .select('name, mayor, population, nation_id')
          .limit(3);
        console.log('📊 Sample towns data:', sampleTowns);
      }
      
    } catch (error) {
      console.error('💥 Database state check failed:', error);
      throw error;
    }
  }

  static async showExactDataSources(): Promise<void> {
    try {
      console.log('🔍 SHOWING EXACT DATA SOURCES AND WHAT IS BEING FETCHED');
      console.log('='.repeat(80));
      
      // 1. SUPABASE CONNECTION INFO
      console.log('📡 SUPABASE CONNECTION:');
      console.log('   URL: https://erdconvorgecupvavlwv.supabase.co');
      console.log('   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      console.log('');
      
      // 2. CHECK IF TABLES EXIST AND HAVE DATA
      console.log('📊 DATABASE TABLES CHECK:');
      
      const { count: nationsCount, error: nationsCountError } = await supabase
        .from('nations')
        .select('*', { count: 'exact', head: true });
      
      const { count: townsCount, error: townsCountError } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });
      
      console.log(`   Nations table: ${nationsCount || 0} records ${nationsCountError ? '(ERROR: ' + nationsCountError.message + ')' : ''}`);
      console.log(`   Towns table: ${townsCount || 0} records ${townsCountError ? '(ERROR: ' + townsCountError.message + ')' : ''}`);
      console.log('');
      
      // 3. SHOW ACTUAL DATA FROM SUPABASE
      if (nationsCount && nationsCount > 0) {
        console.log('🏛️ ACTUAL NATIONS DATA FROM SUPABASE:');
        const { data: nations, error: nationsError } = await supabase
          .from('nations')
          .select('*')
          .order('name');
        
        if (nationsError) {
          console.log(`   ERROR fetching nations: ${nationsError.message}`);
        } else {
          nations?.forEach((nation, index) => {
            console.log(`   ${index + 1}. ${nation.name}`);
            console.log(`      ID: ${nation.id}`);
            console.log(`      Leader: ${nation.leader}`);
            console.log(`      Population: ${nation.population}`);
            console.log(`      Capital: ${nation.capital}`);
            console.log(`      Founded: ${nation.founded}`);
            console.log(`      Bank: ${nation.bank}`);
            console.log(`      Type: ${nation.type}`);
            console.log(`      Color: ${nation.color}`);
            console.log('');
          });
        }
      }
      
      if (townsCount && townsCount > 0) {
        console.log('🏘️ ACTUAL TOWNS DATA FROM SUPABASE:');
        const { data: towns, error: townsError } = await supabase
          .from('towns')
          .select('*')
          .order('name');
        
        if (townsError) {
          console.log(`   ERROR fetching towns: ${townsError.message}`);
        } else {
          towns?.forEach((town, index) => {
            console.log(`   ${index + 1}. ${town.name}`);
            console.log(`      ID: ${town.id}`);
            console.log(`      Mayor: ${town.mayor}`);
            console.log(`      Population: ${town.population}`);
            console.log(`      Type: ${town.type}`);
            console.log(`      Status: ${town.status}`);
            console.log(`      Founded: ${town.founded}`);
            console.log(`      Nation ID: ${town.nation_id || 'Independent'}`);
            console.log(`      Is Independent: ${town.is_independent}`);
            console.log('');
          });
        }
      }
      
      // 4. SHOW WHAT DATA IS BEING USED IN THE APP
      console.log('🎯 DATA BEING USED IN THE APPLICATION:');
      
      if (nationsCount === 0 && townsCount === 0) {
        console.log('   ❌ NO DATA AVAILABLE - Database is empty!');
        console.log('   ❌ The migration file exists but has not been run.');
        console.log('   ❌ You need to run: 20250616140125-1c14cbcf-9303-403c-aaf2-5abbdeacfdd0.sql');
      } else {
        console.log('   ✅ Using REAL data from Supabase tables');
        console.log('   📍 Towns data source: supabase.towns table');
        console.log('   📍 Nations data source: supabase.nations table');
        console.log('   📍 Residents data source: Hardcoded in getTownResidents() method');
        console.log('   📍 Plots data source: Empty array (not implemented)');
        console.log('   📍 Spawn coordinates: Hardcoded (world, 1000, 64, 1000)');
      }
      
      console.log('='.repeat(80));
      
    } catch (error) {
      console.error('💥 Error showing data sources:', error);
    }
  }

  static async checkDatabaseSchema(): Promise<void> {
    try {
      console.log('🔍 CHECKING ACTUAL DATABASE SCHEMA');
      console.log('='.repeat(80));
      
      // Check towns table structure
      console.log('🏘️ TOWNS TABLE STRUCTURE:');
      const { data: townsSample, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .limit(1);
      
      if (townsError) {
        console.log(`   ERROR: ${townsError.message}`);
      } else if (townsSample && townsSample.length > 0) {
        const townColumns = Object.keys(townsSample[0]);
        console.log(`   Available columns: ${townColumns.join(', ')}`);
        console.log('   Sample data:', townsSample[0]);
      } else {
        console.log('   Table exists but is empty');
      }
      console.log('');
      
      // Check nations table structure
      console.log('🏛️ NATIONS TABLE STRUCTURE:');
      const { data: nationsSample, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .limit(1);
      
      if (nationsError) {
        console.log(`   ERROR: ${nationsError.message}`);
      } else if (nationsSample && nationsSample.length > 0) {
        const nationColumns = Object.keys(nationsSample[0]);
        console.log(`   Available columns: ${nationColumns.join(', ')}`);
        console.log('   Sample data:', nationsSample[0]);
      } else {
        console.log('   Table exists but is empty');
      }
      console.log('');
      
      // Check forum_categories table structure
      console.log('📝 FORUM_CATEGORIES TABLE STRUCTURE:');
      const { data: forumSample, error: forumError } = await supabase
        .from('forum_categories')
        .select('*')
        .limit(1);
      
      if (forumError) {
        console.log(`   ERROR: ${forumError.message}`);
      } else if (forumSample && forumSample.length > 0) {
        const forumColumns = Object.keys(forumSample[0]);
        console.log(`   Available columns: ${forumColumns.join(', ')}`);
        console.log('   Sample data:', forumSample[0]);
      } else {
        console.log('   Table exists but is empty');
      }
      
      console.log('='.repeat(80));
      
    } catch (error) {
      console.error('💥 Error checking database schema:', error);
    }
  }

  static async createMissingTables(): Promise<void> {
    try {
      console.log('🔧 CREATING MISSING TABLES AND COLUMNS');
      console.log('='.repeat(80));
      
      // Check if towns table exists and has the right columns
      const { data: townsSample, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .limit(1);
      
      if (townsError && townsError.message.includes('does not exist')) {
        console.log('❌ Towns table does not exist. Creating it...');
        // Note: We can't create tables via the client, this would need to be done via migration
        console.log('⚠️ Cannot create tables via client. Please run the migration manually.');
        return;
      }
      
      if (townsSample && townsSample.length > 0) {
        const townColumns = Object.keys(townsSample[0]);
        console.log(`✅ Towns table exists with columns: ${townColumns.join(', ')}`);
        
        // Check if mayor column exists
        if (!townColumns.includes('mayor')) {
          console.log('❌ Mayor column is missing from towns table!');
          console.log('⚠️ This suggests the migration has not been run properly.');
        } else {
          console.log('✅ Mayor column exists');
        }
      }
      
      // Check if nations table exists
      const { data: nationsSample, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .limit(1);
      
      if (nationsError && nationsError.message.includes('does not exist')) {
        console.log('❌ Nations table does not exist. Creating it...');
        console.log('⚠️ Cannot create tables via client. Please run the migration manually.');
        return;
      }
      
      if (nationsSample && nationsSample.length > 0) {
        const nationColumns = Object.keys(nationsSample[0]);
        console.log(`✅ Nations table exists with columns: ${nationColumns.join(', ')}`);
      }
      
      console.log('');
      console.log('📋 RECOMMENDED ACTION:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration: 20250616140125-1c14cbcf-9303-403c-aaf2-5abbdeacfdd0.sql');
      console.log('4. This will create the proper tables with all required columns');
      
      console.log('='.repeat(80));
      
    } catch (error) {
      console.error('💥 Error checking/creating tables:', error);
    }
  }
} 