import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerProfile } from './usePlayerProfile';

export const usePlayerProfileByUsername = (username: string) => {
  // First, get the UUID for the username
  const { data: playerData, isLoading: uuidLoading, error: uuidError } = useQuery({
    queryKey: ['playerByUsername', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data: playerData, error } = await supabase
        .from('players')
        .select('uuid, name')
        .ilike('name', username)
        .single();

      if (error) {
        console.error('Error fetching player by username:', error);
        return null;
      }

      return playerData;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Then, use the UUID to get the full profile
  const { profile, loading: profileLoading, error: profileError, refetch } = usePlayerProfile(
    playerData?.uuid || ''
  );

  return {
    profile,
    loading: uuidLoading || profileLoading,
    error: uuidError || profileError,
    refetch,
    uuid: playerData?.uuid || null,
  };
};

