import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PlayerTownService } from '@/services/playerTownService';

export interface UserNationForums {
  nationName: string;
  towns: {
    name: string;
    isUserMayor: boolean;
  }[];
}

export const useNationForumAccess = () => {
  const { user, profile } = useAuth();
  const [userNation, setUserNation] = useState<string | null>(null);
  const [userNationForums, setUserNationForums] = useState<UserNationForums | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccess = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin or moderator
        const isUserAdmin = profile.role === 'admin';
        const isUserModerator = profile.role === 'moderator';
        
        setIsAdmin(isUserAdmin);
        setIsModerator(isUserModerator);

        // If user is admin or moderator, they have access to all forums
        if (isUserAdmin || isUserModerator) {
          setUserNation('ALL'); // Special value to indicate access to all forums
          setLoading(false);
          return;
        }

        // For regular users, get their nation access
        const playerData = await PlayerTownService.getPlayerTownData(profile.minecraft_username);
        
        if (playerData?.nationName) {
          setUserNation(playerData.nationName);
          
          // Get town forums for user's nation
          const nationForums = await PlayerTownService.getUserNationForums(profile.minecraft_username);
          setUserNationForums(nationForums);
        }
      } catch (error) {
        console.error('Error fetching user nation access:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccess();
  }, [user, profile]);

  const hasAccessToForum = (forumNationName: string | null, forumTownName: string | null): boolean => {
    // Admins and moderators have access to all forums
    if (isAdmin || isModerator) {
      return true;
    }

    // If no user nation, no access
    if (!userNation) {
      return false;
    }

    // For nation forums
    if (forumNationName && !forumTownName) {
      return userNation === forumNationName;
    }

    // For town forums
    if (forumTownName) {
      return userNation === forumNationName;
    }

    return false;
  };

  return {
    userNation,
    userNationForums,
    isAdmin,
    isModerator,
    hasAccessToForum,
    loading
  };
}; 