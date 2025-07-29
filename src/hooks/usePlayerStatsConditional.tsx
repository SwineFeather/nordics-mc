import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchPlayerProfilesOptimized } from './usePlayerStatsOptimized';

interface PlayerStatsResponse {
  players: any[];
  count: number;
}

interface UsePlayerStatsConditionalProps {
  limit: number;
  offset?: number;
  skipDetailedStats?: boolean;
}

export const usePlayerStatsConditional = ({ 
  limit,
  offset = 0,
  skipDetailedStats = false 
}: UsePlayerStatsConditionalProps) => {
  const lastFetchTime = useRef<number>(0);
  const isPageVisible = useRef<boolean>(false);
  const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
    };

    // Set initial visibility
    isPageVisible.current = !document.hidden;
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['playerProfilesConditional', limit, offset, skipDetailedStats],
    queryFn: () => {
      lastFetchTime.current = Date.now();
      return fetchPlayerProfilesOptimized({ limit, offset, skipDetailedStats });
    },
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: 1000,
    staleTime: oneHourInMs, // Data is fresh for 1 hour
    refetchInterval: (query) => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Only refetch if:
      // 1. It's been more than 1 hour since last fetch
      // 2. The page is currently visible (someone is looking at it)
      if (timeSinceLastFetch >= oneHourInMs && isPageVisible.current) {
        console.log('Conditional refetch: Page visible and 1 hour passed');
        return 0; // Refetch immediately
      }
      
      // Don't refetch if page is not visible or not enough time has passed
      return false;
    },
  });

  const profiles = data?.players ?? [];
  const total = data?.count ?? 0;
  const hasMore = total > 0 && (offset + profiles.length) < total;

  return {
    profiles,
    loading: isLoading,
    total,
    hasMore,
    loadingMore: isFetching && !isLoading,
    error,
    refetch, // Expose refetch function for manual refresh if needed
  };
}; 