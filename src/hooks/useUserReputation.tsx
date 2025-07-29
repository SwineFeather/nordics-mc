import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserReputation {
  user_id: string;
  reputation_points: number;
  level: number;
  badges_earned: string[];
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface ReputationEvent {
  id: string;
  user_id: string;
  event_type: string;
  points_change: number;
  description: string | null;
  related_post_id: string | null;
  related_reply_id: string | null;
  related_reaction_id: string | null;
  created_at: string;
}

export const useUserReputation = (userId?: string) => {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [reputationHistory, setReputationHistory] = useState<ReputationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserReputation();
      fetchReputationHistory();
    }
  }, [userId]);

  const fetchUserReputation = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_reputation')
        .select(`
          *,
          user:profiles(id, full_name, email, avatar_url)
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setReputation(data);
    } catch (error) {
      console.error('Error fetching user reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReputationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('reputation_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReputationHistory(data || []);
    } catch (error) {
      console.error('Error fetching reputation history:', error);
    }
  };

  const getReputationLevel = (points: number): { level: number; title: string; color: string } => {
    const level = Math.max(1, Math.floor(points / 100) + 1);
    
    const titles = {
      1: { title: 'Newcomer', color: '#6b7280' },
      2: { title: 'Member', color: '#10b981' },
      3: { title: 'Regular', color: '#3b82f6' },
      4: { title: 'Contributor', color: '#8b5cf6' },
      5: { title: 'Expert', color: '#f59e0b' },
      6: { title: 'Master', color: '#ef4444' },
      7: { title: 'Legend', color: '#ec4899' },
      8: { title: 'Mythic', color: '#8b5cf6' },
      9: { title: 'Divine', color: '#fbbf24' },
      10: { title: 'Immortal', color: '#dc2626' }
    };

    return {
      level,
      ...titles[Math.min(level, 10) as keyof typeof titles]
    };
  };

  return {
    reputation,
    reputationHistory,
    loading,
    getReputationLevel,
    fetchUserReputation,
    fetchReputationHistory
  };
};

export const useReputationLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<UserReputation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_reputation')
        .select(`
          *,
          user:profiles(id, full_name, email, avatar_url)
        `)
        .order('reputation_points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboard,
    loading,
    fetchLeaderboard
  };
}; 