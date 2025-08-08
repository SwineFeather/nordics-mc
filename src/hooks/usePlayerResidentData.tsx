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

        if (!residentError && residentData) {
          setData(residentData || null);
          // If we already have a town_name, we're done
          if (residentData?.town_name) {
            return;
          }
        }

        // Fallback: resolve town via towns.residents JSONB when no residents row or missing town_name
        try {
          // Use JSONB containment to leverage the index on residents->name
          const { data: townRow, error: townsError } = await supabase
            .from('towns')
            .select('name, residents')
            .contains('residents', [{ name: playerName }])
            .maybeSingle();

          if (townsError) {
            // If we also had a residentError and townsError, prefer exposing the residentError
            if (residentError) {
              setError(residentError.message);
              setData(null);
              return;
            }
            // Otherwise, surface townsError
            setError(townsError.message);
            setData(residentData || null);
            return;
          }

          if (townRow && (townRow as any).name) {
            const resolvedTownName = (townRow as any).name as string;
            const residents = Array.isArray((townRow as any).residents) ? (townRow as any).residents : [];
            const matchedResident = residents.find((r: any) => r?.name === playerName) || null;
            // Merge with existing residentData when available, otherwise construct minimal object
            const merged: PlayerResidentData = {
              uuid: (residentData?.uuid as string) || (matchedResident?.uuid as string) || '',
              name: residentData?.name || matchedResident?.name || playerName,
              registered: (residentData?.registered as string) || new Date(0).toISOString(),
              activity_score: (residentData?.activity_score as number) || 0,
              last_login: (residentData?.last_login as string) || new Date(0).toISOString(),
              is_king: Boolean(residentData?.is_king) || false,
              is_mayor: Boolean(residentData?.is_mayor) || Boolean(matchedResident?.is_mayor) || false,
              nation_name: (residentData?.nation_name as string | null) || null,
              town_name: resolvedTownName,
              balance: residentData?.balance,
              // Spread any remaining resident fields we might have fetched
              ...(residentData || {}),
            } as PlayerResidentData;

            setData(merged);
            return;
          }

          // If no town was resolved and there was an error from residents table, expose it
          if (residentError) {
            setError(residentError.message);
            setData(null);
            return;
          }

          // Otherwise keep whatever we had (may be null)
          setData(residentData || null);
        } catch (fallbackErr) {
          console.error('Error resolving town from towns.residents JSONB:', fallbackErr);
          if (residentError) {
            setError(residentError.message);
            setData(null);
          } else {
            setError(fallbackErr instanceof Error ? fallbackErr.message : 'Failed to resolve town from towns table');
            setData(residentData || null);
          }
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