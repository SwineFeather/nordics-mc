import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlayerByUsername = (username: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['playerByUsername', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data: playerData, error } = await supabase
        .from('players')
        .select('uuid, username')
        .ilike('username', username)
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

  return {
    player: data || null,
    loading: isLoading,
    error,
  };
};