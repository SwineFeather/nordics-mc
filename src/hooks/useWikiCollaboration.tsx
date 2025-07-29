import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  WikiComment, 
  WikiSuggestedEdit, 
  WikiEditSession, 
  WikiCollaborationNotification, 
  WikiPageSubscription,
  EditConflict 
} from '@/types/wiki';
import { wikiCollaborationService } from '@/services/wikiCollaborationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Helper function to validate page ID (moved outside hook for Fast Refresh compatibility)
const isValidPageId = (id: string) => {
  // Return false for empty strings, temp-id, or invalid formats
  if (!id || id === 'temp-id' || id === '') return false;
  
  // Check if it's a valid UUID format or a valid slug format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const slugRegex = /^[a-z0-9-]+$/;
  
  return uuidRegex.test(id) || slugRegex.test(id);
};

export const useWikiCollaboration = (pageId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const isPageIdValid = isValidPageId(pageId);

  // Comments
  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['wiki-comments', pageId],
    queryFn: () => wikiCollaborationService.getComments(pageId),
    enabled: isPageIdValid,
    staleTime: 30000, // 30 seconds
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      wikiCollaborationService.addComment(pageId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-comments', pageId] });
      queryClient.invalidateQueries({ queryKey: ['wiki-comment-count', pageId] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      wikiCollaborationService.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-comments', pageId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => wikiCollaborationService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-comments', pageId] });
      queryClient.invalidateQueries({ queryKey: ['wiki-comment-count', pageId] });
    },
  });

  const resolveCommentMutation = useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      wikiCollaborationService.resolveComment(commentId, resolved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-comments', pageId] });
    },
  });

  // Suggested Edits
  const {
    data: suggestedEdits = [],
    isLoading: suggestedEditsLoading,
    refetch: refetchSuggestedEdits
  } = useQuery({
    queryKey: ['wiki-suggested-edits', pageId],
    queryFn: () => wikiCollaborationService.getSuggestedEdits(pageId),
    enabled: isPageIdValid,
    staleTime: 30000,
  });

  const submitSuggestedEditMutation = useMutation({
    mutationFn: ({ title, content, description }: { title: string; content: string; description?: string }) =>
      wikiCollaborationService.submitSuggestedEdit(pageId, title, content, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edits', pageId] });
      queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edit-count', pageId] });
    },
  });

  const reviewSuggestedEditMutation = useMutation({
    mutationFn: ({ editId, status, notes }: { editId: string; status: 'approved' | 'rejected' | 'merged'; notes?: string }) =>
      wikiCollaborationService.reviewSuggestedEdit(editId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edits', pageId] });
      queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edit-count', pageId] });
    },
  });

  // Edit Sessions and Conflicts
  const [currentSession, setCurrentSession] = useState<WikiEditSession | null>(null);
  const [conflicts, setConflicts] = useState<EditConflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const startEditSessionMutation = useMutation({
    mutationFn: () => wikiCollaborationService.startEditSession(pageId),
    onSuccess: (session) => {
      setCurrentSession(session);
    },
  });

  const endEditSessionMutation = useMutation({
    mutationFn: (sessionId: string) => wikiCollaborationService.endEditSession(sessionId),
    onSuccess: () => {
      setCurrentSession(null);
    },
  });

  const checkConflicts = useCallback(async () => {
    if (!user || !currentSession) return;

    try {
      setIsCheckingConflicts(true);
      const detectedConflicts = await wikiCollaborationService.checkEditConflicts(pageId, user.id);
      setConflicts(detectedConflicts);
    } catch (error) {
      console.error('Failed to check for conflicts:', error);
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [user, currentSession, pageId]);

  // Notifications
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['wiki-collaboration-notifications'],
    queryFn: () => wikiCollaborationService.getCollaborationNotifications(),
    enabled: !!user,
    staleTime: 30000,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => wikiCollaborationService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-collaboration-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['wiki-unread-notification-count'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => wikiCollaborationService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-collaboration-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['wiki-unread-notification-count'] });
    },
  });

  // Page Subscriptions
  const {
    data: pageSubscription,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription
  } = useQuery({
    queryKey: ['wiki-page-subscription', pageId],
    queryFn: () => wikiCollaborationService.getPageSubscription(pageId),
    enabled: isPageIdValid && !!user,
    staleTime: 60000, // 1 minute
  });

  const subscribeToPageMutation = useMutation({
    mutationFn: (notificationTypes?: string[]) => 
      wikiCollaborationService.subscribeToPage(pageId, notificationTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-page-subscription', pageId] });
    },
  });

  const unsubscribeFromPageMutation = useMutation({
    mutationFn: () => wikiCollaborationService.unsubscribeFromPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-page-subscription', pageId] });
    },
  });

  // Utility queries
  const { data: commentCount = 0 } = useQuery({
    queryKey: ['wiki-comment-count', pageId],
    queryFn: () => wikiCollaborationService.getCommentCount(pageId),
    enabled: isPageIdValid,
    staleTime: 60000,
  });

  const { data: suggestedEditCount = 0 } = useQuery({
    queryKey: ['wiki-suggested-edit-count', pageId],
    queryFn: () => wikiCollaborationService.getSuggestedEditCount(pageId),
    enabled: isPageIdValid,
    staleTime: 60000,
  });

  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ['wiki-unread-notification-count'],
    queryFn: () => wikiCollaborationService.getUnreadNotificationCount(),
    enabled: !!user,
    staleTime: 30000,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!isPageIdValid || !user) return;

    // Set up real-time subscription for comments
    const commentsChannel = supabase
      .channel(`wiki-comments-${pageId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'wiki_comments',
          filter: `page_id=eq.${pageId}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['wiki-comments', pageId] });
          queryClient.invalidateQueries({ queryKey: ['wiki-comment-count', pageId] });
        }
      )
      .subscribe();

    // Set up real-time subscription for suggested edits
    const suggestedEditsChannel = supabase
      .channel(`wiki-suggested-edits-${pageId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'wiki_suggested_edits',
          filter: `page_id=eq.${pageId}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edits', pageId] });
          queryClient.invalidateQueries({ queryKey: ['wiki-suggested-edit-count', pageId] });
        }
      )
      .subscribe();

    // Set up real-time subscription for edit sessions
    const editSessionsChannel = supabase
      .channel(`wiki-edit-sessions-${pageId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'wiki_edit_sessions',
          filter: `page_id=eq.${pageId}`
        }, 
        () => {
          // Check for conflicts when edit sessions change
          checkConflicts();
        }
      )
      .subscribe();

    // Set up real-time subscription for notifications
    const notificationsChannel = supabase
      .channel(`wiki-collaboration-notifications-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'wiki_collaboration_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['wiki-collaboration-notifications'] });
          queryClient.invalidateQueries({ queryKey: ['wiki-unread-notification-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(suggestedEditsChannel);
      supabase.removeChannel(editSessionsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [pageId, user, queryClient, checkConflicts]);

  // Activity tracking for edit sessions
  useEffect(() => {
    if (!currentSession) return;

    const activityInterval = setInterval(async () => {
      try {
        await wikiCollaborationService.updateEditSession(currentSession.id);
      } catch (error) {
        console.error('Failed to update edit session activity:', error);
      }
    }, 30000); // Update every 30 seconds

    const conflictCheckInterval = setInterval(() => {
      checkConflicts();
    }, 10000); // Check for conflicts every 10 seconds

    return () => {
      clearInterval(activityInterval);
      clearInterval(conflictCheckInterval);
    };
  }, [currentSession, checkConflicts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSession) {
        endEditSessionMutation.mutate(currentSession.id);
      }
    };
  }, [currentSession]);

  return {
    // Comments
    comments,
    commentsLoading,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    resolveComment: resolveCommentMutation.mutate,
    commentCount,

    // Suggested Edits
    suggestedEdits,
    suggestedEditsLoading,
    submitSuggestedEdit: submitSuggestedEditMutation.mutate,
    reviewSuggestedEdit: reviewSuggestedEditMutation.mutate,
    suggestedEditCount,

    // Edit Sessions and Conflicts
    currentSession,
    conflicts,
    isCheckingConflicts,
    startEditSession: startEditSessionMutation.mutate,
    endEditSession: endEditSessionMutation.mutate,
    checkConflicts,

    // Notifications
    notifications,
    notificationsLoading,
    markNotificationRead: markNotificationReadMutation.mutate,
    markAllNotificationsRead: markAllNotificationsReadMutation.mutate,
    unreadNotificationCount,

    // Page Subscriptions
    pageSubscription,
    subscriptionLoading,
    subscribeToPage: subscribeToPageMutation.mutate,
    unsubscribeFromPage: unsubscribeFromPageMutation.mutate,

    // Utility
    refetchComments,
    refetchSuggestedEdits,
    refetchNotifications,
    refetchSubscription,
  };
}; 