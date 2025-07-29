
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Nation {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  capital: string;
  leader: string;
  population: number;
  bank: string;
  daily_upkeep: string;
  founded: string;
  lore: string;
  government: string;
  motto: string;
  specialties: string[];
  history?: string;
  created_at: string;
  updated_at: string;
}

export interface Town {
  id: string;
  name: string;
  mayor: string;
  mayor_name?: string;
  population: number;
  type: string;
  status: string;
  founded: string;
  nation_id?: string;
  is_independent: boolean;
  level?: number;
  total_xp?: number;
  created_at: string;
  updated_at: string;
  nation?: {
    name: string;
    color: string;
    type: string;
  } | null;
}

export const useSupabaseNations = () => {
  const [nations, setNations] = useState<Nation[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch nations
      const { data: nationsData, error: nationsError } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (nationsError) throw nationsError;

      // Fetch towns without nation data first
      const { data: townsData, error: townsError } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (townsError) throw townsError;

      // Fetch nation data and mayor names for each town separately
      const townsWithNations = await Promise.all(
        (townsData || []).map(async (town) => {
          let nationData = null;
          let mayorName = town.mayor;

          // Fetch nation data if town has a nation
          if (town.nation_id) {
            try {
              const { data: nation, error: nationError } = await supabase
                .from('nations')
                .select('name, color, type')
                .eq('id', town.nation_id)
                .single();
              
              if (nation && !nationError) {
                nationData = nation;
              } else {
                console.warn('Could not fetch nation data for town:', town.name);
              }
            } catch (error) {
              console.warn('Error fetching nation data for town:', town.name, error);
            }
          }

          // Fetch mayor name if mayor is a UUID
          if (town.mayor && town.mayor.length > 20) { // Likely a UUID
            try {
              const { data: playerData, error: playerError } = await supabase
                .from('players')
                .select('name')
                .eq('uuid', town.mayor)
                .single();
              
              if (playerData && !playerError) {
                mayorName = playerData.name;
              } else {
                console.warn('Could not fetch mayor data for town:', town.name);
              }
            } catch (error) {
              console.warn('Error fetching mayor data for town:', town.name, error);
            }
          }

          return { 
            ...town, 
            nation: nationData,
            mayor_name: mayorName
          };
        })
      );

      setNations(nationsData || []);
      setTowns(townsWithNations || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching nations and towns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    nations,
    towns,
    loading,
    error,
    refetch: fetchData
  };
};
