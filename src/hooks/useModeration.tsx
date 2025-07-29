import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ModerationAction {
  id: string;
  moderator_id: string;
  action_type: string;
  target_user_id?: string;
  target_post_id?: string;
  target_reply_id?: string;
  reason?: string;
  details?: string;
  duration_hours?: number;
  created_at: string;
  moderator?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface ContentReport {
  id: string;
  reporter_id?: string;
  report_type: string;
  report_status: string;
  target_post_id?: string;
  target_reply_id?: string;
  target_user_id?: string;
  reason: string;
  evidence?: string;
  moderator_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  reporter?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface ModerationQueueItem {
  id: string;
  content_type: string;
  content_id: string;
  report_count: number;
  first_reported_at: string;
  last_reported_at: string;
  priority: number;
  assigned_moderator_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWarning {
  id: string;
  user_id: string;
  moderator_id?: string;
  warning_type: string;
  reason: string;
  details?: string;
  acknowledged_at?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
  moderator?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export const useModeration = () => {
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      // Temporarily disable until migration is run
      setModerationQueue([]);
      return;
      
      // const { data, error } = await supabase
      //   .from('moderation_queue')
      //   .select('*')
      //   .order('priority', { ascending: false })
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // setModerationQueue(data || []);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      // Temporarily disable until migration is run
      setReports([]);
      return;
      
      // const { data, error } = await supabase
      //   .from('content_reports')
      //   .select(`
      //     *,
      //     reporter:profiles!content_reports_reporter_id_fkey(id, full_name, email)
      //   `)
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const reportContent = async (
    contentType: 'post' | 'reply' | 'user',
    contentId: string,
    reportType: string,
    reason: string,
    evidence?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add to moderation queue
      const { error: queueError } = await supabase.rpc('add_to_moderation_queue', {
        content_type_param: contentType,
        content_id_param: contentId,
        report_type_param: reportType,
        reporter_id_param: user.id
      });

      if (queueError) throw queueError;

      // Create detailed report
      const { error: reportError } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          report_type: reportType,
          target_post_id: contentType === 'post' ? contentId : null,
          target_reply_id: contentType === 'reply' ? contentId : null,
          target_user_id: contentType === 'user' ? contentId : null,
          reason,
          evidence
        });

      if (reportError) throw reportError;

      // Refresh queue
      await fetchModerationQueue();
      await fetchReports();

      return true;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  };

  const takeModerationAction = async (
    actionType: string,
    targetUserId?: string,
    targetPostId?: string,
    targetReplyId?: string,
    reason?: string,
    details?: string,
    durationHours?: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Log the moderation action
      const { error: actionError } = await supabase
        .from('forum_moderation_actions')
        .insert({
          moderator_id: user.id,
          action_type: actionType,
          target_user_id: targetUserId,
          target_post_id: targetPostId,
          target_reply_id: targetReplyId,
          reason,
          details,
          duration_hours: durationHours
        });

      if (actionError) throw actionError;

      // Handle specific actions
      switch (actionType) {
        case 'delete_post':
          if (targetPostId) {
            await supabase.from('forum_posts').delete().eq('id', targetPostId);
          }
          break;

        case 'delete_reply':
          if (targetReplyId) {
            await supabase.from('forum_replies').delete().eq('id', targetReplyId);
          }
          break;

        case 'lock_post':
          if (targetPostId) {
            await supabase.from('forum_posts').update({ is_locked: true }).eq('id', targetPostId);
          }
          break;

        case 'unlock_post':
          if (targetPostId) {
            await supabase.from('forum_posts').update({ is_locked: false }).eq('id', targetPostId);
          }
          break;

        case 'pin_post':
          if (targetPostId) {
            await supabase.from('forum_posts').update({ is_pinned: true }).eq('id', targetPostId);
          }
          break;

        case 'unpin_post':
          if (targetPostId) {
            await supabase.from('forum_posts').update({ is_pinned: false }).eq('id', targetPostId);
          }
          break;

        case 'ban_user':
          if (targetUserId && durationHours) {
            const bannedUntil = new Date();
            bannedUntil.setHours(bannedUntil.getHours() + durationHours);
            await supabase
              .from('profiles')
              .update({ banned_until: bannedUntil.toISOString() })
              .eq('id', targetUserId);
          }
          break;

        case 'unban_user':
          if (targetUserId) {
            await supabase
              .from('profiles')
              .update({ banned_until: null })
              .eq('id', targetUserId);
          }
          break;

        case 'mute_user':
          if (targetUserId && durationHours) {
            const mutedUntil = new Date();
            mutedUntil.setHours(mutedUntil.getHours() + durationHours);
            await supabase
              .from('profiles')
              .update({ muted_until: mutedUntil.toISOString() })
              .eq('id', targetUserId);
          }
          break;

        case 'unmute_user':
          if (targetUserId) {
            await supabase
              .from('profiles')
              .update({ muted_until: null })
              .eq('id', targetUserId);
          }
          break;
      }

      return true;
    } catch (error) {
      console.error('Error taking moderation action:', error);
      throw error;
    }
  };

  const issueWarning = async (
    userId: string,
    warningType: string,
    reason: string,
    details?: string,
    expiresAt?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_warnings')
        .insert({
          user_id: userId,
          moderator_id: user.id,
          warning_type: warningType,
          reason,
          details,
          expires_at: expiresAt
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error issuing warning:', error);
      throw error;
    }
  };

  const updateModerationQueue = async (
    queueId: string,
    status: string,
    assignedModeratorId?: string,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({
          status,
          assigned_moderator_id: assignedModeratorId,
          notes
        })
        .eq('id', queueId);

      if (error) throw error;
      await fetchModerationQueue();
      return true;
    } catch (error) {
      console.error('Error updating moderation queue:', error);
      throw error;
    }
  };

  const resolveReport = async (
    reportId: string,
    status: string,
    moderatorNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('content_reports')
        .update({
          report_status: status,
          moderator_notes: moderatorNotes,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      await fetchReports();
      return true;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  };

  const checkUserRestrictions = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_user_restricted', {
        user_id_param: userId
      });

      if (error) throw error;
      return data?.[0] || { is_banned: false, is_muted: false };
    } catch (error) {
      console.error('Error checking user restrictions:', error);
      return { is_banned: false, is_muted: false };
    }
  };

  useEffect(() => {
    fetchModerationQueue();
    fetchReports();
  }, []);

  return {
    moderationQueue,
    reports,
    loading,
    reportContent,
    takeModerationAction,
    issueWarning,
    updateModerationQueue,
    resolveReport,
    checkUserRestrictions,
    fetchModerationQueue,
    fetchReports
  };
}; 