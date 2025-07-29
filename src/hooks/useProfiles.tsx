
import { useNewPlayerStats } from './useNewPlayerStats';
import { usePlayerStatsOptimized } from './usePlayerStatsOptimized';
import { contactPlayer as contactPlayerService } from '@/services/profileService';

// Wrapper hook that can switch between old and new systems
export const useProfiles = ({ fetchAll }: { fetchAll: boolean } = { fetchAll: false }) => {
  // Try the new system first, fallback to old system
  const newStats = useNewPlayerStats({ limit: fetchAll ? -1 : 50 });
  const oldStats = usePlayerStatsOptimized({ limit: fetchAll ? -1 : 50 });

  // Use new system if we have data, otherwise fall back to old system
  const profiles = newStats.profiles.length > 0 || !newStats.error ? newStats.profiles : oldStats.profiles;
  const loading = newStats.profiles.length > 0 || !newStats.error ? newStats.loading : oldStats.loading;
  const total = newStats.profiles.length > 0 || !newStats.error ? newStats.total : oldStats.total;
  const hasMore = newStats.profiles.length > 0 || !newStats.error ? newStats.hasMore : oldStats.hasMore;
  const loadingMore = newStats.profiles.length > 0 || !newStats.error ? newStats.loadingMore : oldStats.loadingMore;
  const error = newStats.profiles.length > 0 || !newStats.error ? newStats.error : oldStats.error;

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
