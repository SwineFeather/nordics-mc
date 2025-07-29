import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerResidentData {
  uuid: string;
  name: string; // Minecraft username
  registered: string; // First time they joined the server
  activity_score: number; // 50=very inactive, 100=inactive, 200=joining sometimes, 400=active (influence score)
  last_login: string; // Last time they joined the server
  is_king: boolean; // TRUE means they are the leader of their nation
  is_mayor: boolean; // TRUE means they are the mayor of their town
  nation_name: string | null;
  town_name: string | null;
  balance?: number;
  // Add any other fields that exist in the residents table
  [key: string]: any;
}

export const usePlayerResidentData = (playerName?: string) => {
  const [data, setData] = useState<PlayerResidentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerName) {
      setData(null);
      return;
    }

    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the 'name' column for lookup
        const { data: residentData, error: residentError } = await supabase
          .from('residents')
          .select('*')
          .eq('name', playerName)
          .single();

        if (residentError) {
          setError(residentError.message);
          setData(null);
        } else {
          setData(residentData || null);
        }
      } catch (err) {
        console.error('Error fetching player resident data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerName]);

  return { data, loading, error };
};

// Hook to get player balance specifically
export const usePlayerBalance = (playerName?: string) => {
  const { data, loading, error } = usePlayerResidentData(playerName);
  
  return {
    balance: data?.balance || 0,
    loading,
    error
  };
};

// Optimized hook to get all players from residents table with React Query
export const useAllResidents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['allResidents'],
    queryFn: async () => {
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .order('name');

      if (residentsError) {
        throw residentsError;
      }

      return residentsData || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
    retry: 2,
    retryDelay: 1000,
  });

  return { 
    data: data || [], 
    loading: isLoading, 
    error: error?.message || null 
  };
}; 