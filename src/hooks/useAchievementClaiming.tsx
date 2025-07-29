
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ClaimableAchievement {
  tier_id: string;
  achievement_id: string;
  achievement_name: string;
  tier_name: string;
  tier_description: string;
  points: number;
  tier_number: number;
  current_value: number;
  threshold: number;
  is_claimable: boolean;
}

export interface ClaimResult {
  success: boolean;
  xp_awarded?: number;
  new_total_xp?: number;
  new_level?: number;
  achievement_name?: string;
  tier_name?: string;
  message?: string;
}

export const useAchievementClaiming = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [claimableAchievements, setClaimableAchievements] = useState<ClaimableAchievement[]>([]);
  const { toast } = useToast();

  const fetchClaimableAchievements = useCallback(async (playerUuid: string) => {
    if (!playerUuid) {
      console.warn('No playerUuid provided to fetchClaimableAchievements');
      return [];
    }
    
    try {
      console.log('Fetching claimable achievements for player:', playerUuid);
      
      const { data, error } = await supabase.rpc('get_claimable_achievements', {
        p_player_uuid: playerUuid
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }
      
      console.log('Raw claimable achievements data:', data);
      
      const mappedAchievements: ClaimableAchievement[] = (data || []).map((item: any) => ({
        tier_id: item.tier_id,
        achievement_id: item.achievement_id,
        achievement_name: item.achievement_name,
        tier_name: item.tier_name,
        tier_description: item.tier_description,
        points: item.points,
        tier_number: item.tier_number,
        current_value: item.current_value,
        threshold: item.threshold,
        is_claimable: item.is_claimable
      }));
      
      setClaimableAchievements(mappedAchievements);
      
      console.log('DEBUG: Claimable achievements processed:', {
        playerUuid,
        total: mappedAchievements.length,
        claimable: mappedAchievements.filter(a => a.is_claimable).length,
        claimableAchievements: mappedAchievements.filter(a => a.is_claimable),
        allAchievements: mappedAchievements
      });
      
      return mappedAchievements;
    } catch (error) {
      console.error('Error fetching claimable achievements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch claimable achievements",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const claimAchievement = useCallback(async (playerUuid: string, tierId: string): Promise<ClaimResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('claim_achievement', {
        p_player_uuid: playerUuid,
        p_tier_id: tierId
      });

      if (error) throw error;

      const result = data as unknown as ClaimResult;
      
      if (result.success) {
        toast({
          title: "Achievement Claimed! 🎉",
          description: `You earned ${result.xp_awarded} XP for ${result.achievement_name} - ${result.tier_name}!`,
        });
        
        // Refresh claimable achievements
        await fetchClaimableAchievements(playerUuid);
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to claim achievement',
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error claiming achievement:', error);
      const failResult: ClaimResult = {
        success: false,
        message: 'An error occurred while claiming the achievement'
      };
      
      toast({
        title: "Error",
        description: failResult.message,
        variant: "destructive",
      });
      
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchClaimableAchievements]);

  const adminClaimAchievement = useCallback(async (
    adminUserId: string, 
    playerUuid: string, 
    tierId: string
  ): Promise<ClaimResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_claim_achievement', {
        p_admin_user_id: adminUserId,
        p_player_uuid: playerUuid,
        p_tier_id: tierId
      });

      if (error) throw error;

      const result = data as unknown as ClaimResult;
      
      if (result.success) {
        toast({
          title: "Achievement Claimed (Admin) 🎉",
          description: `Awarded ${result.xp_awarded} XP for ${result.achievement_name} - ${result.tier_name}`,
        });
        
        // Refresh claimable achievements
        await fetchClaimableAchievements(playerUuid);
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to claim achievement',
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Error with admin claim:', error);
      const failResult: ClaimResult = {
        success: false,
        message: 'An error occurred during admin claim'
      };
      
      toast({
        title: "Error",
        description: failResult.message,
        variant: "destructive",
      });
      
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchClaimableAchievements]);

  return {
    isLoading,
    claimableAchievements,
    fetchClaimableAchievements,
    claimAchievement,
    adminClaimAchievement,
  };
};
