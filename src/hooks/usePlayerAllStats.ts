import { useQuery } from '@tanstack/react-query';
import { getAllStatsForPlayer } from '@/services/playerStatsService';

/**
 * React hook to fetch all stats for a player (flat and with metadata).
 * @param uuid Player UUID
 */
export const usePlayerAllStats = (uuid: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['playerAllStats', uuid],
    queryFn: () => getAllStatsForPlayer(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000,
  });

  return {
    flatStats: data?.flatStats ?? {},
    statsWithMeta: data?.statsWithMeta ?? [],
    loading: isLoading,
    error,
  };
}; 