import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://townywebpanel.nordics.world/api';

// Check if we're on a domain that might have CORS issues
const isExternalDomain = !window.location.hostname.includes('localhost') && 
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('townywebpanel.nordics.world');

// Mock data for fallback when API is unavailable
const mockTownData: TownApiData = {
  capital: true,
  spawn: {
    world: "world",
    x: 1000,
    y: 64,
    z: 1000
  },
  balance: 50000,
  public: true,
  mayor: "C.C.F.N",
  nation: {
    capital: "C.C.F.N",
    balance: 100000,
    name: "Nordics"
  },
  created: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
  resident_count: 15,
  name: "C.C.F.N",
  residents: 15,
  mayor_uuid: "12345678-1234-1234-1234-123456789abc",
  open: true
};

// Updated mock residents to match the real API structure
const mockResidents: TownResident[] = [
  {
    is_mayor: true,
    is_king: false,
    joined: Date.now() - (365 * 24 * 60 * 60 * 1000),
    name: "_Bamson",
    last_online: Date.now(),
    uuid: "8e194000-71dd-4fbc-b27b-41ba2e8d5086"
  },
  {
    is_mayor: false,
    is_king: false,
    joined: Date.now() - (180 * 24 * 60 * 60 * 1000),
    name: "EiraHS",
    last_online: Date.now() - (2 * 60 * 60 * 1000),
    uuid: "1c8b05ad-3983-4da0-bcc2-cc10242f81d9"
  },
  {
    is_mayor: false,
    is_king: false,
    joined: Date.now() - (90 * 24 * 60 * 60 * 1000),
    name: "BOBB0",
    last_online: Date.now() - (24 * 60 * 60 * 1000),
    uuid: "d223767b-1819-4818-967d-5d80ecb0fe52"
  }
];

const mockPlots: TownPlot[] = [
  {
    world: "world",
    resident_uuid: "12345678-1234-1234-1234-123456789abc",
    price: 0,
    x: 1000,
    for_sale: false,
    z: 1000,
    type: "shop",
    resident: "C.C.F.N"
  },
  {
    world: "world",
    resident_uuid: "87654321-4321-4321-4321-cba987654321",
    price: 0,
    x: 1005,
    for_sale: false,
    z: 1005,
    type: "embassy",
    resident: "Player2"
  },
  {
    world: "world",
    resident_uuid: null,
    price: 5000,
    x: 1010,
    for_sale: true,
    z: 1010,
    type: "shop",
    resident: null
  }
];

const mockTransactions: TownTransaction[] = [
  {
    id: 1,
    town: "C.C.F.N",
    type: "deposit",
    amount: 10000,
    timestamp: Date.now() - (24 * 60 * 60 * 1000),
    description: "Town tax collection"
  },
  {
    id: 2,
    town: "C.C.F.N",
    type: "withdrawal",
    amount: -5000,
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
    description: "Plot purchase"
  }
];

export interface TownApiData {
  capital: boolean;
  spawn: {
    world: string;
    x: number;
    y: number;
    z: number;
  };
  balance: number;
  public: boolean;
  mayor: string;
  nation: {
    capital: string;
    balance: number;
    name: string;
  };
  created: number;
  resident_count: number;
  name: string;
  residents: number;
  mayor_uuid: string;
  open: boolean;
}

export interface TownResident {
  is_mayor: boolean;
  is_king: boolean;
  joined: number;
  name: string;
  last_online: number;
  uuid: string;
}

export interface TownPlot {
  world: string;
  resident_uuid: string | null;
  price: number;
  x: number;
  for_sale: boolean;
  z: number;
  type: string;
  resident: string | null;
}

export interface TownTransaction {
  // Will be defined when we see actual transaction data
  [key: string]: any;
}

export class TownApiService {
  private static async fetchWithFallback<T>(url: string, mockData: T): Promise<T> {
    try {
      console.log(`Attempting to fetch from API: ${url}`);
      
      let response;
      
      // For external domains, try direct fetch first, then use proxy if needed
      if (isExternalDomain) {
        try {
          console.log('Trying direct fetch for external domain...');
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Direct fetch failed: ${response.statusText}`);
          }
        } catch (directError) {
          console.log('Direct fetch failed, trying CORS proxy...');
          // Use a different CORS proxy
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error(`Proxy fetch failed: ${response.statusText}`);
          }
        }
      } else {
        // Direct fetch for localhost or same domain
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log(`Successfully fetched data from API: ${url}`, data);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch from API, trying Supabase function: ${error}`);
      
      // Try Supabase function as backup
      try {
        const townName = url.split('/towns/')[1]?.split('/')[0];
        if (townName) {
          console.log(`Attempting to fetch from Supabase function for town: ${townName}`);
          const { data: supabaseData, error: supabaseError } = await supabase.functions.invoke('get-town-residents', {
            body: { townName: decodeURIComponent(townName) }
          });
          
          if (supabaseError) {
            throw supabaseError;
          }
          
          if (supabaseData && supabaseData.success) {
            console.log(`Successfully fetched data from Supabase function:`, supabaseData);
            return supabaseData.data;
          }
        }
      } catch (supabaseError) {
        console.warn(`Supabase function also failed, using mock data: ${supabaseError}`);
      }
      
      console.log(`Using mock data for: ${url}`);
      return mockData;
    }
  }

  static async getTown(name: string): Promise<TownApiData> {
    const mockData = { ...mockTownData, name };
    return this.fetchWithFallback(
      `${API_BASE_URL}/towns/${encodeURIComponent(name)}`,
      mockData
    );
  }

  static async getTownResidents(name: string): Promise<TownResident[]> {
    console.log(`Fetching residents for town: ${name}`);
    const residents = await this.fetchWithFallback(
      `${API_BASE_URL}/towns/${encodeURIComponent(name)}/residents`,
      mockResidents
    );
    console.log(`Residents data for ${name}:`, residents);
    return residents;
  }

  static async getTownPlots(name: string): Promise<TownPlot[]> {
    return this.fetchWithFallback(
      `${API_BASE_URL}/towns/${encodeURIComponent(name)}/plots`,
      mockPlots
    );
  }

  static async getTownTransactions(name: string): Promise<TownTransaction[]> {
    return this.fetchWithFallback(
      `${API_BASE_URL}/towns/${encodeURIComponent(name)}/transactions`,
      mockTransactions
    );
  }

  static async getAllTowns(): Promise<TownApiData[]> {
    const mockTowns = [mockTownData];
    return this.fetchWithFallback(
      `${API_BASE_URL}/towns`,
      mockTowns
    );
  }

  // Test method to verify API connectivity
  static async testApiConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`${API_BASE_URL}/towns/Garvia/residents`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API test successful:', data);
        return true;
      } else {
        console.log('API test failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('API test failed with error:', error);
      return false;
    }
  }
} 