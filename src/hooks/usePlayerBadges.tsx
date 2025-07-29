
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerBadge {
  id: string;
  badge_type: string;
  badge_color: string;
  is_verified: boolean;
  assigned_at: string;
  assigned_by?: string;
  icon: string;
  icon_only: boolean;
}

export const usePlayerBadges = (playerUuid: string) => {
  return useQuery({
    queryKey: ['playerBadges', playerUuid],
    queryFn: async () => {
      if (!playerUuid) return [];
      
      const { data, error } = await supabase
        .from('player_badges')
        .select('*')
        .eq('player_uuid', playerUuid)
        .order('is_verified', { ascending: false })
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!playerUuid,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlayerVerificationStatus = (playerUuid: string) => {
  return useQuery({
    queryKey: ['playerVerificationStatus', playerUuid],
    queryFn: async () => {
      if (!playerUuid) return null;
      
      const { data, error } = await supabase
        .rpc('get_player_verification_status', { p_player_uuid: playerUuid });

      if (error) throw error;
      return data;
    },
    enabled: !!playerUuid,
    staleTime: 5 * 60 * 1000,
  });
};
