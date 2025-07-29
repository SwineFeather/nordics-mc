
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPlayersFromNewStructure } from '@/services/newStatsService';
import type { PlayerProfile } from '@/types/player';

interface PlayerStatsResponse {
  players: PlayerProfile[];
  count: number;
}

export const useNewPlayerStats = ({ limit }: { limit: number }) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['newPlayerStats', limit],
    queryFn: () => fetchPlayersFromNewStructure({ limit: limit === -1 ? -1 : limit, offset: 0 }),
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
  });

  const profiles = data?.players ?? [];
  const total = data?.count ?? 0;
  const hasMore = total > 0 && profiles.length < total;

  return {
    profiles,
    loading: isLoading,
    total,
    hasMore,
    loadingMore: isFetching && !isLoading,
    error,
  };
};
