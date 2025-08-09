
import { useNewPlayerStats } from './useNewPlayerStats';
import { usePlayerStatsOptimized } from './usePlayerStatsOptimized';
import { contactPlayer as contactPlayerService } from '@/services/profileService';

// Wrapper hook that can switch between old and new systems
export const useProfiles = ({ fetchAll }: { fetchAll: boolean } = { fetchAll: false }) => {
  // Try the new system first, fallback to old system
  const newStats = useNewPlayerStats({ limit: fetchAll ? -1 : 50 });
  const oldStats = usePlayerStatsOptimized({ limit: fetchAll ? -1 : 50 });

  // Prefer new system ONLY when it actually returns data; otherwise fall back to old system
  const useNew = newStats.profiles.length > 0;

  const profiles = useNew ? newStats.profiles : oldStats.profiles;
  const loading = useNew ? newStats.loading : oldStats.loading;
  const total = useNew ? newStats.total : oldStats.total;
  const hasMore = useNew ? newStats.hasMore : oldStats.hasMore;
  const loadingMore = useNew ? newStats.loadingMore : oldStats.loadingMore;
  const error = useNew ? newStats.error : oldStats.error;

  // Helper function to get profile by username
  const getProfileByUsername = (username: string) => {
    return profiles.find(profile => 
      profile.username.toLowerCase() === username.toLowerCase() ||
      profile.displayName?.toLowerCase() === username.toLowerCase()
    );
  };

  // Contact player function
  const contactPlayer = async (
    senderId: string,
    receiverId: string,
    subject: string,
    content: string,
    context?: string
  ) => {
    return await contactPlayerService(senderId, receiverId, subject, content, context);
  };

  return {
    profiles,
    loading,
    total,
    hasMore,
    loadingMore,
    error,
    getProfileByUsername,
    contactPlayer,
  };
};
