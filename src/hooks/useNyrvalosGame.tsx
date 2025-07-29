import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Types for the political game
export interface Territory {
  id: string;
  name: string;
  owner: string;
  type: 'town' | 'nation' | 'claim';
  color: string;
  coordinates: { x: number; z: number };
  size: number;
  level: number;
  population: number;
  resources: string[];
  claims: Territory[];
  defense: number;
  military: number;
  wealth: number;
  influence: number;
  description?: string;
  founded?: string;
  lastUpdated?: string;
}

export interface Trail {
  id: string;
  name: string;
  start: { x: number; z: number };
  end: { x: number; z: number };
  type: 'road' | 'trade' | 'military';
  level: number;
  owner: string;
  description?: string;
  built?: string;
}

export interface Structure {
  id: string;
  name: string;
  type: 'castle' | 'fortress' | 'tower' | 'city' | 'outpost' | 'port' | 'mine' | 'farm';
  position: { x: number; z: number };
  owner: string;
  level: number;
  defense: number;
  population: number;
  description: string;
  built?: string;
  resources?: string[];
}

export interface Plot {
  id: number;
  town_id: number | null;
  town_name: string | null;
  world_name: string;
  x: number;
  z: number;
  plot_type: string | null;
  owner_uuid: string | null;
  owner_name: string | null;
  price: number | null;
  for_sale: boolean | null;
  market_value: number | null;
  created_at: string | null;
  last_updated: string | null;
}

export interface PlayerStats {
  gold: number;
  influence: number;
  military: number;
  defense: number;
  territories: number;
  population: number;
  level: number;
  experience: number;
}

export type GameMode = 'view' | 'claim' | 'build' | 'diplomacy' | 'military';

export interface GameState {
  territories: Territory[];
  trails: Trail[];
  structures: Structure[];
  plots: Plot[];
  selectedTerritory: Territory | null;
  gameMode: GameMode;
  playerStats: PlayerStats;
  showTerritories: boolean;
  showTrails: boolean;
  showStructures: boolean;
  showPlots: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showChunks: boolean;
  cameraPosition: { x: number; y: number; z: number };
  zoom: number;
  loading: boolean;
  error: string | null;
}

// Generate a random color for a town
const generateTownColor = (townName: string): string => {
  // Use a hash of the town name to generate consistent colors
  let hash = 0;
  for (let i = 0; i < townName.length; i++) {
    const char = townName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate RGB values from the hash
  const r = Math.abs(hash) % 200 + 55; // 55-255 range for good visibility
  const g = Math.abs(hash >> 8) % 200 + 55;
  const b = Math.abs(hash >> 16) % 200 + 55;
  
  return `rgb(${r}, ${g}, ${b})`;
};

const initialPlayerStats: PlayerStats = {
  gold: 1000,
  influence: 50,
  military: 100,
  defense: 25,
  territories: 0,
  population: 0,
  level: 1,
  experience: 0
};

const useNyrvalosGame = () => {
  const { user, profile } = useAuth();
  const [state, setState] = useState<GameState>({
    territories: [],
    trails: [],
    structures: [],
    plots: [],
    selectedTerritory: null,
    gameMode: 'view',
    playerStats: initialPlayerStats,
    showTerritories: true,
    showTrails: true,
    showStructures: true,
    showPlots: true, // Enable plots by default
    showGrid: false,
    showLabels: true,
    showChunks: false, // Keep chunk grid off by default to avoid visual artifacts
    cameraPosition: { x: 0, y: 10, z: 5 },
    zoom: 1,
    loading: true,
    error: null
  });

    // Load territories from Supabase
  const loadTerritories = useCallback(async () => {
    try {
      console.log('Starting to load territories...');
      
      // Try to load from database first
      const { data: towns, error: townsError } = await supabase
        .from('towns')
        .select('*');
      
      if (townsError) {
        console.error('Database error loading towns:', townsError);
        // Fallback to mock data
        const territoriesData: Territory[] = [
          {
            id: 'town_1',
            name: 'Test Town',
            owner: 'Test Mayor',
            type: 'town',
            color: '#3B82F6',
            coordinates: { x: 0, z: 0 },
            size: 1,
            level: 1,
            population: 10,
            resources: [],
            claims: [],
            defense: 0,
            military: 0,
            wealth: 0,
            influence: 0,
            description: 'Test town',
            founded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        ];
        setState(prev => ({ ...prev, territories: territoriesData }));
        return;
      }

      // Transform towns data to territories
      const territoriesData: Territory[] = (towns || []).map(town => ({
        id: `town_${town.id}`,
        name: town.name || 'Unknown Town',
        owner: town.mayor_name || town.mayor || 'Unknown Mayor',
        type: 'town',
        color: generateTownColor(town.name || 'Unknown'),
        coordinates: { 
          x: town.location_x || 0, 
          z: town.location_z || 0 
        },
        size: town.residents_count || 1,
        level: town.level || 1,
        population: town.residents_count || 0,
        resources: [],
        claims: [],
        defense: 0,
        military: 0,
        wealth: Number(town.balance) || 0,
        influence: 0,
        description: town.board || '',
        founded: town.created_at || new Date().toISOString(),
        lastUpdated: town.last_updated || new Date().toISOString()
      }));

      console.log('Territories loaded from database:', territoriesData.length);
      setState(prev => ({ 
        ...prev, 
        territories: territoriesData
      }));
    } catch (error) {
      console.error('Error loading territories:', error);
      // Fallback to mock data
      const territoriesData: Territory[] = [
        {
          id: 'town_1',
          name: 'Test Town',
          owner: 'Test Mayor',
          type: 'town',
          color: '#3B82F6',
          coordinates: { x: 0, z: 0 },
          size: 1,
          level: 1,
          population: 10,
          resources: [],
          claims: [],
          defense: 0,
          military: 0,
          wealth: 0,
          influence: 0,
          description: 'Test town',
          founded: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ];
      setState(prev => ({ ...prev, territories: territoriesData }));
    }
  }, []);

  // Load trails from Supabase
  const loadTrails = useCallback(async () => {
    try {
      console.log('Loading trails from database...');
      
      const { data: trails, error: trailsError } = await supabase
        .from('trail_paths')
        .select('*');
      
      if (trailsError) {
        console.error('Database error loading trails:', trailsError);
        // Fallback to mock data
        const mockTrails: Trail[] = [
          {
            id: '1',
            name: 'Northern Road',
            start: { x: 0, z: 0 },
            end: { x: 500, z: 0 },
            type: 'road',
            level: 1,
            owner: 'Kingdom of Nordheim',
            description: 'Main road to the north'
          },
          {
            id: '2',
            name: 'Eastern Trade Route',
            start: { x: 0, z: 0 },
            end: { x: 0, z: 300 },
            type: 'trade',
            level: 2,
            owner: 'Merchant Guild',
            description: 'Trade route to the east'
          }
        ];
        setState(prev => ({ ...prev, trails: mockTrails }));
        return;
      }

      // Parse tracked_path for each trail
      const parsedTrails = (trails || []).map(trail => {
        let points: { x: number; z: number }[] = [];
        try {
          const pathArr = Array.isArray(trail.tracked_path)
            ? trail.tracked_path
            : JSON.parse(trail.tracked_path || '[]');
          points = pathArr
            .filter(pt => pt && typeof pt === 'object' && Number.isFinite(pt.x) && Number.isFinite(pt.z))
            .map((pt: any) => ({ x: pt.x, z: pt.z }));
        } catch (e) {
          console.warn('Failed to parse trail path:', e);
        }
        
        // Defensive: only create trail if at least two points
        if (points.length < 2) return null;
        
        return {
          id: String(trail.id),
          name: trail.name,
          start: points[0],
          end: points[points.length - 1],
          type: trail.type || 'road', // fallback if missing
          level: trail.level || 1,
          owner: trail.owner || '',
          description: trail.description,
          built: trail.built
        };
      }).filter(Boolean); // Remove nulls
      
      console.log('Trails loaded from database:', parsedTrails.length);
      setState(prev => ({ ...prev, trails: parsedTrails }));
    } catch (error) {
      console.error('Error loading trails:', error);
      // Fallback to mock data
      const mockTrails: Trail[] = [
        {
          id: '1',
          name: 'Northern Road',
          start: { x: 0, z: 0 },
          end: { x: 500, z: 0 },
          type: 'road',
          level: 1,
          owner: 'Kingdom of Nordheim',
          description: 'Main road to the north'
        }
      ];
      setState(prev => ({ ...prev, trails: mockTrails }));
    }
  }, []);

  // Load plots from Supabase
  const loadPlots = useCallback(async () => {
    try {
      console.log('=== LOADING PLOTS ===');
      console.log('Loading plots from database...');
      
      // Try to load from database first
      const { data: plots, error: plotsError } = await supabase
        .from('plots')
        .select('id, town_name, world_name, x, z');
      
      if (plotsError) {
        console.error('Database error loading plots:', plotsError);
        // Fallback to mock data
        const mockPlots: Plot[] = [
          {
            id: 1,
            town_id: 1,
            town_name: 'Test Town',
            world_name: 'world',
            x: 0,
            z: 0,
            plot_type: 'residential',
            owner_uuid: null,
            owner_name: null,
            price: 1000,
            for_sale: true,
            market_value: 1200,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          },
          {
            id: 2,
            town_id: 1,
            town_name: 'Test Town',
            world_name: 'world',
            x: 1,
            z: 0,
            plot_type: 'commercial',
            owner_uuid: null,
            owner_name: null,
            price: 1500,
            for_sale: true,
            market_value: 1800,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          }
        ];
        setState(prev => ({ ...prev, plots: mockPlots }));
        return;
      }

      console.log('Plots loaded from database:', plots?.length || 0, 'plots');
      if (plots && plots.length > 0) {
        console.log('Sample plot:', plots[0]);
        console.log('World names found:', [...new Set(plots.map(p => p.world_name))]);
        console.log('X range:', Math.min(...plots.map(p => p.x)), 'to', Math.max(...plots.map(p => p.x)));
        console.log('Z range:', Math.min(...plots.map(p => p.z)), 'to', Math.max(...plots.map(p => p.z)));
      } else {
        console.log('No plots found in database, using mock data');
        // Use mock data if no plots in database
        const mockPlots: Plot[] = [
          {
            id: 1,
            town_id: 1,
            town_name: 'Test Town',
            world_name: 'world',
            x: 0,
            z: 0,
            plot_type: 'residential',
            owner_uuid: null,
            owner_name: null,
            price: 1000,
            for_sale: true,
            market_value: 1200,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          }
        ];
        setState(prev => ({ ...prev, plots: mockPlots }));
        return;
      }

      // Transform the data to match our Plot interface
      const transformedPlots = (plots || []).map(plot => ({
        id: plot.id,
        town_id: null, // Not available in current table
        town_name: plot.town_name,
        world_name: plot.world_name,
        x: plot.x, // chunk X coordinate
        z: plot.z, // chunk Y coordinate (mapped to z for our interface)
        plot_type: null,
        owner_uuid: null,
        owner_name: null,
        price: null,
        for_sale: null,
        market_value: null,
        created_at: null,
        last_updated: null
      }));

      console.log('Transformed plots sample:', transformedPlots.slice(0, 3));
      console.log('Total transformed plots:', transformedPlots.length);

      setState(prev => {
        const newState = { ...prev, plots: transformedPlots };
        console.log('Updated state with plots:', { plotsCount: newState.plots.length, showPlots: newState.showPlots });
        return newState;
      });
    } catch (error) {
      console.error('Error loading plots:', error);
      // Fallback to mock data
      const mockPlots: Plot[] = [
        {
          id: 1,
          town_id: 1,
          town_name: 'Test Town',
          world_name: 'world',
          x: 0,
          z: 0,
          plot_type: 'residential',
          owner_uuid: null,
          owner_name: null,
          price: 1000,
          for_sale: true,
          market_value: 1200,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      ];
      setState(prev => ({ ...prev, plots: mockPlots }));
    }
  }, []);

  // Load structures (using sample data for now)
  const loadStructures = useCallback(async () => {
    // Use sample structures since we're skipping database for now
    const sampleStructures: Structure[] = [
      {
        id: '1',
        name: 'Nordheim Castle',
        type: 'castle',
        position: { x: 0, z: 0 },
        owner: 'Kingdom of Nordheim',
        level: 3,
        defense: 150,
        population: 500,
        description: 'The grand castle of the northern kingdom'
      },
      {
        id: '2',
        name: 'Eastern Fortress',
        type: 'fortress',
        position: { x: 800, z: 200 },
        owner: 'Eastern Alliance',
        level: 2,
        defense: 100,
        population: 300,
        description: 'Strategic fortress guarding the eastern border'
      },
      {
        id: '3',
        name: 'Trade Port',
        type: 'port',
        position: { x: -600, z: 400 },
        owner: 'Merchant Guild',
        level: 1,
        defense: 50,
        population: 200,
        description: 'Busy trading port on the southern coast'
      }
    ];
    setState(prev => ({ ...prev, structures: sampleStructures }));
  }, []);

  // Load player stats (using default values for now)
  const loadPlayerStats = useCallback(async () => {
    // Use default stats since we don't need to load from database
    setState(prev => ({
      ...prev,
      playerStats: {
        gold: 1000,
        influence: 50,
        military: 100,
        defense: 25,
        territories: 0,
        population: 0,
        level: 1,
        experience: 0
      }
    }));
  }, []);

  // Initialize game data - simplified
  useEffect(() => {
    const initializeGame = async () => {
      console.log('=== INITIALIZING GAME DATA ===');
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Loading timeout reached, forcing completion');
        setState(prev => ({ ...prev, loading: false }));
      }, 10000); // 10 second timeout
      
      try {
        // Load all data in parallel for better performance
        await Promise.all([
          loadTerritories(),
          loadTrails(),
          loadPlots(),
          loadStructures(),
          loadPlayerStats()
        ]);
        
        clearTimeout(timeoutId);
        console.log('All data loaded successfully');
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error initializing game data:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to initialize game data' 
        }));
      }
    };

    initializeGame();
  }, [loadTerritories, loadTrails, loadPlots, loadStructures, loadPlayerStats]);

  // Game actions
  const selectTerritory = useCallback((territory: Territory | null) => {
    setState(prev => ({ ...prev, selectedTerritory: territory }));
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    setState(prev => ({ ...prev, gameMode: mode }));
  }, []);

  const toggleLayer = useCallback((layer: keyof Pick<GameState, 'showTerritories' | 'showTrails' | 'showStructures' | 'showGrid' | 'showLabels' | 'showChunks' | 'showPlots'>) => {
    console.log('Toggling layer:', layer);
    setState(prev => {
      const newState = { ...prev, [layer]: !prev[layer] };
      console.log('New state for', layer, ':', newState[layer]);
      return newState;
    });
  }, []);

  const updateCamera = useCallback((position: { x: number; y: number; z: number }, zoom: number) => {
    setState(prev => ({ 
      ...prev, 
      cameraPosition: position,
      zoom 
    }));
  }, []);

  const claimTerritory = useCallback(async (territoryId: string) => {
    if (!user) return false;

    try {
      // Add claim logic here
      console.log('Claiming territory:', territoryId);
      
      // Update player stats
      setState(prev => ({
        ...prev,
        playerStats: {
          ...prev.playerStats,
          territories: prev.playerStats.territories + 1,
          influence: prev.playerStats.influence + 10
        }
      }));

      return true;
    } catch (error) {
      console.error('Error claiming territory:', error);
      return false;
    }
  }, [user]);

  const buildStructure = useCallback(async (territoryId: string, structureType: Structure['type'], position: { x: number; z: number }) => {
    if (!user) return false;

    try {
      // Add build logic here
      console.log('Building structure:', structureType, 'at', position);
      
      // Update player stats
      setState(prev => ({
        ...prev,
        playerStats: {
          ...prev.playerStats,
          gold: prev.playerStats.gold - 100,
          defense: prev.playerStats.defense + 5
        }
      }));

      return true;
    } catch (error) {
      console.error('Error building structure:', error);
      return false;
    }
  }, [user]);

  const refreshData = useCallback(() => {
    loadTerritories();
    loadTrails();
    loadPlots(); // Added loadPlots here
    loadStructures();
    loadPlayerStats();
  }, [loadTerritories, loadTrails, loadPlots, loadStructures, loadPlayerStats]);

  return {
    ...state,
    selectTerritory,
    setGameMode,
    toggleLayer,
    updateCamera,
    claimTerritory,
    buildStructure,
    refreshData
  };
};

export default useNyrvalosGame; 