
import { useQuery } from '@tanstack/react-query';
import { getLeaderboardFromNewStructure } from '@/services/newStatsService';

export const useNewStatLeaderboard = (statPath: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['newStatLeaderboard', statPath],
    queryFn: () => getLeaderboardFromNewStructure(statPath, 100),
    enabled: !!statPath,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every 1 hour
  });

  return { 
    leaderboardData: data ?? [], 
    loading: isLoading 
  };
};
